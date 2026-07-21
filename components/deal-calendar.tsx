import { CalendarDays, Check, Circle } from "lucide-react";
import { DEMO_TODAY } from "@/data/demo-rules";
import { getDealDateMessage } from "@/lib/calculate-deal-dates";
import { formatDate } from "@/lib/format";
import { Application, DealMonitoring } from "@/lib/types";

export function DealCalendar({ application, monitoring }: { application: Application; monitoring: DealMonitoring }) {
  const dates = [
    { date: application.deliveryDate, title: "Поставка выполнена" },
    { date: application.createdAt.slice(0, 10), title: "Проверка договора FlowFactor" },
    { date: monitoring.financedAt.slice(0, 10), title: "Финансирование получено" },
    { date: monitoring.paymentDueDate, title: "Срок оплаты покупателем" },
    { date: monitoring.regressionDate, title: "Возможная дата регресса" },
  ];
  const nextIndex = dates.findIndex((item) => item.date >= DEMO_TODAY);
  return <section aria-labelledby="calendar-heading" className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow mb-1">Ключевые даты</p><h2 id="calendar-heading" className="text-xl font-semibold">Календарь сделки</h2></div><span className="rounded-md bg-moss-50 px-2.5 py-1 text-xs font-semibold text-moss-800">Demo-сегодня · {formatDate(DEMO_TODAY)}</span></div><p className="mt-4 flex items-center gap-2 text-sm font-semibold text-moss-800"><CalendarDays className="h-4 w-4" />{getDealDateMessage(monitoring.paymentDueDate, monitoring.regressionDate, DEMO_TODAY)}</p><ol className="relative mt-6 grid gap-4 md:grid-cols-5 md:gap-2">{dates.map((item, index) => { const past = item.date < DEMO_TODAY; const next = index === nextIndex; return <li key={`${item.date}-${item.title}`} className={`relative border-t-2 px-1 pt-4 md:px-3 ${past ? "border-moss-500" : next ? "border-amber-500" : "border-line"}`}><span className={`absolute -top-[9px] left-0 flex h-4 w-4 items-center justify-center rounded-full border md:left-3 ${past ? "border-moss-600 bg-moss-600 text-white" : next ? "border-amber-500 bg-amber-50 text-amber-700 ring-4 ring-amber-50" : "border-line bg-paper text-slate-300"}`}>{past ? <Check className="h-2.5 w-2.5" /> : <Circle className="h-2 w-2 fill-current" />}</span><time className={`text-xs font-semibold ${next ? "text-amber-800" : past ? "text-moss-700" : "text-slate-400"}`}>{formatDate(item.date)}</time><p className={`mt-1 text-xs leading-5 ${next ? "font-semibold text-ink" : "text-slate-500"}`}>{item.title}</p>{next && <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wide text-amber-800">Ближайшее</span>}</li>; })}</ol></section>;
}
