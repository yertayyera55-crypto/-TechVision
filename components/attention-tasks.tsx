import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { demoMonitoringRules } from "@/data/demo-monitoring-rules";
import { paymentAttentionPriority, requiresPaymentAttention } from "@/lib/calculate-payment-monitoring";
import { formatCurrency } from "@/lib/format";
import { PaymentMonitoringDeal } from "@/lib/types";

export function AttentionTasks({ deals }: { deals: PaymentMonitoringDeal[] }) {
  const tasks = deals.filter(requiresPaymentAttention).sort((a, b) => paymentAttentionPriority(b) - paymentAttentionPriority(a)).slice(0, demoMonitoringRules.attentionLimit);
  if (!tasks.length) return null;
  return <section aria-labelledby="attention-heading" className="border-y border-line bg-paper sm:rounded-lg sm:border"><div className="flex items-start gap-3 border-b border-line px-4 py-4 sm:px-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss-50 text-moss-700"><ListChecks className="h-4.5 w-4.5" /></span><div><h2 id="attention-heading" className="text-lg font-semibold">Что требует внимания сегодня</h2><p className="mt-1 text-xs text-slate-500">До пяти задач, отсортированных по риску и сроку.</p></div></div><ol className="divide-y divide-line">{tasks.map((deal) => <li key={deal.id}><Link href={`/deals/${deal.id}/monitoring`} className="group grid gap-2 px-4 py-4 transition hover:bg-moss-50/35 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"><div><p className="text-sm font-semibold text-ink">{taskTitle(deal)}</p><p className="mt-1 text-xs leading-5 text-slate-500">{deal.nextImportantEvent} Сумма: {formatCurrency(deal.outstandingAmount)}.</p></div><span className="inline-flex items-center gap-1 text-xs font-semibold text-moss-700">{deal.recommendedAction}<ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></Link></li>)}</ol></section>;
}

function taskTitle(deal: PaymentMonitoringDeal) {
  if (deal.riskLevel === "critical") return `Проверить риск регресса по ${deal.buyerName}`;
  if (deal.overdueDays > 0) return `Связаться с ${deal.buyerName}`;
  return `Проверить поступление от ${deal.buyerName}`;
}
