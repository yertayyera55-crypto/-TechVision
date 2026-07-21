import { spawn, spawnSync } from "node:child_process";
import { access, readFile, rm } from "node:fs/promises";
import net from "node:net";
import process from "node:process";

const MINIMUM_NODE = { major: 20, minor: 16 };
const noOpen = process.argv.includes("--no-open");
const help = process.argv.includes("--help") || process.argv.includes("-h");

if (help) {
  console.log(`
Mighty Miners — быстрый запуск

  npm run demo              установить зависимости и открыть приложение
  npm run demo -- --no-open запустить без автоматического открытия браузера
`);
  process.exit(0);
}

assertSupportedNode();

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

if (!(await exists("node_modules/next/package.json"))) {
  console.log("\n📦 Первый запуск: устанавливаю зависимости…\n");
  const install = spawnSync(npmCommand, ["ci"], { stdio: "inherit" });
  if (install.status !== 0) {
    console.error("\nНе удалось установить зависимости. Проверьте интернет и повторите npm run demo.");
    process.exit(install.status ?? 1);
  }
}

const runningServer = await findRunningDevServer();
if (runningServer) {
  console.log(`\n✅ Mighty Miners уже запущен: ${runningServer.url}`);
  console.log(`   PID: ${runningServer.pid}. Повторный сервер не требуется.\n`);
  if (!noOpen) openBrowser(runningServer.url);
  process.exit(0);
}

const port = await findFreePort(3000);
const url = `http://127.0.0.1:${port}`;

console.log(`\n⛏️  Запускаю Mighty Miners на ${url}\n`);

const server = spawn(
  npmCommand,
  ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)],
  { stdio: "inherit", env: { ...process.env, BROWSER: "none" } },
);

let serverExited = false;
server.once("exit", () => { serverExited = true; });

try {
  await waitUntilReady(url, () => serverExited);
  console.log(`\n✅ Mighty Miners готов: ${url}`);
  console.log("   Для остановки нажмите Ctrl+C.\n");
  if (!noOpen) openBrowser(url);
} catch (error) {
  console.error(`\nНе удалось запустить приложение: ${error instanceof Error ? error.message : error}`);
  server.kill("SIGTERM");
  process.exit(1);
}

const stop = (signal) => {
  if (!server.killed) server.kill(signal);
};

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

const exitCode = await new Promise((resolve) => {
  server.once("exit", (code, signal) => resolve(signal === "SIGINT" ? 0 : (code ?? 0)));
});

process.exit(exitCode);

function assertSupportedNode() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  const supported = major > MINIMUM_NODE.major || (major === MINIMUM_NODE.major && minor >= MINIMUM_NODE.minor);
  if (!supported) {
    console.error(`Нужен Node.js 20.16 или новее. Сейчас установлен ${process.versions.node}.`);
    console.error("Скачайте LTS-версию: https://nodejs.org/");
    process.exit(1);
  }
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function findFreePort(startPort) {
  for (let port = startPort; port < startPort + 20; port += 1) {
    if (await isPortFree(port)) return port;
  }
  throw new Error("Не найден свободный порт между 3000 и 3019.");
}

async function findRunningDevServer() {
  const lockPath = ".next/dev/lock";
  try {
    const lock = JSON.parse(await readFile(lockPath, "utf8"));
    if (!Number.isInteger(lock.pid) || !Number.isInteger(lock.port)) return null;

    if (!isProcessRunning(lock.pid)) {
      await rm(lockPath, { force: true });
      return null;
    }

    const url = typeof lock.appUrl === "string"
      ? lock.appUrl
      : `http://${typeof lock.hostname === "string" ? lock.hostname : "127.0.0.1"}:${lock.port}`;

    console.log(`\n⏳ Найден уже запущенный сервер Next.js: ${url}`);
    return { pid: lock.pid, url };
  } catch (error) {
    if (error instanceof SyntaxError) {
      await rm(lockPath, { force: true });
    }
    return null;
  }
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.unref();
    probe.once("error", () => resolve(false));
    probe.listen({ host: "127.0.0.1", port }, () => probe.close(() => resolve(true)));
  });
}

async function waitUntilReady(url, hasExited) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (hasExited()) throw new Error("процесс Next.js завершился раньше времени");
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Сервер ещё компилирует приложение — продолжаем проверять.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("сервер не ответил за 60 секунд");
}

function openBrowser(url) {
  const command = process.platform === "darwin"
    ? ["open", [url]]
    : process.platform === "win32"
      ? ["cmd", ["/c", "start", "", url]]
      : ["xdg-open", [url]];

  const opener = spawn(command[0], command[1], { detached: true, stdio: "ignore" });
  opener.unref();
}
