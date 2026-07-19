"use client";

import Link from "next/link";
import { Copy, ExternalLink, RefreshCw, Timer } from "lucide-react";
import { useState } from "react";
import { ConfirmationStatusBadge } from "@/components/confirmation-status-badge";
import { ReminderHistory } from "@/components/reminder-history";
import { PrimaryButton, SecondaryButton, secondaryLinkClass } from "@/components/ui/buttons";
import { daysBetween } from "@/lib/calculate-deal-dates";
import { formatDateTime } from "@/lib/format";
import { Application } from "@/lib/types";

export function DeliveryConfirmationPanel({ application, onUpdate }: { application: Application; onUpdate: (update: Partial<Application>) => void }) {
  const [loading, setLoading] = useState(false);
  const confirmationLink = typeof window === "undefined" ? `/confirm/supply-${application.id}` : `${window.location.origin}/confirm/supply-${application.id}`;
  const requestedDate = application.confirmationRequestedAt?.slice(0, 10);
  const waitingDays = requestedDate ? Math.max(0, daysBetween(requestedDate, new Date().toISOString().slice(0, 10))) : 0;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(confirmationLink);
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Одноразовая ссылка скопирована" }));
    } catch {
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: confirmationLink }));
    }
  };

  const remind = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    onUpdate({ confirmationStatus: "reminder_sent", reminderCount: application.reminderCount + 1, lastReminderAt: new Date().toISOString() });
    setLoading(false);
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Напоминание отправлено покупателю" }));
  };

  const pending = application.confirmationStatus === "waiting" || application.confirmationStatus === "reminder_sent";
  return <section aria-labelledby="confirmation-heading" className="border-y border-amber-200 bg-amber-50/70 px-4 py-6 sm:rounded-lg sm:border sm:p-6">
    <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 ring-1 ring-amber-200"><Timer className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 id="confirmation-heading" className="text-xl font-semibold text-ink">Подтверждение поставки</h2><ConfirmationStatusBadge status={application.confirmationStatus} /></div><p className="mt-2 text-sm leading-6 text-slate-600">{pending ? "Без подтверждения покупателя заявка не может перейти к финансированию." : application.confirmationStatus === "confirmed" ? "Покупатель подтвердил факт поставки." : "Поставщик получил ответ покупателя и должен уточнить данные."}</p></div></div>
    <dl className="mt-6 grid gap-px overflow-hidden border border-amber-200 bg-amber-200 sm:grid-cols-2">
      <Info label="Покупатель" value={application.buyerName} />
      <Info label="Накладная" value={application.invoiceNumber} />
      <Info label="Запрос отправлен" value={formatDateTime(application.confirmationRequestedAt)} />
      <Info label="Ожидание" value={`${waitingDays} дней`} />
    </dl>
    {application.confirmationComment && <div className="mt-4 border-l-2 border-red-400 pl-4 text-sm text-red-900"><strong>Комментарий покупателя:</strong> {application.confirmationComment}</div>}
    <div className="mt-5"><ReminderHistory count={application.reminderCount} lastReminderAt={application.lastReminderAt} /></div>
    {pending && <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><SecondaryButton type="button" onClick={copyLink}><Copy className="h-4 w-4" /> Копировать ссылку</SecondaryButton><PrimaryButton type="button" loading={loading} onClick={remind}><RefreshCw className="h-4 w-4" /> Отправить напоминание</PrimaryButton><Link href={`/confirm/supply-${application.id}`} target="_blank" className={`${secondaryLinkClass} sm:ml-auto`}><ExternalLink className="h-4 w-4" /> Открыть страницу подтверждения</Link></div>}
  </section>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="bg-paper px-4 py-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-ink">{value}</dd></div>; }
