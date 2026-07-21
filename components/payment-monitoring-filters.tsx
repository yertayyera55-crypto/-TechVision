import { Search } from "lucide-react";

export type MonitoringFilter = "all" | "attention" | "due_soon" | "overdue" | "grace" | "critical" | "partial" | "closed";
export type MonitoringSort = "payment" | "recourse" | "amount" | "risk" | "buyer";

const filters: { value: MonitoringFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "attention", label: "Требуют внимания" },
  { value: "due_soon", label: "Срок приближается" },
  { value: "overdue", label: "Просрочено" },
  { value: "grace", label: "Льготный период" },
  { value: "critical", label: "Критический риск" },
  { value: "partial", label: "Частично оплачено" },
  { value: "closed", label: "Закрытые сделки" },
];

export function PaymentMonitoringFilters({
  filter,
  query,
  sort,
  onFilter,
  onQuery,
  onSort,
}: {
  filter: MonitoringFilter;
  query: string;
  sort: MonitoringSort;
  onFilter: (value: MonitoringFilter) => void;
  onQuery: (value: string) => void;
  onSort: (value: MonitoringSort) => void;
}) {
  return <section aria-label="Фильтры реестра" className="border-y border-line bg-paper py-4 sm:rounded-lg sm:border sm:p-4"><div className="overflow-x-auto px-4 pb-1 sm:px-0"><div className="flex min-w-max gap-2">{filters.map((item) => <button key={item.value} type="button" onClick={() => onFilter(item.value)} aria-pressed={filter === item.value} className={`min-h-11 rounded-lg border px-3.5 text-xs font-semibold transition ${filter === item.value ? "border-moss-700 bg-moss-700 text-white" : "border-line bg-paper text-slate-600 hover:border-moss-300 hover:bg-moss-50"}`}>{item.label}</button>)}</div></div><div className="mt-4 grid gap-3 px-4 sm:grid-cols-[minmax(0,1fr)_260px] sm:px-0"><label className="relative"><span className="sr-only">Поиск сделок</span><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><input className="control pl-11" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Покупатель, накладная или сделка" /></label><label><span className="sr-only">Сортировка</span><select className="control" value={sort} onChange={(event) => onSort(event.target.value as MonitoringSort)}><option value="payment">Ближайшая дата оплаты</option><option value="recourse">Ближайшая дата регресса</option><option value="amount">Самая большая сумма</option><option value="risk">Самый высокий риск</option><option value="buyer">Покупатель</option></select></label></div></section>;
}
