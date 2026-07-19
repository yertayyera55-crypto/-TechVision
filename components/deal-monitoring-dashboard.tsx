"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleHelp, FileText, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { DealCalendar } from "@/components/deal-calendar";
import { DealEventTimeline } from "@/components/deal-event-timeline";
import { DeliveryConfirmationPanel } from "@/components/delivery-confirmation-panel";
import { PaymentInput, PaymentModal } from "@/components/payment-modal";
import { ProfitabilityResult } from "@/components/profitability-result";
import { RecourseRiskCard } from "@/components/recourse-risk-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton, SecondaryButton, secondaryLinkClass } from "@/components/ui/buttons";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEMO_TODAY } from "@/data/demo-rules";
import { useApplications } from "@/lib/application-store";
import { calculateRecourseRisk } from "@/lib/calculate-recourse-risk";
import { formatCurrency, formatDate } from "@/lib/format";
import { Application, DealEvent } from "@/lib/types";

export function DealMonitoringDashboard({ id }: { id: string }) {
  const { applications, updateApplication, hydrated } = useApplications();
  const application = useMemo(() => applications.find((item) => item.id === id), [applications, id]);
  const [paymentMode, setPaymentMode] = useState<"partial" | "full" | null>(null);
  const [reminding, setReminding] = useState(false);
  const closePayment = useCallback(() => setPaymentMode(null), []);
  if (!application || !application.monitoring) return <div className="pt-10"><EmptyState title={!hydrated ? "Загружаем сделку" : "Активная сделка не найдена"} text={!hydrated ? "Данные появятся через мгновение." : "Сначала передайте подготовленную заявку финансовому партнёру."} action={hydrated ? <Link href={`/applications/${id}`} className={secondaryLinkClass}>Вернуться к заявке</Link> : undefined} /></div>;
  const monitoring = application.monitoring;
  const update = (patch: Partial<Application>) => updateApplication(id, patch);
  const remindBuyer = async () => {
    setReminding(true); await new Promise((resolve) => setTimeout(resolve, 600));
    const event = createEvent(id, "payment_reminder", "Напоминание об оплате отправлено", "Покупателю отправлено демонстрационное напоминание об оплате.", "Mighty Miners");
    update({ reminderCount: application.reminderCount + 1, lastReminderAt: new Date().toISOString(), monitoring: { ...monitoring, events: [...monitoring.events, event] } });
    setReminding(false); window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Напоминание отправлено покупателю" }));
  };
  const recordPayment = async (payment: PaymentInput) => {
    await new Promise((resolve) => setTimeout(resolve, 550));
    const amountPaidByBuyer = Math.min(application.amount, monitoring.amountPaidByBuyer + payment.amount);
    const outstandingAmount = Math.max(0, application.amount - amountPaidByBuyer);
    const closed = outstandingAmount === 0;
    const risk = calculateRecourseRisk(monitoring.financedAmount, amountPaidByBuyer, monitoring.regressionDate, DEMO_TODAY);
    const event = createEvent(id, closed ? "closed" : "partial_payment", closed ? "Сделка закрыта" : "Частичная оплата получена", closed ? "Покупатель полностью оплатил задолженность." : `Покупатель оплатил ${formatCurrency(payment.amount)}.${payment.comment ? ` ${payment.comment}` : ""}`, "Поставщик", `${payment.date}T12:00:00+06:00`);
    update({ status: closed ? "closed" : "partially_paid", monitoring: { ...monitoring, amountPaidByBuyer, outstandingAmount, potentialRecourseAmount: risk.potentialRecourseAmount, recommendedReserve: risk.recommendedReserve, riskLevel: risk.riskLevel, paymentStatus: closed ? "paid" : "partial", events: [...monitoring.events, event] } });
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: closed ? "Сделка закрыта" : "Частичная оплата сохранена" }));
  };
  return <div className="animate-rise"><div className="mb-7"><Link href={`/applications/${id}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ink"><ArrowLeft className="h-4 w-4" /> К заявке №{id}</Link></div><header className="mb-8 flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow mb-2">Активная факторинговая сделка</p><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Контроль сделки</h1><StatusBadge status={application.status} /></div><p className="mt-3 text-sm text-muted">{application.buyerName} · накладная {application.invoiceNumber}</p></div><p className="text-2xl font-semibold">{formatCurrency(application.amount)}</p></header>{application.status === "closed" && <div className="mb-7 flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><CheckCircle2 className="h-6 w-6 shrink-0" /><div><h2 className="font-semibold">Покупатель полностью оплатил задолженность</h2><p className="mt-1 text-sm">Сделка закрыта, риск регресса отсутствует.</p></div></div>}<section aria-label="Ключевые показатели сделки" className="mb-8 grid grid-cols-2 gap-x-5 border-y border-line md:grid-cols-4 md:gap-0"><Metric label="Общая сумма" value={formatCurrency(application.amount)} /><Metric label="Финансирование" value={formatCurrency(monitoring.financedAmount)} /><Metric label="Оплачено покупателем" value={formatCurrency(monitoring.amountPaidByBuyer)} /><Metric label="Остаток" value={formatCurrency(monitoring.outstandingAmount)} /></section><div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]"><div className="space-y-7"><DeliveryConfirmationPanel application={application} onUpdate={update} />{application.profitability && application.factoringOffer && <section className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6"><p className="eyebrow mb-1">Финансовый результат</p><h2 className="text-xl font-semibold">Прибыльность</h2><ProfitabilityResult analysis={application.profitability} offer={application.factoringOffer} /></section>}<section className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6"><p className="eyebrow mb-1">Оплата покупателем</p><h2 className="text-xl font-semibold">{monitoring.paymentStatus === "paid" ? "Оплачено полностью" : monitoring.paymentStatus === "partial" ? "Оплачено частично" : "Ожидается оплата"}</h2><dl className="mt-5 divide-y divide-line border-y border-line"><PaymentRow label="Срок оплаты" value={formatDate(monitoring.paymentDueDate)} /><PaymentRow label="Оплачено" value={formatCurrency(monitoring.amountPaidByBuyer)} /><PaymentRow label="Осталось" value={formatCurrency(monitoring.outstandingAmount)} /></dl></section><RecourseRiskCard application={application} /><DealCalendar application={application} monitoring={monitoring} /></div><aside className="self-start border-t border-line pt-6 xl:sticky xl:top-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0"><p className="eyebrow mb-2">Действия</p><div className="grid gap-3"><PrimaryButton type="button" disabled={application.status === "closed"} loading={reminding} onClick={remindBuyer}><RefreshCw className="h-4 w-4" /> Отправить напоминание покупателю</PrimaryButton><SecondaryButton type="button" disabled={application.status === "closed" || monitoring.outstandingAmount <= 0} onClick={() => setPaymentMode("partial")}>Отметить частичную оплату</SecondaryButton><SecondaryButton type="button" disabled={application.status === "closed" || monitoring.outstandingAmount <= 0} onClick={() => setPaymentMode("full")}>Отметить полную оплату</SecondaryButton><Link href={`/applications/${id}#documents`} className={secondaryLinkClass}><FileText className="h-4 w-4" /> Посмотреть документы</Link><a href="mailto:support@mightyminers.kz" className={secondaryLinkClass}><CircleHelp className="h-4 w-4" /> Связаться с поддержкой</a></div><div className="mt-8"><DealEventTimeline events={monitoring.events} /></div></aside></div><PaymentModal open={paymentMode !== null} mode={paymentMode ?? "partial"} outstandingAmount={monitoring.outstandingAmount} onClose={closePayment} onSubmit={recordPayment} /></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="py-5 md:border-r md:px-5 md:last:border-r-0"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-lg font-semibold tracking-tight text-ink md:text-xl">{value}</p></div>; }
function PaymentRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-slate-500">{label}</dt><dd className="text-sm font-semibold">{value}</dd></div>; }
function createEvent(id: string, type: string, title: string, description: string, source: DealEvent["source"], timestamp = new Date().toISOString()): DealEvent { return { id: `${id}-${type}-${Date.now()}`, type, title, description, timestamp, source }; }
