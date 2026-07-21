"use client";

import Link from "next/link";
import { ArrowLeft, CircleHelp, FileText, Info } from "lucide-react";
import { useMemo } from "react";
import { DealDateTimeline } from "@/components/deal-date-timeline";
import { DealEventTimeline } from "@/components/deal-event-timeline";
import { RecourseRiskPanel } from "@/components/recourse-risk-panel";
import { PaymentStatusText, RiskStatusBadge } from "@/components/risk-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { secondaryLinkClass } from "@/components/ui/buttons";
import { useApplications } from "@/lib/application-store";
import { formatCurrency, formatDate } from "@/lib/format";
import { paymentMonitoringDealFromApplication } from "@/lib/payment-monitoring-adapter";
import { usePaymentMonitoring } from "@/lib/payment-monitoring-store";
import { PaymentMonitoringDeal } from "@/lib/types";

export function DealMonitoringDashboard({ id }: { id: string }) {
  const { deals, hydrated } = usePaymentMonitoring();
  const { applications } = useApplications();
  const application = useMemo(() => applications.find((item) => item.id === id), [applications, id]);
  const deal = useMemo(() => deals.find((item) => item.id === id) ?? (application ? paymentMonitoringDealFromApplication(application) ?? undefined : undefined), [application, deals, id]);

  if (!deal) return <div className="pt-10"><EmptyState title={!hydrated ? "Загружаем сделку" : "Сделка не найдена"} text={!hydrated ? "Данные появятся через мгновение." : "Вернитесь в реестр сроков оплаты и выберите доступную сделку."} action={hydrated ? <Link href="/payments-monitoring" className={secondaryLinkClass}>К срокам оплаты</Link> : undefined} /></div>;

  const recourseNote = deal.factoringType === "non_recourse"
    ? "В рамках демосценария риск неплатежа покупателя несёт FlowFactor."
    : "При длительной просрочке покупателя FlowFactor может потребовать возврат финансирования в соответствии с условиями договора.";

  return <div className="animate-rise"><div className="mb-7"><Link href="/payments-monitoring" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ink"><ArrowLeft className="h-4 w-4" /> К срокам оплаты</Link></div><header className="mb-8 flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow mb-2">Демонстрационная сделка №{deal.id}</p><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">{deal.buyerName}</h1><RiskStatusBadge riskLevel={deal.riskLevel} /></div><p className="mt-3 text-sm text-muted">{deal.invoiceNumber} · Фактор: FlowFactor</p></div><div className="sm:text-right"><p className="text-2xl font-semibold">{formatCurrency(deal.outstandingAmount)}</p><PaymentStatusText status={deal.paymentStatus} /></div></header><section className="mb-8 flex items-start gap-3 border border-moss-200 bg-moss-50/65 px-4 py-4 sm:rounded-lg"><Info className="mt-0.5 h-5 w-5 shrink-0 text-moss-700" /><p className="text-sm leading-6 text-slate-700">Раздел только для просмотра: покупатель перечисляет оплату FlowFactor, а статусы в учебном MVP обновляются заранее заданным демосценарием.</p></section><section aria-labelledby="deal-summary-heading" className="mb-8 border-y border-line bg-paper sm:rounded-lg sm:border"><div className="border-b border-line px-4 py-4 sm:px-6"><p className="eyebrow mb-1">Краткая информация</p><h2 id="deal-summary-heading" className="text-xl font-semibold">Кто и кому платит</h2></div><dl className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-4"><SummaryItem label="Покупатель" value={deal.buyerName} /><SummaryItem label="Сумма требования" value={formatCurrency(deal.invoiceAmount)} /><SummaryItem label="Получено от FlowFactor" value={deal.financedAmount === null ? "Не указано" : formatCurrency(deal.financedAmount)} /><SummaryItem label="Покупатель перечислит фактору" value={formatCurrency(deal.outstandingAmount)} /><SummaryItem label="Плановая дата оплаты" value={deal.paymentDueDate ? formatDate(deal.paymentDueDate) : "Не указана"} /><SummaryItem label="До срока" value={deal.daysUntilPayment === null ? "Не указано" : `${deal.daysUntilPayment} дн.`} /><SummaryItem label="Тип факторинга" value={factoringLabel(deal.factoringType)} /><SummaryItem label="Текущий статус" value={paymentStatusLabel(deal)} /></dl></section><div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]"><div className="space-y-7"><DealDateTimeline deal={deal} /><RecourseRiskPanel deal={deal} /><section className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6"><p className="eyebrow mb-1">Статус оплаты покупателя</p><h2 className="text-xl font-semibold">Оплата поступает FlowFactor</h2><dl className="mt-5 divide-y divide-line border-y border-line"><PaymentRow label="Получено FlowFactor" value={formatCurrency(deal.amountPaidByBuyer)} /><PaymentRow label="Остаток к оплате FlowFactor" value={formatCurrency(deal.outstandingAmount)} /><PaymentRow label="Наличие просрочки" value={deal.overdueDays > 0 ? `Да, ${deal.overdueDays} дн.` : "Нет"} /><PaymentRow label="Последняя отметка" value={deal.lastPaymentDate ? formatDate(deal.lastPaymentDate) : "Нет в демосценарии"} /></dl></section></div><aside className="self-start border-t border-line pt-6 xl:sticky xl:top-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0"><p className="eyebrow mb-2">Справка</p><p className="text-sm leading-6 text-slate-600">{recourseNote}</p><div className="mt-5 grid gap-3"><Link href={application ? `/applications/${id}#documents` : "/documents"} className={secondaryLinkClass}><FileText className="h-4 w-4" /> Посмотреть документы</Link><a href="mailto:support@flowfactor.demo" className={secondaryLinkClass}><CircleHelp className="h-4 w-4" /> Связаться с FlowFactor</a></div><div className="mt-8"><DealEventTimeline events={deal.events} /></div></aside></div></div>;
}

function SummaryItem({ label, value }: { label: string; value: string }) { return <div className="min-w-0 px-4 py-4 sm:px-5"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-ink">{value}</dd></div>; }
function PaymentRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-slate-500">{label}</dt><dd className="text-right text-sm font-semibold">{value}</dd></div>; }
function factoringLabel(type: PaymentMonitoringDeal["factoringType"]) { return type === "recourse" ? "С регрессом" : type === "non_recourse" ? "Без регресса" : "Определяется по демосценарию"; }
function paymentStatusLabel(deal: PaymentMonitoringDeal) { if (deal.paymentStatus === "closed") return "Сделка закрыта"; if (deal.overdueDays > 0) return "Оплата просрочена"; if (deal.daysUntilPayment !== null && deal.daysUntilPayment <= 7) return "Срок оплаты приближается"; return "Ожидается оплата покупателя"; }
