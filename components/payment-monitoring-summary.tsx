import { PaymentMonitoringDeal } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function PaymentMonitoringSummary({ deals }: { deals: PaymentMonitoringDeal[] }) {
  const active = deals.filter((deal) => deal.paymentStatus !== "closed");
  const items = [
    { label: "Активных сделок", value: String(active.length) },
    { label: "Общая задолженность", value: formatCurrency(sum(active, "outstandingAmount")) },
    { label: "Оплата в ближайшие 7 дней", value: String(active.filter((deal) => deal.daysUntilPayment !== null && deal.daysUntilPayment >= 0 && deal.daysUntilPayment <= 7).length) },
    { label: "Просрочено", value: String(active.filter((deal) => deal.overdueDays > 0).length) },
    { label: "В grace period", value: String(active.filter((deal) => deal.paymentStatus === "grace_period").length) },
    { label: "Критический риск", value: String(active.filter((deal) => deal.riskLevel === "critical").length) },
    { label: "Потенциальный регресс", value: formatCurrency(sum(active, "potentialRecourseAmount")) },
  ];
  return <section aria-label="Сводка контроля оплат" className="overflow-hidden border-y border-line bg-paper sm:rounded-lg sm:border"><dl className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-4 xl:grid-cols-7 xl:divide-y-0">{items.map((item, index) => <div key={item.label} className={`min-w-0 px-4 py-4 sm:px-5 ${index === items.length - 1 ? "col-span-2 md:col-span-1" : ""}`}><dt className="min-h-8 text-[11px] leading-4 text-slate-500">{item.label}</dt><dd className="mt-2 break-words text-lg font-semibold tracking-tight text-ink">{item.value}</dd></div>)}</dl></section>;
}

function sum(deals: PaymentMonitoringDeal[], key: "outstandingAmount" | "potentialRecourseAmount") {
  return deals.reduce((total, deal) => total + deal[key], 0);
}
