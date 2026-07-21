"use client";

import Link from "next/link";
import { ArrowRight, PackageCheck, Search, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmationStatusBadge } from "@/components/confirmation-status-badge";
import { primaryLinkClass } from "@/components/ui/buttons";
import { useApplications } from "@/lib/application-store";
import { formatCurrency, formatDate } from "@/lib/format";

export function DeliveryPicker() {
  const { applications } = useApplications();
  const [query, setQuery] = useState("");
  const deliveries = useMemo(() => applications.filter((item) => item.status !== "draft" && `${item.buyerName} ${item.invoiceNumber}`.toLowerCase().includes(query.toLowerCase().trim())), [applications, query]);
  return <div className="animate-rise"><header className="mb-8"><p className="eyebrow mb-2">Demo-интеграция с учётной системой</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Найти мои поставки</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Выберите поставку, чтобы просмотреть демопредложение FlowFactor и срок оплаты покупателя.</p></header><div className="mb-6 flex items-start gap-3 border border-moss-200 bg-moss-50 p-4 text-sm leading-6 text-moss-900"><PackageCheck className="mt-0.5 h-5 w-5 shrink-0" /><span><strong className="block">Демонстрационные данные</strong>Реальная интеграция с ERP или 1С не подключена. Список содержит только синтетическую поставку ТОО «Arman Tea».</span></div><label className="relative mb-5 block max-w-xl"><span className="sr-only">Поиск поставок</span><Search className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><input className="control pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Покупатель или номер накладной" /></label><div className="divide-y divide-line border-y border-line bg-paper sm:rounded-lg sm:border">{deliveries.map((delivery) => <article key={delivery.id} className="grid gap-4 px-4 py-5 transition hover:bg-moss-50/40 md:grid-cols-[minmax(0,1fr)_180px_220px] md:items-center"><div className="flex min-w-0 items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss-50 text-moss-700"><Store className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-ink">{delivery.buyerName}</h2><ConfirmationStatusBadge status={delivery.confirmationStatus} /></div><p className="mt-1 text-xs text-slate-500">Накладная {delivery.invoiceNumber} · {formatDate(delivery.deliveryDate)}</p></div></div><div><p className="text-xs text-slate-500">Сумма требования</p><p className="mt-1 font-semibold">{formatCurrency(delivery.amount)}</p></div><Link href={`/applications/${delivery.id}`} className={primaryLinkClass}>Открыть сделку <ArrowRight className="h-4 w-4" /></Link></article>)}</div></div>;
}
