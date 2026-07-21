import { AlertTriangle, Check, Circle, ShieldCheck } from "lucide-react";
import { calculateReadiness } from "@/lib/calculate-readiness";
import { Application } from "@/lib/types";

export function ReadinessChecklist({ application }: { application: Application }) {
  const readiness = calculateReadiness(application);
  const tone = readiness.percentage === 100 ? "text-emerald-800" : readiness.percentage >= 60 ? "text-amber-800" : "text-red-800";
  const result = readiness.percentage === 100 ? "Заявка готова к предварительному расчёту" : readiness.percentage >= 60 ? "Нужны дополнительные данные" : "Заявка пока не подходит";
  return <section aria-labelledby="readiness-heading" className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5"><div><p className="eyebrow mb-1">Demo-проверка</p><h2 id="readiness-heading" className="text-xl font-semibold">Готовность к факторингу</h2></div><strong className={`text-lg sm:text-xl ${tone}`}>Готовность заявки: {readiness.percentage}%</strong></div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-moss-600 transition-all duration-500" style={{ width: `${readiness.percentage}%` }} /></div>
    <p className={`mt-3 text-sm font-semibold ${tone}`}>{result}</p>
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">{readiness.items.map((item) => <li key={item.id} className={`flex items-center gap-2 text-sm ${item.ready ? "text-ink" : "text-slate-500"}`}>{item.ready ? <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss-100 text-moss-700"><Check className="h-3 w-3" /></span> : <Circle className="h-5 w-5 shrink-0 text-amber-500" />}{item.label}</li>)}</ul>
    {readiness.missing.length > 0 && <div className="mt-5 flex items-start gap-2 border-l-2 border-amber-400 pl-4 text-xs leading-5 text-slate-600"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />Не заполнено: {readiness.missing.map((item) => item.label.toLowerCase()).join(", ")}.</div>}
    <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss-700" />Это проверка комплектности для демосценария, а не реальное финансовое решение.</p>
  </section>;
}
