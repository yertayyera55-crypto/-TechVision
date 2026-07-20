import { AlertTriangle, CalendarClock, ShieldAlert } from "lucide-react";
import { RiskStatusBadge } from "@/components/risk-status-badge";
import { formatCurrency } from "@/lib/format";
import { PaymentMonitoringDeal } from "@/lib/types";

export function RecourseRiskPanel({ deal }: { deal: PaymentMonitoringDeal }) {
  return <section aria-labelledby="recourse-risk-heading" className="border-y border-amber-200 bg-amber-50/55 px-4 py-6 sm:rounded-lg sm:border sm:p-6"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-amber-800 ring-1 ring-amber-200"><ShieldAlert className="h-5 w-5" /></span><div><p className="eyebrow mb-1 !text-amber-800">Текущий риск</p><h2 id="recourse-risk-heading" className="text-xl font-semibold">Контроль возможного регресса</h2><div className="mt-2"><RiskStatusBadge riskLevel={deal.riskLevel} /></div></div></div><dl className="mt-6 grid gap-px overflow-hidden border border-amber-200 bg-amber-200 sm:grid-cols-2"><RiskItem label="До следующего события" value={nextEventValue(deal)} /><RiskItem label="Потенциальный регресс" value={formatCurrency(deal.potentialRecourseAmount)} /><RiskItem label="Рекомендуемый резерв" value={formatCurrency(deal.recommendedReserve)} /><RiskItem label="Рекомендуемое действие" value={deal.recommendedAction} /></dl><p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-600"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />Это предварительная оценка. Реальная сумма возврата определяется договором факторинга.</p></section>;
}

function RiskItem({ label, value }: { label: string; value: string }) {
  return <div className="bg-paper px-4 py-3"><dt className="flex items-center gap-2 text-xs text-slate-500"><CalendarClock className="h-3.5 w-3.5" />{label}</dt><dd className="mt-1 text-sm font-semibold leading-5 text-ink">{value}</dd></div>;
}

function nextEventValue(deal: PaymentMonitoringDeal) {
  if (deal.paymentStatus === "closed") return "Контроль завершён";
  if (deal.daysUntilPayment !== null && deal.daysUntilPayment >= 0) return `${deal.daysUntilPayment} дн. до оплаты`;
  if (deal.daysUntilRecourse !== null) return `${deal.daysUntilRecourse} дн. до регресса`;
  return "Нужны данные";
}
