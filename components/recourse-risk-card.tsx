import { AlertTriangle, CalendarClock, ShieldAlert } from "lucide-react";
import { DEMO_TODAY } from "@/data/demo-rules";
import { addDays } from "@/lib/calculate-deal-dates";
import { calculateRecourseRisk } from "@/lib/calculate-recourse-risk";
import { formatCurrency, formatDate } from "@/lib/format";
import { Application, RiskLevel } from "@/lib/types";

const riskLabels: Record<RiskLevel, string> = { none: "Отсутствует", low: "Низкий", medium: "Средний", high: "Высокий", critical: "Критический" };

export function RecourseRiskCard({ application }: { application: Application }) {
  if (!application.factoringOffer) return null;
  const monitoring = application.monitoring;
  const regressionDate = monitoring?.regressionDate ?? addDays(application.paymentDueDate, application.factoringOffer.gracePeriodDays);
  const paid = monitoring?.amountPaidByBuyer ?? 0;
  const risk = calculateRecourseRisk(application.factoringOffer.financingAmount, paid, regressionDate, DEMO_TODAY);
  return <section aria-labelledby="recourse-heading" className="border-y border-amber-200 bg-amber-50/60 px-4 py-6 sm:rounded-lg sm:border sm:p-6"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-amber-800 ring-1 ring-amber-200"><ShieldAlert className="h-5 w-5" /></span><div><p className="eyebrow !text-amber-800 mb-1">Сценарий с регрессом</p><h2 id="recourse-heading" className="text-xl font-semibold">Риск возврата средств</h2></div></div><dl className="mt-6 grid gap-px overflow-hidden border border-amber-200 bg-amber-200 sm:grid-cols-2"><RiskItem label="Ожидаемая дата оплаты" value={formatDate(application.paymentDueDate)} /><RiskItem label="Льготный период" value={`${application.factoringOffer.gracePeriodDays} дней`} /><RiskItem label="Возможная дата регресса" value={formatDate(regressionDate)} /><RiskItem label="До возможного регресса" value={`${Math.max(0, risk.daysUntilRegression)} дней`} /><RiskItem label="Потенциальная сумма возврата" value={formatCurrency(risk.potentialRecourseAmount)} /><RiskItem label="Рекомендуемый резерв" value={formatCurrency(risk.recommendedReserve)} /><RiskItem label="Уровень риска" value={riskLabels[risk.riskLevel]} /></dl><p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-600"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />Реальная ответственность определяется договором факторинга. Этот расчёт не означает, что деньги обязательно потребуется вернуть.</p></section>;
}

function RiskItem({ label, value }: { label: string; value: string }) { return <div className="bg-paper px-4 py-3"><dt className="flex items-center gap-2 text-xs text-slate-500"><CalendarClock className="h-3.5 w-3.5" />{label}</dt><dd className="mt-1 text-sm font-semibold text-ink">{value}</dd></div>; }
