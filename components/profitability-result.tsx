import { AlertTriangle, CheckCircle2, TrendingDown, XCircle } from "lucide-react";
import { FactoringOffer, ProfitabilityAnalysis } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const resultCopy = {
  profitable: { label: "Сделка остаётся прибыльной", className: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: CheckCircle2 },
  low_margin: { label: "Низкий запас маржинальности", className: "border-amber-200 bg-amber-50 text-amber-950", icon: AlertTriangle },
  unprofitable: { label: "Расходы могут сделать сделку убыточной", className: "border-red-200 bg-red-50 text-red-900", icon: XCircle },
};

export function ProfitabilityResult({ analysis, offer }: { analysis: ProfitabilityAnalysis; offer: FactoringOffer }) {
  const result = resultCopy[analysis.result];
  const Icon = result.icon;
  return <div className="mt-7 animate-scale-in"><div className={`flex items-start gap-3 border p-4 text-sm ${result.className}`}><Icon className="mt-0.5 h-5 w-5 shrink-0" /><div><strong className="block">{result.label}</strong><span className="mt-1 block text-xs opacity-80">Маржинальность снизится с {formatPercent(analysis.marginBeforeFactoring)} до {formatPercent(analysis.marginAfterFactoring)}.</span></div></div><dl className="mt-5 grid border-y border-line sm:grid-cols-2 sm:rounded-lg sm:border"><ResultItem label="Прибыль до факторинга" value={formatCurrency(analysis.profitBeforeFactoring)} /><ResultItem label="Прибыль после факторинга" value={formatCurrency(analysis.profitAfterFactoring)} strong /><ResultItem label="Общая стоимость факторинга" value={formatCurrency(analysis.totalFactoringCost)} icon={<TrendingDown className="h-4 w-4" />} /><ResultItem label="Чистая сумма сейчас" value={formatCurrency(offer.netAmount)} /></dl><p className="mt-4 text-xs leading-5 text-slate-500">Расчёт предварительный и не является бухгалтерской или финансовой консультацией.</p></div>;
}

function ResultItem({ label, value, strong = false, icon }: { label: string; value: string; strong?: boolean; icon?: React.ReactNode }) { return <div className="border-b border-line bg-paper px-4 py-4 last:border-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"><dt className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</dt><dd className={`mt-1.5 font-semibold ${strong ? "text-lg text-moss-800" : "text-sm text-ink"}`}>{value}</dd></div>; }
function formatPercent(value: number) { return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value)}%`; }
