"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Copy, FileText, RefreshCw, Send, Store, Timer, WalletCards } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ApplicationTimeline } from "@/components/application-timeline";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton, SecondaryButton, secondaryLinkClass } from "@/components/ui/buttons";
import { StatusBadge } from "@/components/ui/status-badge";
import { PreliminaryOffer } from "@/components/preliminary-offer";
import { useApplications } from "@/lib/application-store";
import { formatCurrency, formatDate } from "@/lib/format";

export function ApplicationDetail({ id }: { id: string }) {
  const { applications, updateApplication, hydrated } = useApplications();
  const application = useMemo(() => applications.find((item) => item.id === id), [applications, id]);
  const [modalOpen, setModalOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false), []);

  if (!application) {
    return <div className="pt-10"><EmptyState title={hydrated ? "Заявка не найдена" : "Загружаем заявку"} text={hydrated ? "Проверьте номер или вернитесь к списку заявок." : "Данные появятся через мгновение."} action={hydrated ? <Link href="/applications" className={secondaryLinkClass}>К списку заявок</Link> : undefined} /></div>;
  }

  const confirmationLink = typeof window === "undefined" ? `/confirm/supply-${id}` : `${window.location.origin}/confirm/supply-${id}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(confirmationLink);
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Одноразовая ссылка скопирована" }));
    } catch {
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: confirmationLink }));
    }
  };
  const transfer = async () => {
    setTransferring(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    updateApplication(id, { status: "transferred", transferredAt: new Date().toISOString() });
    setTransferring(false);
    setModalOpen(false);
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Заявка передана финансовому партнёру" }));
  };

  return (
    <div className="animate-rise">
      <div className="mb-7"><Link href="/applications" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-ink"><ArrowLeft className="h-4 w-4" /> Все заявки</Link></div>
      <header className="mb-8 flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="eyebrow mb-2">Поставка · {application.network}</p><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">Заявка №{application.id}</h1><StatusBadge status={application.status} /></div><p className="mt-3 text-sm text-muted">Создана {formatDate(application.createdAt.slice(0, 10))} · накладная {application.invoiceNumber}</p></div>
        <p className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">{formatCurrency(application.amount)}</p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
        <div className="space-y-7">
          {application.status === "awaiting_confirmation" && (
            <section className="border-y border-amber-200 bg-amber-50 px-4 py-6 sm:rounded-lg sm:border sm:p-6">
              <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 ring-1 ring-amber-200"><Timer className="h-5 w-5" /></span><div><p className="eyebrow !text-amber-800 mb-1">Требуется действие сети</p><h2 className="text-xl font-semibold text-ink">Ожидаем подтверждение поставки</h2><p className="mt-2 text-sm leading-6 text-slate-600">Ссылка была отправлена представителю торговой сети.</p></div></div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row"><SecondaryButton type="button" onClick={copyLink}><Copy className="h-4 w-4" /> Копировать ссылку</SecondaryButton><PrimaryButton type="button" onClick={() => window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Ссылка отправлена повторно" }))}><RefreshCw className="h-4 w-4" /> Отправить повторно</PrimaryButton><Link href={`/confirm/supply-${id}`} target="_blank" className={`${secondaryLinkClass} sm:ml-auto`}>Открыть как сеть</Link></div>
            </section>
          )}
          {application.status === "precheck_passed" && <PreliminaryOffer application={application} onTransfer={() => setModalOpen(true)} />}
          {application.status === "transferred" && (
            <section className="border-y border-blue-200 bg-blue-50/70 px-4 py-6 sm:rounded-lg sm:border sm:p-6"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 ring-1 ring-blue-200"><Send className="h-5 w-5" /></span><div><p className="eyebrow !text-blue-800 mb-1">Передача завершена</p><h2 className="text-xl font-semibold text-ink">Передано финансовому партнёру</h2><p className="mt-2 text-sm leading-6 text-slate-600">Менеджер финансового партнёра свяжется с вами для обсуждения условий и заключения договора.</p></div></div></section>
          )}
          {application.status === "paid" && <section className="border-y border-emerald-200 bg-emerald-50 px-4 py-6 sm:rounded-lg sm:border sm:p-6"><div className="flex items-start gap-4"><CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-700" /><div><h2 className="text-xl font-semibold">Финансирование завершено</h2><p className="mt-2 text-sm text-slate-600">Средства перечислены по условиям финансового партнёра.</p></div></div></section>}

          <section aria-labelledby="details-heading"><div className="mb-4"><p className="eyebrow mb-1">Сведения</p><h2 id="details-heading" className="section-title">Детали поставки</h2></div><dl className="grid border-y border-line bg-paper sm:grid-cols-2 sm:rounded-lg sm:border">
            <Detail label="Торговая сеть" value={application.network} icon={<Store className="h-4 w-4" />} />
            <Detail label="Сумма поставки" value={formatCurrency(application.amount)} icon={<WalletCards className="h-4 w-4" />} />
            <Detail label="Дата поставки" value={formatDate(application.deliveryDate)} />
            <Detail label="Оплата по договору" value={`${formatDate(application.paymentDate)} · ${application.termDays} дней`} />
          </dl></section>

          <section aria-labelledby="documents-heading"><div className="mb-4"><p className="eyebrow mb-1">Пакет</p><h2 id="documents-heading" className="section-title">Документы</h2></div><div className="divide-y divide-line border-y border-line bg-paper sm:rounded-lg sm:border">{application.documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-3 px-4 py-3.5"><div className="flex min-w-0 items-center gap-3"><FileText className="h-5 w-5 shrink-0 text-moss-700" /><div className="min-w-0"><p className="text-sm font-semibold">{document.label}</p><p className="truncate text-xs text-slate-500">{document.name}</p></div></div><span className="text-xs font-medium text-moss-700">Загружен</span></div>)}</div></section>
        </div>

        <aside className="self-start border-t border-line pt-6 xl:sticky xl:top-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0"><p className="eyebrow mb-2">Статус заявки</p><h2 className="mb-6 text-xl font-semibold text-ink">Ход рассмотрения</h2><ApplicationTimeline status={application.status} /></aside>
      </div>
      <ConfirmationModal open={modalOpen} onClose={closeModal} onConfirm={transfer} loading={transferring} />
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="border-b border-line px-4 py-4 last:border-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r"><dt className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</dt><dd className="mt-1.5 text-sm font-semibold text-ink">{value}</dd></div>;
}
