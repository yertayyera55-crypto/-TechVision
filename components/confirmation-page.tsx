"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText, PackageCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Logo } from "@/components/logo";
import { PrimaryButton, SecondaryButton, secondaryLinkClass } from "@/components/ui/buttons";
import { useApplications } from "@/lib/application-store";
import { formatCurrency, formatDate } from "@/lib/format";

type Result = "confirmed" | "mismatch" | "not_received" | null;

export function ConfirmationPage({ token }: { token: string }) {
  const id = token.match(/(\d+)$/)?.[1] ?? "";
  const { applications, updateApplication, hydrated } = useApplications();
  const application = useMemo(() => applications.find((item) => item.id === id), [applications, id]);
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  const respond = async (next: Exclude<Result, null>) => {
    if (!application) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    if (next === "confirmed") updateApplication(id, { status: "precheck_passed", confirmedAt: new Date().toISOString() });
    else updateApplication(id, { status: "rejected" });
    setResult(next);
    setLoading(false);
  };

  if (!application) return <ConfirmationFrame><div className="py-16 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-amber-700" /><h1 className="mt-5 font-display text-3xl font-medium">{hydrated ? "Ссылка недействительна" : "Проверяем ссылку"}</h1><p className="mt-3 text-sm text-muted">{hydrated ? "Запросите новую ссылку у поставщика." : "Это займёт несколько секунд."}</p></div></ConfirmationFrame>;
  if (result || application.status !== "awaiting_confirmation") {
    const savedResult = application.status === "rejected" ? "mismatch" : "confirmed";
    return <ConfirmationResult result={result ?? savedResult} id={id} />;
  }

  return <ConfirmationFrame>
    <header className="border-b border-line pb-6"><p className="eyebrow mb-2">Подтверждение поставки</p><h1 className="font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">Tea Local LLP</h1><p className="mt-3 text-sm leading-6 text-muted">Поставщик просит подтвердить фактические данные поставки. Регистрация не требуется.</p></header>
    <section className="py-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-50 text-moss-700"><PackageCheck className="h-5 w-5" /></span><div><p className="text-xs text-slate-500">Заявка №{application.id}</p><h2 className="font-semibold">{application.network}</h2></div></div><dl className="divide-y divide-line border-y border-line"><ConfirmRow label="Номер накладной" value={application.invoiceNumber} /><ConfirmRow label="Сумма поставки" value={formatCurrency(application.amount)} /><ConfirmRow label="Дата поставки" value={formatDate(application.deliveryDate)} /><ConfirmRow label="Оплата по договору" value={formatDate(application.paymentDate)} /></dl></section>
    <section className="border-b border-line pb-6"><h2 className="mb-3 text-sm font-semibold">Документы</h2><div className="space-y-2">{application.documents.map((document) => <div key={document.id} className="flex items-center gap-3 bg-canvas px-3 py-2.5"><FileText className="h-4 w-4 text-moss-700" /><span className="min-w-0 flex-1 truncate text-sm">{document.name}</span><span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Только просмотр</span></div>)}</div></section>
    <div className="mt-6 grid gap-3"><PrimaryButton type="button" loading={loading} onClick={() => respond("confirmed")}><CheckCircle2 className="h-4 w-4" /> Подтвердить поставку</PrimaryButton><SecondaryButton type="button" disabled={loading} onClick={() => respond("mismatch")}>Данные не совпадают</SecondaryButton><button type="button" disabled={loading} onClick={() => respond("not_received")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-300 bg-transparent px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"><XCircle className="h-4 w-4" /> Товар не получен</button></div>
    <p className="mt-5 text-center text-xs leading-5 text-slate-400">Ответ будет зафиксирован в заявке поставщика. Mighty Miners не принимает финансовое решение.</p>
  </ConfirmationFrame>;
}

function ConfirmationFrame({ children }: { children: React.ReactNode }) { return <main className="min-h-screen px-4 py-5 sm:py-10"><div className="mx-auto max-w-xl"><div className="mb-6 flex justify-center"><Logo /></div><div className="animate-scale-in border-y border-line bg-paper px-4 py-7 shadow-soft sm:rounded-xl sm:border sm:p-8">{children}</div></div></main>; }
function ConfirmRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-slate-500">{label}</dt><dd className="text-right text-sm font-semibold text-ink">{value}</dd></div>; }
function ConfirmationResult({ result, id }: { result: Exclude<Result, null>; id: string }) {
  const confirmed = result === "confirmed";
  return <ConfirmationFrame><div className="py-10 text-center"><span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${confirmed ? "bg-moss-50 text-moss-700" : "bg-red-50 text-red-700"}`}>{confirmed ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}</span><p className="eyebrow mt-6 mb-2">Заявка №{id}</p><h1 className="font-display text-4xl font-medium tracking-tight">{confirmed ? "Поставка подтверждена" : result === "mismatch" ? "Несоответствие отправлено" : "Получение не подтверждено"}</h1><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted">{confirmed ? "Спасибо. Поставщик увидит обновлённый статус и предварительный расчёт." : "Поставщик получил ваш ответ и сможет уточнить данные."}</p><Link href={`/applications/${id}`} className={`${secondaryLinkClass} mt-7`}>Открыть demo-заявку</Link></div></ConfirmationFrame>;
}
