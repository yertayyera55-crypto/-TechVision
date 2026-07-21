"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploader } from "@/components/form/file-uploader";
import { DocumentAnalysisPanel } from "@/components/form/document-analysis-panel";
import { FlowFactorQuestionnaire } from "@/components/form/flowfactor-questionnaire";
import { StepIndicator } from "@/components/form/step-indicator";
import { PrimaryButton, SecondaryButton, primaryLinkClass, secondaryLinkClass } from "@/components/ui/buttons";
import { createDemoFlowFactorOffer } from "@/data/demo-offers";
import { useApplications } from "@/lib/application-store";
import { DEFAULT_COMPANY_PROFILE, mergeCompanyProfile, readCompanyProfile, saveCompanyProfile } from "@/lib/company-profile";
import { defaultContractConditions } from "@/lib/demo-data";
import { calculateDays } from "@/lib/format";
import { Application, ApplicationDocument, ApplicationDraft, ContractAnalysisResult, DocumentType } from "@/lib/types";

const DRAFT_KEY = "flowfactor-application-draft-v5";
const LEGACY_DRAFT_KEYS = ["flowfactor-application-draft-v4", "mighty-miners-application-draft-v2"];
const emptyDraft: ApplicationDraft = {
  network: "",
  amount: "",
  invoiceNumber: "",
  deliveryDate: "",
  paymentDate: "",
  paymentTermDays: "",
  paymentTerms: "",
  contractNumber: "",
  supplySubject: "",
  companyProfile: DEFAULT_COMPANY_PROFILE,
  documents: {},
  step: 1,
};

export function ApplicationWizard() {
  const router = useRouter();
  const { applications, addApplication } = useApplications();
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft);
  const [analysis, setAnalysis] = useState<ContractAnalysisResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- черновик и профиль синхронизируются с browser storage после SSR. */
  useEffect(() => {
    try {
      const currentSaved = window.localStorage.getItem(DRAFT_KEY);
      const legacySaved = LEGACY_DRAFT_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);
      const saved = currentSaved ?? legacySaved;
      const parsed = saved ? JSON.parse(saved) as Partial<ApplicationDraft> : {};
      setDraft({
        ...emptyDraft,
        ...parsed,
        companyProfile: mergeCompanyProfile(parsed.companyProfile ?? readCompanyProfile()),
        documents: parsed.documents ?? {},
        step: currentSaved ? Math.min(2, Math.max(1, Number(parsed.step) || 1)) : 1,
      });
    } catch {
      setDraft({ ...emptyDraft, companyProfile: readCompanyProfile() });
    } finally {
      setReady(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (ready && !successId) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, ready, successId]);

  const dateTermDays = useMemo(() => calculateDays(draft.deliveryDate, draft.paymentDate), [draft.deliveryDate, draft.paymentDate]);
  const explicitTermDays = Number(draft.paymentTermDays);
  const termDays = explicitTermDays > 0 ? explicitTermDays : dateTermDays;
  const documents = Object.values(draft.documents).filter(Boolean) as ApplicationDocument[];
  const update = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const applyAnalysis = (nextAnalysis: ContractAnalysisResult) => {
    setAnalysis(nextAnalysis);
    setDraft((current) => ({
      ...current,
      network: nextAnalysis.network ?? nextAnalysis.buyerName ?? current.network,
      amount: nextAnalysis.amount !== null ? String(nextAnalysis.amount) : current.amount,
      invoiceNumber: nextAnalysis.invoiceNumber ?? current.invoiceNumber,
      deliveryDate: nextAnalysis.deliveryDate ?? current.deliveryDate,
      paymentDate: nextAnalysis.paymentDueDate ?? current.paymentDate,
      paymentTermDays: nextAnalysis.paymentTermDays !== null ? String(nextAnalysis.paymentTermDays) : current.paymentTermDays,
      paymentTerms: nextAnalysis.paymentTerms ?? current.paymentTerms,
      contractNumber: nextAnalysis.contractNumber ?? current.contractNumber,
      supplySubject: nextAnalysis.supplySubject ?? current.supplySubject,
    }));
    setErrors({});
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Анкета FlowFactor заполнена данными из договора" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (draft.step === 1 && !draft.documents.contract) next.documents = "Загрузите договор в PDF или выберите демодоговор";
    if (draft.step === 2) {
      const profileFields: Array<[keyof ApplicationDraft["companyProfile"], string]> = [["company", "Укажите название компании"], ["bin", "Укажите БИН"], ["industry", "Укажите отрасль"], ["annualTurnover", "Укажите годовой оборот"], ["yearsInBusiness", "Укажите срок работы компании"], ["contact", "Укажите контактное лицо"], ["phone", "Укажите телефон"], ["email", "Укажите email"]];
      profileFields.forEach(([key, message]) => { if (!draft.companyProfile[key].trim()) next[key] = message; });
      if (!draft.network.trim()) next.network = "Укажите покупателя";
      if (!draft.contractNumber.trim()) next.contractNumber = "Укажите номер договора";
      if (!draft.supplySubject.trim()) next.supplySubject = "Укажите предмет поставки";
      if (!draft.amount || Number(draft.amount) <= 0) next.amount = "Введите сумму больше нуля";
      if (!draft.invoiceNumber.trim()) next.invoiceNumber = "Введите номер накладной";
      if (!draft.deliveryDate) next.deliveryDate = "Укажите дату поставки";
      if (!draft.paymentDate) next.paymentDate = "Укажите дату оплаты";
      if (draft.deliveryDate && draft.paymentDate && dateTermDays <= 0) next.paymentDate = "Дата оплаты должна быть позже даты поставки";
      if (termDays <= 0) next.paymentTermDays = "Укажите срок отсрочки";
      if (!draft.paymentTerms.trim()) next.paymentTerms = "Укажите условия оплаты";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStep = () => {
    if (!validate()) return;
    setDraft((current) => ({ ...current, step: 2 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const nextId = String(Math.max(...applications.map((item) => Number(item.id)), 125) + 1);
    const amount = Number(draft.amount);
    const application: Application = {
      id: nextId,
      supplierName: draft.companyProfile.company,
      buyerName: draft.network,
      network: draft.network,
      amount,
      costAmount: 0,
      productionExpenses: 0,
      invoiceNumber: draft.invoiceNumber,
      deliveryDate: draft.deliveryDate,
      paymentDueDate: draft.paymentDate,
      paymentDate: draft.paymentDate,
      delayDays: termDays,
      termDays,
      confirmationStatus: "not_sent",
      reminderCount: 0,
      status: "precheck_passed",
      remainingDays: Math.max(0, termDays - 3),
      documents,
      contractConditions: defaultContractConditions,
      createdAt: new Date().toISOString(),
      financialDataCompleted: true,
      factoringOffer: createDemoFlowFactorOffer(nextId, amount, termDays),
      selectedFactoringType: "recourse",
      contractNumber: draft.contractNumber,
      supplySubject: draft.supplySubject,
      paymentTerms: draft.paymentTerms,
      companyProfile: draft.companyProfile,
    };
    saveCompanyProfile(draft.companyProfile);
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

  return <div className="mx-auto max-w-5xl animate-rise"><div className="mb-6 flex items-center justify-between gap-4"><button type="button" onClick={cancel} className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-ink"><ArrowLeft className="h-4 w-4" /> На главную</button><span className="text-xs font-medium text-slate-500">Черновик сохраняется автоматически</span></div><header className="mb-8"><p className="eyebrow mb-2">Новая заявка</p><h1 className="font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">Договор → анкета FlowFactor</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Загрузите договор, дождитесь AI-анализа и проверьте автоматически заполненную анкету. Вручную заполняются только данные, которых нет в профиле или договоре.</p></header><div className="mb-8 border-y border-line bg-paper px-2 py-5 sm:rounded-lg sm:border sm:px-6"><StepIndicator current={draft.step} /></div><section key={draft.step} className="animate-scale-in border-y border-line bg-paper px-4 py-6 shadow-soft sm:rounded-lg sm:border sm:p-8">{draft.step === 1 && <StepAnalysis draft={draft} error={errors.documents} update={update} onAnalysis={applyAnalysis} />}{draft.step === 2 && <FlowFactorQuestionnaire draft={draft} analysis={analysis} errors={errors} onDraftChange={update} />}<div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">{draft.step === 1 ? <SecondaryButton type="button" onClick={cancel}>Отмена</SecondaryButton> : <SecondaryButton type="button" onClick={() => setDraft((current) => ({ ...current, step: 1 }))}><ArrowLeft className="h-4 w-4" /> К договору</SecondaryButton>}{draft.step === 1 ? <PrimaryButton type="button" onClick={nextStep}>Перейти к анкете <ArrowRight className="h-4 w-4" /></PrimaryButton> : <PrimaryButton type="button" loading={submitting} onClick={submit}><ShieldCheck className="h-4 w-4" /> Подтвердить и отправить в FlowFactor</PrimaryButton>}</div></section></div>;
}

type UpdateDraft = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => void;

function StepAnalysis({ draft, error, update, onAnalysis }: { draft: ApplicationDraft; error?: string; update: UpdateDraft; onAnalysis: (analysis: ContractAnalysisResult) => void }) {
  const setDocument = (type: DocumentType, document?: ApplicationDocument) => update("documents", { ...draft.documents, [type]: document });
  return <div><StepHeading number="01" title="Договор и AI-анализ" text="Загрузите договор: AI извлечёт только найденные данные для анкеты и не будет придумывать отсутствующие сведения." /><div className="mt-7 grid gap-3"><FileUploader type="contract" label="Загрузите договор" value={draft.documents.contract} accept=".pdf" allowedMimeTypes={["application/pdf"]} helpText="PDF до 10 МБ" onChange={(file) => setDocument("contract", file)} /><DocumentAnalysisPanel contract={draft.documents.contract} supportingDocuments={[]} onUseDemo={(file) => setDocument("contract", file)} onApply={onAnalysis} /></div>{error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}<p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Если Codex CLI недоступен, откройте анкету и заполните только пустые поля вручную.</p></div>;
}

function StepHeading({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="flex items-start gap-4"><span className="font-display text-3xl text-moss-500">{number}</span><div><h2 className="text-xl font-semibold text-ink">{title}</h2><p className="mt-1 text-sm text-muted">{text}</p></div></div>;
}

function ApplicationSuccess({ id }: { id: string }) {
  return <div className="mx-auto flex min-h-[70vh] max-w-xl animate-scale-in flex-col items-center justify-center text-center"><span className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-moss-50 text-moss-700 ring-1 ring-moss-200"><CheckCircle2 className="h-10 w-10" /></span><p className="eyebrow mb-2">Заявка №{id}</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Анкета отправлена в FlowFactor</h1><p className="mt-4 max-w-md text-base leading-7 text-muted">Анкета передана на внутреннюю демонстрационную проверку. Затем FlowFactor покажет предварительное предложение.</p><div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row"><Link href={`/applications/${id}`} className={primaryLinkClass}>Перейти к заявке <ArrowRight className="h-4 w-4" /></Link><Link href="/" className={secondaryLinkClass}>На главную</Link></div></div>;
}
