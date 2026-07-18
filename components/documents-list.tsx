"use client";

import Link from "next/link";
import { FileCheck2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { useApplications } from "@/lib/application-store";
import { formatDate } from "@/lib/format";

export function DocumentsList() {
  const { applications } = useApplications();
  const [query, setQuery] = useState("");
  const documents = useMemo(() => applications.flatMap((application) => application.documents.map((document) => ({ ...document, applicationId: application.id, network: application.network, createdAt: application.createdAt }))).filter((document) => `${document.name} ${document.label} ${document.applicationId}`.toLowerCase().includes(query.trim().toLowerCase())), [applications, query]);
  return <div className="animate-rise"><header className="mb-8"><p className="eyebrow mb-2">Архив</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Документы</h1><p className="mt-2 text-sm text-muted">Файлы, прикреплённые к заявкам Tea Local LLP.</p></header><label className="relative mb-5 block max-w-xl"><span className="sr-only">Поиск документов</span><Search className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><input className="control pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название файла или номер заявки" /></label>{documents.length ? <div className="divide-y divide-line border-y border-line bg-paper sm:rounded-lg sm:border">{documents.map((document) => <Link key={`${document.applicationId}-${document.id}`} href={`/applications/${document.applicationId}`} className="group grid gap-2 px-4 py-4 transition hover:bg-moss-50/50 sm:grid-cols-[minmax(0,1fr)_180px_120px] sm:items-center"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss-50 text-moss-700"><FileCheck2 className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{document.name}</p><p className="text-xs text-slate-500">{document.label}</p></div></div><p className="text-xs text-slate-500 sm:text-sm">Заявка №{document.applicationId} · {document.network}</p><p className="text-xs text-slate-400 sm:text-right">{formatDate(document.createdAt.slice(0, 10))}</p></Link>)}</div> : <EmptyState title="Документы не найдены" text="Попробуйте изменить поисковый запрос." />}</div>;
}
