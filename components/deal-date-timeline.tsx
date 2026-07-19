import { AlertTriangle, CalendarDays, Check, Circle } from "lucide-react";
import { DEMO_MONITORING_TODAY } from "@/data/demo-monitoring-rules";
import { formatDate } from "@/lib/format";
import { PaymentMonitoringDeal } from "@/lib/types";

export function DealDateTimeline({ deal }: { deal: PaymentMonitoringDeal }) {
  const dates = [
    { date: deal.deliveryDate, title: "Поставка выполнена", critical: false },
    { date: deal.confirmationDate, title: "Поставка подтверждена", critical: false },
    { date: deal.financingDate, title: "Финансирование получено", critical: false },
    { date: deal.paymentDueDate, title: "Срок оплаты покупателем", critical: false },
    { date: deal.recourseDate, title: "Возможная дата регресса", critical: true },
  ];
  const nextIndex = deal.paymentStatus === "closed" ? -1 : dates.findIndex((item) => item.date && item.date >= DEMO_MONITORING_TODAY);
  return <section aria-labelledby="deal-calendar-heading" className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow mb-1">Ключевые даты</p><h2 id="deal-calendar-heading" className="text-xl font-semibold">Календарь сделки</h2></div><span className="self-start rounded-md bg-moss-50 px-2.5 py-1 text-xs font-semibold text-moss-800">Demo-сегодня · {formatDate(DEMO_MONITORING_TODAY)}</span></div><p className="mt-4 flex items-start gap-2 text-sm font-semibold text-moss-800"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />{deal.nextImportantEvent}</p><ol className="relative mt-7 grid gap-4 md:grid-cols-5 md:gap-2">{dates.map((item, index) => { const past = Boolean(item.date && item.date < DEMO_MONITORING_TODAY); const next = index === nextIndex; const missing = !item.date; const state = missing ? "Нужны данные" : next ? "Следующее событие" : past ? "Событие прошло" : item.critical ? "Критическая дата" : "Запланировано"; return <li key={item.title} className={`relative border-t-2 px-1 pt-4 md:px-3 ${missing ? "border-slate-300" : next ? "border-amber-500" : past ? "border-moss-500" : item.critical ? "border-rose-300" : "border-line"}`}><span className={`absolute -top-[9px] left-0 flex h-4 w-4 items-center justify-center rounded-full border md:left-3 ${past ? "border-moss-600 bg-moss-600 text-white" : next ? "border-amber-500 bg-amber-50 text-amber-700 ring-4 ring-amber-50" : item.critical ? "border-rose-400 bg-rose-50 text-rose-700" : "border-line bg-paper text-slate-300"}`}>{past ? <Check className="h-2.5 w-2.5" /> : item.critical ? <AlertTriangle className="h-2.5 w-2.5" /> : <Circle className="h-2 w-2 fill-current" />}</span><time className={`text-xs font-semibold ${next ? "text-amber-800" : past ? "text-moss-700" : item.critical ? "text-rose-800" : "text-slate-400"}`}>{item.date ? formatDate(item.date) : "Не указана"}</time><p className={`mt-1 text-xs leading-5 ${next ? "font-semibold text-ink" : "text-slate-600"}`}>{item.title}</p><span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wide text-slate-500">{state}</span></li>; })}</ol></section>;
}
