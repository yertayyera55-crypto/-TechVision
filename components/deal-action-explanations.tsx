import { CircleHelp } from "lucide-react";

const explanations = [
  { title: "Зафиксировать оплату", text: "Записать уже поступившую от покупателя сумму и дату. Marti не переводит деньги и не проверяет банковский счёт." },
  { title: "Отметить полную оплату", text: "Подтвердить, что покупатель погасил весь остаток. Сделка закроется, а напоминания и риск регресса обнулятся." },
  { title: "Посмотреть документы", text: "Перейти к накладной, счёту-фактуре и договору этой заявки. Загруженные вами файлы можно открыть или скачать." },
];

export function DealActionExplanations() {
  return <section aria-labelledby="action-help-heading" className="mt-6 border-t border-line pt-5"><div className="flex items-center gap-2"><CircleHelp className="h-4 w-4 text-moss-700" /><h2 id="action-help-heading" className="text-sm font-semibold">Что означают действия</h2></div><dl className="mt-3 space-y-3">{explanations.map((item) => <div key={item.title}><dt className="text-xs font-semibold text-ink">{item.title}</dt><dd className="mt-1 text-xs leading-5 text-slate-500">{item.text}</dd></div>)}</dl></section>;
}
