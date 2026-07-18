"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploader } from "@/components/form/file-uploader";
import { FormField } from "@/components/form/form-field";
import { StepIndicator } from "@/components/form/step-indicator";
import { PrimaryButton, SecondaryButton, primaryLinkClass, secondaryLinkClass } from "@/components/ui/buttons";
import { useApplications } from "@/lib/application-store";
import { networkOptions } from "@/lib/demo-data";
import { calculateDays, formatCurrency, formatDate } from "@/lib/format";
import { Application, ApplicationDocument, ApplicationDraft, DocumentType } from "@/lib/types";

const DRAFT_KEY = "mighty-miners-application-draft-v1";
const emptyDraft: ApplicationDraft = { network: "", amount: "", invoiceNumber: "", deliveryDate: "2026-07-18", paymentDate: "2026-10-16", documents: {}, step: 1 };

export function ApplicationWizard() {
  const router = useRouter();
  const { applications, addApplication } = useApplications();
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) setDraft(JSON.parse(saved) as ApplicationDraft);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready && !successId) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, ready, successId]);

  const termDays = useMemo(() => calculateDays(draft.deliveryDate, draft.paymentDate), [draft.deliveryDate, draft.paymentDate]);
  const documents = Object.values(draft.documents).filter(Boolean) as ApplicationDocument[];
  const requiredDocumentsReady = ["invoice", "bill", "contract"].every((type) => draft.documents[type as DocumentType]);

  const update = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (draft.step === 1) {
      if (!draft.network) next.network = "Выберите торговую сеть";
      if (!draft.amount || Number(draft.amount) <= 0) next.amount = "Введите сумму больше нуля";
      if (!draft.invoiceNumber.trim()) next.invoiceNumber = "Введите номер накладной";
    }
    if (draft.step === 2) {
      if (!draft.deliveryDate) next.deliveryDate = "Укажите дату поставки";
      if (!draft.paymentDate) next.paymentDate = "Укажите дату оплаты";
      if (draft.deliveryDate && draft.paymentDate && termDays <= 0) next.paymentDate = "Дата оплаты должна быть позже даты поставки";
    }
    if (draft.step === 3 && !requiredDocumentsReady) next.documents = "Загрузите три обязательных документа";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStep = () => {
    if (!validate()) return;
    setDraft((current) => ({ ...current, step: Math.min(4, current.step + 1) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const nextId = String(Math.max(...applications.map((item) => Number(item.id)), 125) + 1);
    const application: Application = {
      id: nextId,
      network: draft.network,
      amount: Number(draft.amount),
      invoiceNumber: draft.invoiceNumber,
      deliveryDate: draft.deliveryDate,
      paymentDate: draft.paymentDate,
      termDays,
      status: "awaiting_confirmation",
      remainingDays: Math.max(0, termDays - 3),
      documents,
      createdAt: new Date().toISOString(),
    };
    addApplication(application);
    window.localStorage.removeItem(DRAFT_KEY);
    setSuccessId(nextId);
    setSubmitting(false);
  };

  const cancel = () => {
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Черновик сохранён автоматически" }));
    router.push("/");
  };

  if (successId) return <ApplicationSuccess id={successId} />;

  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button type="button" onClick={cancel} className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-ink"><ArrowLeft className="h-4 w-4" /> На главную</button>
        <span className="text-xs font-medium text-slate-500">Черновик сохраняется автоматически</span>
      </div>
      <header className="mb-8">
        <p className="eyebrow mb-2">Новая заявка</p>
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">Подготовим поставку к финансированию</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Заполните данные и приложите документы. Отправка заявки не является кредитным договором.</p>
      </header>
      <div className="mb-8 border-y border-line bg-paper px-2 py-5 sm:rounded-lg sm:border sm:px-6"><StepIndicator current={draft.step} /></div>
      <section key={draft.step} className="animate-scale-in border-y border-line bg-paper px-4 py-6 shadow-soft sm:rounded-lg sm:border sm:p-8">
        {draft.step === 1 && <StepSupply draft={draft} errors={errors} update={update} />}
        {draft.step === 2 && <StepDates draft={draft} errors={errors} update={update} termDays={termDays} />}
        {draft.step === 3 && <StepDocuments draft={draft} error={errors.documents} update={update} />}
        {draft.step === 4 && <StepReview draft={draft} termDays={termDays} documentsCount={documents.length} />}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
          {draft.step === 1 ? <SecondaryButton type="button" onClick={cancel}>Отмена</SecondaryButton> : <SecondaryButton type="button" onClick={() => setDraft((current) => ({ ...current, step: current.step - 1 }))}><ArrowLeft className="h-4 w-4" /> Назад</SecondaryButton>}
          {draft.step < 4 ? <PrimaryButton type="button" onClick={nextStep}>Далее <ArrowRight className="h-4 w-4" /></PrimaryButton> : <PrimaryButton type="button" loading={submitting} onClick={submit}><ShieldCheck className="h-4 w-4" /> Отправить заявку</PrimaryButton>}
        </div>
      </section>
    </div>
  );
}

type UpdateDraft = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => void;

function StepSupply({ draft, errors, update }: { draft: ApplicationDraft; errors: Record<string, string>; update: UpdateDraft }) {
  return <div><StepHeading number="01" title="Поставка" text="Укажите контрагента и данные отгрузки." /><div className="mt-7 grid gap-5">
    <FormField label="Торговая сеть" htmlFor="network" required error={errors.network}><select id="network" value={draft.network} onChange={(event) => update("network", event.target.value)} className="control" aria-invalid={Boolean(errors.network)}><option value="">Выберите торговую сеть</option>{networkOptions.map((network) => <option key={network}>{network}</option>)}</select></FormField>
    <FormField label="Сумма поставки" htmlFor="amount" required hint="Укажите сумму по накладной без разделителей" error={errors.amount}><div className="relative"><input id="amount" inputMode="numeric" type="number" min="1" value={draft.amount} onChange={(event) => update("amount", event.target.value)} placeholder="Например, 2 000 000" className="control pr-12" aria-invalid={Boolean(errors.amount)} /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-slate-500">₸</span></div></FormField>
    <FormField label="Номер накладной" htmlFor="invoiceNumber" required error={errors.invoiceNumber}><input id="invoiceNumber" value={draft.invoiceNumber} onChange={(event) => update("invoiceNumber", event.target.value)} placeholder="Например, TL-1807-25" className="control" aria-invalid={Boolean(errors.invoiceNumber)} /></FormField>
  </div></div>;
}

function StepDates({ draft, errors, update, termDays }: { draft: ApplicationDraft; errors: Record<string, string>; update: UpdateDraft; termDays: number }) {
  return <div><StepHeading number="02" title="Даты" text="Срок ожидания рассчитается автоматически." /><div className="mt-7 grid gap-5 sm:grid-cols-2">
    <FormField label="Дата поставки" htmlFor="deliveryDate" required error={errors.deliveryDate}><input id="deliveryDate" type="date" value={draft.deliveryDate} onChange={(event) => update("deliveryDate", event.target.value)} className="control" /></FormField>
    <FormField label="Дата оплаты по договору" htmlFor="paymentDate" required error={errors.paymentDate}><input id="paymentDate" type="date" value={draft.paymentDate} onChange={(event) => update("paymentDate", event.target.value)} className="control" /></FormField>
  </div>{termDays > 0 && <div className="mt-6 flex items-center gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"><CalendarDays className="h-5 w-5 shrink-0 text-amber-700" /><span>Срок оплаты: <strong>{termDays} дней</strong></span></div>}</div>;
}

function StepDocuments({ draft, error, update }: { draft: ApplicationDraft; error?: string; update: UpdateDraft }) {
  const setDocument = (type: DocumentType, document?: ApplicationDocument) => update("documents", { ...draft.documents, [type]: document });
  return <div><StepHeading number="03" title="Документы" text="Файлы сохраняются как метаданные в demo-режиме." /><div className="mt-7 grid gap-3">
    <FileUploader type="invoice" label="Накладная" value={draft.documents.invoice} onChange={(file) => setDocument("invoice", file)} />
    <FileUploader type="bill" label="Счёт-фактура" value={draft.documents.bill} onChange={(file) => setDocument("bill", file)} />
    <FileUploader type="contract" label="Договор" value={draft.documents.contract} onChange={(file) => setDocument("contract", file)} />
    <FileUploader type="acceptance" label="Акт приёма" optional value={draft.documents.acceptance} onChange={(file) => setDocument("acceptance", file)} />
  </div>{error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}<p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" /> В production файлы будут загружаться в закрытый Supabase Storage bucket; сейчас для демонстрации сохраняются только имена.</p></div>;
}

function StepReview({ draft, termDays, documentsCount }: { draft: ApplicationDraft; termDays: number; documentsCount: number }) {
  const rows = [["Торговая сеть", draft.network], ["Сумма поставки", formatCurrency(Number(draft.amount))], ["Номер накладной", draft.invoiceNumber], ["Дата поставки", formatDate(draft.deliveryDate)], ["Оплата по договору", `${formatDate(draft.paymentDate)} (${termDays} дней)`], ["Документы", `${documentsCount} файла`]];
  return <div><StepHeading number="04" title="Проверка и отправка" text="Проверьте сведения перед отправкой запроса сети." /><dl className="mt-7 divide-y divide-line border-y border-line">{rows.map(([label, value]) => <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[1fr_1.4fr]"><dt className="text-sm text-slate-500">{label}</dt><dd className="text-sm font-semibold text-ink sm:text-right">{value}</dd></div>)}</dl><div className="mt-5 flex items-start gap-3 border border-moss-200 bg-moss-50 px-4 py-3 text-sm leading-5 text-moss-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><span><strong className="block">Всё готово к отправке</strong>Мы создадим одноразовую ссылку для подтверждения поставки.</span></div></div>;
}

function StepHeading({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="flex items-start gap-4"><span className="font-display text-3xl text-moss-500">{number}</span><div><h2 className="text-xl font-semibold text-ink">{title}</h2><p className="mt-1 text-sm text-muted">{text}</p></div></div>;
}

function ApplicationSuccess({ id }: { id: string }) {
  return <div className="mx-auto flex min-h-[70vh] max-w-xl animate-scale-in flex-col items-center justify-center text-center"><span className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-moss-50 text-moss-700 ring-1 ring-moss-200"><CheckCircle2 className="h-10 w-10" /></span><p className="eyebrow mb-2">Заявка №{id}</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Заявка отправлена</h1><p className="mt-4 max-w-md text-base leading-7 text-muted">Мы подготовили запрос на подтверждение поставки.</p><div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row"><Link href={`/applications/${id}`} className={primaryLinkClass}>Перейти к заявке <ArrowRight className="h-4 w-4" /></Link><Link href="/" className={secondaryLinkClass}>На главную</Link></div></div>;
}
