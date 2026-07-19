import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ReminderButton } from "@/components/reminder-button";
import { secondaryLinkClass } from "@/components/ui/buttons";
import { PaymentMonitoringDeal } from "@/lib/types";

export function NextActionCell({ deal, onRemind, compact = false }: { deal: PaymentMonitoringDeal; onRemind: (deal: PaymentMonitoringDeal) => Promise<void>; compact?: boolean }) {
  const reminderRecommended = deal.recommendedAction.includes("напоминание") || deal.paymentStatus === "due_today";
  return <div className="min-w-[180px]"><p className="text-xs leading-5 text-slate-600">{deal.recommendedAction}</p><div className="mt-2" onClick={(event) => event.stopPropagation()}>{reminderRecommended ? <ReminderButton deal={deal} onRemind={onRemind} compact /> : <Link href={`/deals/${deal.id}/monitoring`} className={`${secondaryLinkClass} ${compact ? "min-h-9 px-3 text-xs" : ""}`}>{deal.riskLevel === "review" ? "Указать данные" : deal.paymentStatus === "closed" ? "Открыть сделку" : "Зафиксировать оплату"}<ArrowUpRight className="h-3.5 w-3.5" /></Link>}</div></div>;
}
