"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApplicationTable } from "@/components/application-table";
import { EmptyState } from "@/components/ui/empty-state";
import { primaryLinkClass, secondaryLinkClass } from "@/components/ui/buttons";
import { useApplications } from "@/lib/application-store";
import { ApplicationStatus } from "@/lib/types";

export function ApplicationsList() {
  const { applications } = useApplications();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ApplicationStatus>("all");
  const [hasDraft, setHasDraft] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- draft metadata hydrates from browser storage after SSR. */
  useEffect(() => {
    const saved = window.localStorage.getItem("mighty-miners-application-draft-v1");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { network?: string; invoiceNumber?: string; amount?: string };
      setHasDraft(Boolean(parsed.network || parsed.invoiceNumber || parsed.amount));
    } catch { /* keep the default false value */ }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return applications.filter((application) => {
      const matchesStatus = status === "all" || application.status === status;
      const matchesQuery = !normalized || `${application.id} ${application.network} ${application.invoiceNumber}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [applications, query, status]);

  return <div className="animate-rise">
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow mb-2">Рабочий поток</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Мои заявки</h1><p className="mt-2 text-sm text-muted">Все поставки и этапы рассмотрения в одном месте.</p></div><Link href="/applications/new" className={primaryLinkClass}><Plus className="h-4 w-4" /> Новая заявка</Link></header>
    {hasDraft && <div className="mb-6 flex flex-col justify-between gap-4 border border-line bg-paper px-4 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold">Есть незавершённый черновик</p><p className="mt-1 text-xs text-slate-500">Продолжите с последнего сохранённого шага.</p></div><Link href="/applications/new" className={secondaryLinkClass}>Продолжить</Link></div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_240px]"><label className="relative"><span className="sr-only">Поиск заявок</span><Search className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="control pl-11" placeholder="Номер, покупатель или накладная" /></label><label><span className="sr-only">Фильтр по статусу</span><select className="control" value={status} onChange={(event) => setStatus(event.target.value as "all" | ApplicationStatus)}><option value="all">Все статусы</option><option value="precheck_passed">Предварительно соответствует условиям</option><option value="clarification_required">Нужно уточнение</option><option value="awaiting_buyer_payment">Ожидается оплата покупателя</option><option value="payment_overdue">Оплата просрочена</option><option value="closed">Сделка закрыта</option></select></label></div>
    {filtered.length ? <ApplicationTable applications={filtered} /> : <EmptyState title="Заявки не найдены" text="Измените запрос или сбросьте фильтр статуса." action={<button type="button" className={secondaryLinkClass} onClick={() => { setQuery(""); setStatus("all"); }}>Сбросить фильтры</button>} />}
  </div>;
}
