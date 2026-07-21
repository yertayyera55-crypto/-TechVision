"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PaymentStatusText, RiskStatusBadge } from "@/components/risk-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { PaymentMonitoringDeal } from "@/lib/types";

export function PaymentMonitoringCard({ deal }: { deal: PaymentMonitoringDeal }) {
  const router = useRouter();
  const open = () => router.push(`/deals/${deal.id}/monitoring`);
  return <article role="link" tabIndex={0} onClick={open} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } }} className="border-y border-line bg-paper px-4 py-5 transition hover:bg-moss-50/30 focus:outline-none focus:ring-2 focus:ring-moss-200 sm:rounded-lg sm:border"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold text-moss-700">Сделка №{deal.id}</p><h3 className="mt-1 truncate text-lg font-semibold text-ink">{deal.buyerName}</h3><p className="mt-1 text-xs text-slate-500">{deal.invoiceNumber} · Фактор {deal.financialPartnerName}</p></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300" /></div><div className="mt-4 flex flex-wrap items-center gap-2"><PaymentStatusText status={deal.paymentStatus} /><RiskStatusBadge riskLevel={deal.riskLevel} /></div><dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 border-y border-line py-4"><Metric label="Сумма требования" value={formatCurrency(deal.invoiceAmount)} /><Metric label="Получено от FlowFactor" value={deal.financedAmount === null ? "Не указано" : formatCurrency(deal.financedAmount)} /><Metric label="Получено фактором" value={formatCurrency(deal.amountPaidByBuyer)} /><Metric label="К оплате фактору" value={formatCurrency(deal.outstandingAmount)} /><Metric label="Плановая дата" value={deal.paymentDueDate ? formatDate(deal.paymentDueDate) : "Не указана"} /><Metric label="До срока" value={deal.daysUntilPayment === null ? "Не указано" : `${deal.daysUntilPayment} дн.`} /></dl><p className="mt-4 text-xs leading-5 text-slate-600">{deal.nextImportantEvent}</p></article>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-[10px] uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-ink">{value}</dd></div>;
}
