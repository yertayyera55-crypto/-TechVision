"use client";

import Link from "next/link";
import { ArrowUpRight, FileCheck2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DocumentActions } from "@/components/document-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { useApplications } from "@/lib/application-store";
import { formatDate } from "@/lib/format";

export function DocumentsList() {
  const { applications, updateApplication } = useApplications();
  const [query, setQuery] = useState("");
  const documents = useMemo(() => applications
    .flatMap((application) => application.documents.map((document) => ({ ...document, applicationId: application.id, network: application.network, createdAt: application.createdAt })))
    .filter((document) => `${document.name} ${document.label} ${document.applicationId}`.toLowerCase().includes(query.trim().toLowerCase())), [applications, query]);

  return <div className="animate-rise"><header className="mb-8"><p className="eyebrow mb-2">Архив</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Документы</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Новые загруженные файлы сохраняются в этом браузере: их можно открыть или скачать даже после обновления страницы.</p></header><label className="relative mb-5 block max-w-xl"><span className="sr-only">Поиск документов</span><Search className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><input className="control pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название файла или номер заявки" /></label>{documents.length ? <div className="divide-y divide-line border-y border-line bg-paper sm:rounded-lg sm:border">{documents.map((document) => <article key={`${document.applicationId}-${document.id}`} className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="flex min-w-0 items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss-50 text-moss-700"><FileCheck2 className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{document.name}</p><p className="mt-0.5 text-xs text-slate-500">{document.label} · {document.storageKind === "indexeddb" ? "файл сохранён" : "demo без содержимого"}</p><Link href={`/applications/${document.applicationId}#documents`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-moss-700 hover:underline">Заявка №{document.applicationId} · {document.network}<ArrowUpRight className="h-3 w-3" /></Link><p className="mt-1 text-[10px] text-slate-400">Добавлен {formatDate(document.createdAt.slice(0, 10))}</p></div></div><DocumentActions document={document} onReplace={(replacement) => { const application = applications.find((item) => item.id === document.applicationId); if (application) updateApplication(application.id, { documents: application.documents.map((item) => item.id === document.id ? replacement : item) }); }} /></article>)}</div> : <EmptyState title="Документы не найдены" text="Попробуйте изменить поисковый запрос." />}</div>;
}
