"use client";

import { Download, ExternalLink, FileWarning, LoaderCircle, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { getDocumentFile, saveDocumentFile } from "@/lib/document-file-storage";
import { ApplicationDocument } from "@/lib/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function DocumentActions({ document, compact = false, onReplace }: { document: ApplicationDocument; compact?: boolean; onReplace?: (document: ApplicationDocument) => void }) {
  const [loading, setLoading] = useState<"open" | "download" | null>(null);
  const [missing, setMissing] = useState(false);
  const stored = document.storageKind === "indexeddb";

  if (!stored || missing) {
    return onReplace
      ? <DocumentRecovery document={document} compact={compact} onReplace={(replacement) => { setMissing(false); onReplace(replacement); }} />
      : <span className="inline-flex items-center gap-1.5 text-[11px] leading-4 text-slate-400" title="Ранее demo сохраняло только название файла"><FileWarning className="h-3.5 w-3.5 shrink-0" /> Только имя — загрузите файл заново</span>;
  }

  const open = async () => {
    const preview = window.open("about:blank", "_blank");
    try {
      setLoading("open");
      const file = await getRequiredFile(document);
      const url = URL.createObjectURL(file.blob);
      if (preview) preview.location.href = url;
      else window.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      preview?.close();
      setMissing(true);
      reportError("Не удалось открыть документ", error);
    } finally {
      setLoading(null);
    }
  };

  const download = async () => {
    try {
      setLoading("download");
      const file = await getRequiredFile(document);
      const url = URL.createObjectURL(file.blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (error) {
      setMissing(true);
      reportError("Не удалось скачать документ", error);
    } finally {
      setLoading(null);
    }
  };

  const buttonClass = `inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-paper font-semibold text-moss-800 transition hover:border-moss-300 hover:bg-moss-50 disabled:opacity-50 ${compact ? "min-h-9 px-2.5 text-[11px]" : "min-h-10 px-3 text-xs"}`;
  return <div className="flex flex-wrap items-center gap-2"><button type="button" className={buttonClass} disabled={loading !== null} onClick={open}>{loading === "open" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}Открыть</button><button type="button" className={buttonClass} disabled={loading !== null} onClick={download}>{loading === "download" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}Скачать</button></div>;
}

function DocumentRecovery({ document, compact, onReplace }: { document: ApplicationDocument; compact: boolean; onReplace: (document: ApplicationDocument) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const replace = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Файл больше 10 МБ. Выберите файл меньшего размера" }));
      return;
    }
    try {
      setLoading(true);
      await saveDocumentFile(document.id, file);
      onReplace({ ...document, name: file.name, mimeType: file.type, size: file.size, storageKind: "indexeddb" });
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: `Файл «${file.name}» сохранён в браузере` }));
    } catch (error) {
      reportError("Не удалось сохранить документ", error);
    } finally {
      setLoading(false);
    }
  };

  const buttonClass = `inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-paper font-semibold text-moss-800 transition hover:border-moss-300 hover:bg-moss-50 disabled:opacity-50 ${compact ? "min-h-9 px-2.5 text-[11px]" : "min-h-10 px-3 text-xs"}`;
  return <div className="flex flex-wrap items-center gap-2"><input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void replace(file); event.target.value = ""; }} /><span className="inline-flex items-center gap-1.5 text-[11px] leading-4 text-slate-400"><FileWarning className="h-3.5 w-3.5 shrink-0" /> Сохранено только имя</span><button type="button" className={buttonClass} disabled={loading} onClick={() => inputRef.current?.click()}>{loading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />} Загрузить заново</button></div>;
}

async function getRequiredFile(document: ApplicationDocument) {
  const file = await getDocumentFile(document.id);
  if (!file) throw new Error(`Содержимое файла ${document.name} не найдено в IndexedDB.`);
  return file;
}

function reportError(message: string, error: unknown) {
  console.error(`${message}:`, error);
  window.dispatchEvent(new CustomEvent("mm-toast", { detail: `${message}. Загрузите файл заново` }));
}
