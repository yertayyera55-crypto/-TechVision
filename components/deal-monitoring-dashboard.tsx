"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleHelp, FileText, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { DealDateTimeline } from "@/components/deal-date-timeline";
import { DealActionExplanations } from "@/components/deal-action-explanations";
import { DealEventTimeline } from "@/components/deal-event-timeline";
import { PaymentInput, PaymentModal } from "@/components/payment-modal";
import { RecourseRiskPanel } from "@/components/recourse-risk-panel";
import { ReminderButton } from "@/components/reminder-button";
import { PaymentStatusText, RiskStatusBadge } from "@/components/risk-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton, SecondaryButton, secondaryLinkClass } from "@/components/ui/buttons";
import { useApplications } from "@/lib/application-store";
import { paymentMonitoringDealFromApplication } from "@/lib/payment-monitoring-adapter";
import { changeDealGracePeriod, recordDealPayment, recordDealReminder } from "@/lib/payment-monitoring-actions";
import { usePaymentMonitoring } from "@/lib/payment-monitoring-store";
import { formatCurrency, formatDate } from "@/lib/format";
import { Application, PaymentMonitoringDeal, PaymentStatus, RiskLevel } from "@/lib/types";

export function DealMonitoringDashboard({ id }: { id: string }) {
  const { deals, hydrated, updateDeal } = usePaymentMonitoring();
  const { applications, updateApplication } = useApplications();
  const application = useMemo(() => applications.find((item) => item.id === id), [applications, id]);
  const deal = useMemo(
    () => deals.find((item) => item.id === id) ?? (application ? paymentMonitoringDealFromApplication(application) ?? undefined : undefined),
    [application, deals, id],
  );
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  if (!deal) return <div className="pt-10"><EmptyState title={!hydrated ? "Загружаем сделку" : "Сделка не найдена"} text={!hydrated ? "Данные появятся через мгновение." : "Вернитесь в реестр контроля оплат и выберите доступную сделку."} action={hydrated ? <Link href="/payments-monitoring" className={secondaryLinkClass}>К контролю оплат</Link> : undefined} /></div>;

  const persist = (next: PaymentMonitoringDeal) => {
    updateDeal(id, next);
    if (application?.monitoring) updateApplication(id, applicationPatch(application, next));
  };

  const remind = async (current: PaymentMonitoringDeal) => {
    await new Promise((resolve) => setTimeout(resolve, 550));
    persist(recordDealReminder(current));
  };

  const recordPayment = async (payment: PaymentInput) => {
    await new Promise((resolve) => setTimeout(resolve, 550));
    const next = recordDealPayment(deal, payment);
    persist(next);
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: next.paymentStatus === "closed" ? "Сделка закрыта" : "Частичная оплата сохранена" }));
  };

  const markPaid = async () => {
    if (!window.confirm("Подтвердить полное погашение задолженности покупателем?")) return;
    try {
      setClosing(true);
      await new Promise((resolve) => setTimeout(resolve, 550));
      persist(recordDealPayment(deal, { amount: deal.outstandingAmount, date: "2026-09-25", comment: "Полное погашение" }, true));
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Сделка полностью оплачена и закрыта" }));
    } catch (error) {
      console.error("Не удалось закрыть сделку:", error);
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Не удалось сохранить изменения. Попробуйте ещё раз" }));
    } finally {
      setClosing(false);
    }
  };

  const saveGrace = async (days: number) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    persist(changeDealGracePeriod(deal, days));
  };

  return <div className="animate-rise"><div className="mb-7"><Link href="/payments-monitoring" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ink"><ArrowLeft className="h-4 w-4" /> К контролю оплат</Link></div><header className="mb-8 flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow mb-2">Факторинговая сделка №{deal.id}</p><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">{deal.buyerName}</h1><RiskStatusBadge riskLevel={deal.riskLevel} /></div><p className="mt-3 text-sm text-muted">Накладная {deal.invoiceNumber} · {deal.financialPartnerName}</p></div><div className="sm:text-right"><p className="text-2xl font-semibold">{formatCurrency(deal.outstandingAmount)}</p><PaymentStatusText status={deal.paymentStatus} /></div></header>{deal.paymentStatus === "closed" && <div className="mb-7 flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 sm:rounded-lg"><CheckCircle2 className="h-6 w-6 shrink-0" /><div><h2 className="font-semibold">Покупатель полностью оплатил задолженность</h2><p className="mt-1 text-sm">Сделка закрыта, риск регресса отсутствует.</p></div></div>}<section aria-labelledby="deal-summary-heading" className="mb-8 border-y border-line bg-paper sm:rounded-lg sm:border"><div className="border-b border-line px-4 py-4 sm:px-6"><p className="eyebrow mb-1">Краткая информация</p><h2 id="deal-summary-heading" className="text-xl font-semibold">Параметры сделки</h2></div><dl className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-4"><SummaryItem label="Покупатель" value={deal.buyerName} /><SummaryItem label="Накладная" value={deal.invoiceNumber} /><SummaryItem label="Сумма поставки" value={formatCurrency(deal.invoiceAmount)} /><SummaryItem label="Финансирование" value={deal.financedAmount === null ? "Не указано" : formatCurrency(deal.financedAmount)} /><SummaryItem label="Оплачено покупателем" value={formatCurrency(deal.amountPaidByBuyer)} /><SummaryItem label="Остаток" value={formatCurrency(deal.outstandingAmount)} /><SummaryItem label="Тип факторинга" value={factoringLabel(deal.factoringType)} /><SummaryItem label="Финансовый партнёр" value={deal.financialPartnerName} /></dl></section><div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]"><div className="space-y-7"><DealDateTimeline deal={deal} /><RecourseRiskPanel deal={deal} /><section className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6"><p className="eyebrow mb-1">Оплата покупателем</p><h2 className="text-xl font-semibold">Состояние задолженности</h2><dl className="mt-5 divide-y divide-line border-y border-line"><PaymentRow label="Срок оплаты" value={deal.paymentDueDate ? formatDate(deal.paymentDueDate) : "Не указана"} /><PaymentRow label="Оплачено" value={formatCurrency(deal.amountPaidByBuyer)} /><PaymentRow label="Осталось" value={formatCurrency(deal.outstandingAmount)} /><PaymentRow label="Последняя оплата" value={deal.lastPaymentDate ? formatDate(deal.lastPaymentDate) : "Не зафиксирована"} /></dl></section></div><aside className="self-start border-t border-line pt-6 xl:sticky xl:top-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0"><p className="eyebrow mb-2">Действия</p><div className="grid gap-3"><ReminderButton deal={deal} onRemind={remind} /><PrimaryButton type="button" disabled={deal.paymentStatus === "closed" || deal.outstandingAmount <= 0} onClick={() => setPaymentOpen(true)}>Зафиксировать оплату</PrimaryButton><SecondaryButton type="button" loading={closing} disabled={deal.paymentStatus === "closed" || deal.outstandingAmount <= 0} onClick={markPaid}>Отметить полную оплату</SecondaryButton><Link href={application ? `/applications/${id}#documents` : "/documents"} className={secondaryLinkClass}><FileText className="h-4 w-4" /> Посмотреть документы</Link><a href="mailto:support@mightyminers.kz" className={secondaryLinkClass}><CircleHelp className="h-4 w-4" /> Связаться с поддержкой</a></div><p className="mt-4 text-xs leading-5 text-slate-500">В demo-версии уведомление не отправляется во внешние сервисы.</p><GracePeriodEditor value={deal.gracePeriodDays} onSave={saveGrace} /><div className="mt-8"><DealEventTimeline events={deal.events} /></div></aside></div><PaymentModal open={paymentOpen} mode="partial" outstandingAmount={deal.outstandingAmount} onClose={() => setPaymentOpen(false)} onSubmit={recordPayment} /></div>;
}

function GracePeriodEditor({ value, onSave }: { value: number | null; onSave: (days: number) => Promise<void> }) {
  const presets = [0, 7, 14, 20, 30];
  const initial = value !== null && presets.includes(value) ? String(value) : "custom";
  const [choice, setChoice] = useState(initial);
  const [custom, setCustom] = useState(value !== null && !presets.includes(value) ? String(value) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    const days = choice === "custom" ? Number(custom) : Number(choice);
    if (!Number.isInteger(days) || days < 0 || days > 365) { setError("Введите целое число от 0 до 365."); return; }
    try {
      setError("");
      setLoading(true);
      await onSave(days);
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Grace period сохранён, даты пересчитаны" }));
    } catch (saveError) {
      console.error("Не удалось сохранить grace period:", saveError);
      setError("Не удалось сохранить изменения. Попробуйте ещё раз");
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Не удалось сохранить изменения. Попробуйте ещё раз" }));
    } finally {
      setLoading(false);
    }
  };
  return <><DealActionExplanations /><section className="mt-8 border-t border-line pt-6"><h2 className="text-sm font-semibold">Grace period (льготный период)</h2><p className="mt-1 text-xs leading-5 text-slate-500">Это дополнительные дни после срока оплаты по договору: платёж уже просрочен, но возможный регресс ещё не наступил. Фактический срок определяется договором с финансовым партнёром.</p><label className="mt-4 block"><span className="sr-only">Льготный период</span><select className="control" value={choice} onChange={(event) => setChoice(event.target.value)}>{presets.map((days) => <option key={days} value={days}>{days} дней</option>)}<option value="custom">Другое значение</option></select></label>{choice === "custom" && <label className="mt-3 block"><span className="sr-only">Другое количество дней</span><input type="number" min="0" max="365" className="control" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Количество дней" /></label>}{error && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{error}</p>}<PrimaryButton type="button" loading={loading} onClick={save} className="mt-3 w-full"><Save className="h-4 w-4" /> Сохранить срок</PrimaryButton></section></>;
}

function SummaryItem({ label, value }: { label: string; value: string }) { return <div className="min-w-0 px-4 py-4 sm:px-5"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-ink">{value}</dd></div>; }
function PaymentRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-slate-500">{label}</dt><dd className="text-right text-sm font-semibold">{value}</dd></div>; }
function factoringLabel(type: PaymentMonitoringDeal["factoringType"]) { return type === "recourse" ? "С регрессом" : type === "non_recourse" ? "Без регресса" : "Определяет партнёр"; }

function applicationPatch(application: Application, deal: PaymentMonitoringDeal): Partial<Application> {
  const riskMap: Record<PaymentMonitoringDeal["riskLevel"], RiskLevel> = { none: "none", low: "low", medium: "medium", elevated: "high", high: "high", critical: "critical", review: "medium" };
  const paymentStatus: PaymentStatus = deal.paymentStatus === "closed" ? "paid" : deal.amountPaidByBuyer > 0 ? "partial" : deal.overdueDays > 0 ? "overdue" : "waiting";
  return {
    status: deal.paymentStatus === "closed" ? "closed" : deal.riskLevel === "critical" ? "recourse_approaching" : deal.overdueDays > 0 ? "payment_overdue" : deal.amountPaidByBuyer > 0 ? "partially_paid" : "awaiting_buyer_payment",
    reminderCount: deal.reminderCount,
    lastReminderAt: deal.lastReminderAt ?? undefined,
    monitoring: {
      ...application.monitoring!,
      paymentDueDate: deal.paymentDueDate ?? application.paymentDueDate,
      gracePeriodDays: deal.gracePeriodDays ?? 0,
      regressionDate: deal.recourseDate ?? application.paymentDueDate,
      financedAmount: deal.financedAmount ?? 0,
      amountPaidByBuyer: deal.amountPaidByBuyer,
      outstandingAmount: deal.outstandingAmount,
      potentialRecourseAmount: deal.potentialRecourseAmount,
      recommendedReserve: deal.recommendedReserve,
      riskLevel: riskMap[deal.riskLevel],
      paymentStatus,
      events: deal.events,
    },
  };
}
