"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisReview } from "@/components/form/analysis-review";
import { DocumentAnalysisPanel } from "@/components/form/document-analysis-panel";
import { FileUploader } from "@/components/form/file-uploader";
import { FlowFactorQuestionnaire } from "@/components/form/flowfactor-questionnaire";
import { ReceivableReadiness } from "@/components/form/receivable-readiness";
import { StepIndicator } from "@/components/form/step-indicator";
import { PrimaryButton, SecondaryButton, primaryLinkClass, secondaryLinkClass } from "@/components/ui/buttons";
import { useApplications } from "@/lib/application-store";
import { DEFAULT_COMPANY_PROFILE, mergeCompanyProfile, readCompanyProfile, saveCompanyProfile } from "@/lib/company-profile";
import { defaultContractConditions } from "@/lib/demo-data";
import { calculateReadiness, calculateReceivable, classifyProduct, matchDemoPartners } from "@/lib/factoring-engine";
import { Application, ApplicationDocument, ApplicationDraft, ContractAnalysisResult, DocumentType, ProductCategory } from "@/lib/types";

const DRAFT_KEY = "flowfactor-application-draft-v6";
const emptyDraft: ApplicationDraft = { network: "", amount: "", invoiceNumber: "", deliveryDate: "", paymentDate: "", paymentTermDays: "", paymentTerms: "", contractNumber: "", supplySubject: "", acceptanceTerms: "", assignmentTerms: "", productCategory: "other", categoryConfidence: 0, categoryConfirmed: false, acceptedSupplyAmount: "", returnsAmount: "0", holdsAmount: "0", confirmationDate: "", desiredFinancingAmount: "", analysis: null, companyProfile: DEFAULT_COMPANY_PROFILE, documents: {}, step: 1 };

export function ApplicationWizard() {
  const router = useRouter();
  const { applications, addApplication } = useApplications();
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- draft hydrates from browser storage after SSR. */
  useEffect(() => { try { const saved = window.localStorage.getItem(DRAFT_KEY); const parsed = saved ? JSON.parse(saved) as Partial<ApplicationDraft> : {}; const profile = mergeCompanyProfile(parsed.companyProfile ?? readCompanyProfile()); setDraft({ ...emptyDraft, ...parsed, companyProfile: profile, network: parsed.network || profile.mainBuyer, documents: parsed.documents ?? {}, step: Math.min(4, Math.max(1, Number(parsed.step) || 1)) }); } catch { const profile = readCompanyProfile(); setDraft({ ...emptyDraft, companyProfile: profile, network: profile.mainBuyer }); } finally { setReady(true); } }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => { if (ready && !successId) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft, ready, successId]);

  const documents = Object.values(draft.documents).filter(Boolean) as ApplicationDocument[];
  const update = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => { setDraft((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); };
  const setDocument = (type: DocumentType, document?: ApplicationDocument) => update("documents", { ...draft.documents, [type]: document });

  const applyAnalysis = (analysis: ContractAnalysisResult) => {
    const classified = classifyProduct(analysis.supplySubject ?? "", draft.companyProfile.mainProducts, analysis.productCategory);
    const amount = analysis.amount ?? (Number(draft.amount) || 0);
    setDraft((current) => ({ ...current, analysis, network: analysis.network ?? analysis.buyerName ?? current.network, amount: amount ? String(amount) : current.amount, invoiceNumber: analysis.invoiceNumber ?? current.invoiceNumber, deliveryDate: analysis.deliveryDate ?? current.deliveryDate, paymentDate: analysis.paymentDueDate ?? current.paymentDate, paymentTermDays: analysis.paymentTermDays !== null ? String(analysis.paymentTermDays) : current.paymentTermDays, paymentTerms: analysis.paymentTerms ?? current.paymentTerms, contractNumber: analysis.contractNumber ?? current.contractNumber, supplySubject: analysis.supplySubject ?? current.supplySubject, acceptanceTerms: analysis.acceptanceTerms ?? current.acceptanceTerms, assignmentTerms: analysis.assignmentTerms ?? current.assignmentTerms, productCategory: classified.category, categoryConfidence: analysis.categoryConfidence ?? classified.confidence, categoryConfirmed: false, acceptedSupplyAmount: amount ? String(amount) : current.acceptedSupplyAmount, confirmationDate: analysis.deliveryDate ?? current.confirmationDate, desiredFinancingAmount: amount ? String(Math.round(amount * 0.95)) : current.desiredFinancingAmount }));
    setErrors({});
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Договор проанализирован, паспорт сделки подготовлен" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (draft.step === 1) { if (!draft.documents.contract) next.documents = "Загрузите PDF-договор или запустите готовое демо"; else if (!draft.analysis) next.analysis = "Сначала проанализируйте договор"; }
    if (draft.step === 3) { if (Number(draft.acceptedSupplyAmount) <= 0) next.acceptedSupplyAmount = "Укажите сумму принятых поставок"; if (Number(draft.returnsAmount) < 0) next.returnsAmount = "Сумма не может быть отрицательной"; if (Number(draft.holdsAmount) < 0) next.holdsAmount = "Сумма не может быть отрицательной"; if (!draft.confirmationDate) next.confirmationDate = "Укажите дату подтверждения"; if (Number(draft.desiredFinancingAmount) <= 0) next.desiredFinancingAmount = "Укажите желаемую сумму"; }
    if (draft.step === 4) { const requiredProfile: Array<[keyof typeof draft.companyProfile, string]> = [["company", "Укажите компанию"], ["bin", "Укажите БИН"], ["contact", "Укажите контакт"], ["phone", "Укажите телефон"], ["email", "Укажите email"]]; requiredProfile.forEach(([key, message]) => { if (!draft.companyProfile[key].trim()) next[key] = message; }); if (!draft.network.trim()) next.network = "Укажите покупателя"; if (!draft.contractNumber.trim()) next.contractNumber = "Укажите номер договора"; if (!draft.supplySubject.trim()) next.supplySubject = "Укажите предмет поставки"; if (Number(draft.amount) <= 0) next.amount = "Укажите сумму"; if (Number(draft.paymentTermDays) <= 0) next.paymentTermDays = "Укажите срок отсрочки"; }
    setErrors(next); return Object.keys(next).length === 0;
  };

  const nextStep = () => { if (!validate()) return; setDraft((current) => ({ ...current, step: Math.min(4, current.step + 1), categoryConfirmed: current.step === 2 ? true : current.categoryConfirmed })); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const previousStep = () => { setDraft((current) => ({ ...current, step: Math.max(1, current.step - 1) })); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = async () => {
    if (!validate() || !draft.analysis) return;
    setSubmitting(true); await new Promise((resolve) => setTimeout(resolve, 700));
    const id = String(Math.max(...applications.map((item) => Number(item.id)), 125) + 1);
    const amount = Number(draft.amount); const termDays = Number(draft.paymentTermDays);
    const receivable = calculateReceivable({ acceptedSupplyAmount: Number(draft.acceptedSupplyAmount), returnsAmount: Number(draft.returnsAmount), holdsAmount: Number(draft.holdsAmount), desiredFinancingAmount: Number(draft.desiredFinancingAmount), confirmationDate: draft.confirmationDate, paymentTermDays: termDays });
    const readiness = calculateReadiness(draft.productCategory, documents, draft.analysis);
    const partnerOffers = matchDemoPartners({ category: draft.productCategory, receivable, termDays, documents });
    const firstOffer = partnerOffers.find((offer) => offer.eligible) ?? partnerOffers[0];
    const application: Application = { id, supplierName: draft.companyProfile.company, buyerName: draft.network, network: draft.network, amount, costAmount: 0, productionExpenses: 0, invoiceNumber: draft.invoiceNumber || "Не указан", deliveryDate: draft.deliveryDate || draft.confirmationDate, paymentDueDate: receivable.dueDate || draft.paymentDate, paymentDate: receivable.dueDate || draft.paymentDate, delayDays: termDays, termDays, confirmationStatus: "not_sent", reminderCount: 0, status: "precheck_passed", remainingDays: termDays, documents, contractConditions: defaultContractConditions, createdAt: new Date().toISOString(), financialDataCompleted: true, factoringOffer: firstOffer ? { deliveryId: id, financingPercentage: firstOffer.financingPercentage, financingAmount: firstOffer.financingAmount, financingCost: firstOffer.cost, documentFees: 0, otherFees: 0, taxExpenses: 0, platformFee: 0, netAmount: firstOffer.netAmount, savedDays: termDays, factoringType: firstOffer.factoringType, gracePeriodDays: 20 } : undefined, contractNumber: draft.contractNumber, supplySubject: draft.supplySubject, paymentTerms: draft.paymentTerms, companyProfile: draft.companyProfile, analysis: draft.analysis, productCategory: draft.productCategory, receivable, readiness, partnerOffers };
    saveCompanyProfile(draft.companyProfile); addApplication(application); window.localStorage.removeItem(DRAFT_KEY); setSuccessId(id); setSubmitting(false);
  };

  const cancel = () => { window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Черновик сохранён автоматически" })); router.push("/"); };
  if (successId) return <ApplicationSuccess id={successId} />;
  return <div className="mx-auto max-w-6xl animate-rise">
    <div className="mb-6 flex items-center justify-between gap-4"><button type="button" onClick={cancel} className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-ink"><ArrowLeft className="h-4 w-4" /> На главную</button><span className="text-xs font-medium text-slate-500">Черновик сохраняется автоматически</span></div>
    <header className="mb-8"><p className="eyebrow mb-2">Получить финансирование</p><h1 className="font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">Договор → готовая заявка</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted">FlowFactor проанализирует договор, определит условия оплаты и категорию продукта, рассчитает требование и подготовит универсальную факторинговую заявку.</p></header>
    <div className="mb-8 border-y border-line bg-paper px-2 py-5 sm:rounded-lg sm:border sm:px-6"><StepIndicator current={draft.step} /></div>
    <section key={draft.step} className="animate-scale-in border-y border-line bg-paper px-4 py-6 shadow-soft sm:rounded-lg sm:border sm:p-8">
      {draft.step === 1 && <StepUpload draft={draft} error={errors.documents || errors.analysis} setDocument={setDocument} onBuyerChange={(value) => update("network", value)} onAnalysis={applyAnalysis} />}
      {draft.step === 2 && draft.analysis && <AnalysisReview draft={draft} analysis={draft.analysis} onCategoryChange={(productCategory: ProductCategory) => setDraft((current) => ({ ...current, productCategory, categoryConfidence: current.productCategory === productCategory ? current.categoryConfidence : 100, categoryConfirmed: true }))} />}
      {draft.step === 3 && draft.analysis && <ReceivableReadiness draft={draft} analysis={draft.analysis} errors={errors} onChange={update} />}
      {draft.step === 4 && <FlowFactorQuestionnaire draft={draft} analysis={draft.analysis} errors={errors} onDraftChange={update} />}
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">{draft.step === 1 ? <SecondaryButton type="button" onClick={cancel}>Отмена</SecondaryButton> : <SecondaryButton type="button" onClick={previousStep}><ArrowLeft className="h-4 w-4" /> Назад</SecondaryButton>}{draft.step < 4 ? <PrimaryButton type="button" onClick={nextStep}>{draft.step === 1 ? "Показать результат анализа" : draft.step === 2 ? "Подтвердить категорию" : "Сформировать анкету"} <ArrowRight className="h-4 w-4" /></PrimaryButton> : <PrimaryButton type="button" loading={submitting} onClick={() => void submit()}><ShieldCheck className="h-4 w-4" /> Подтвердить и проверить предложения</PrimaryButton>}</div>
    </section>
  </div>;
}

function StepUpload({ draft, error, setDocument, onBuyerChange, onAnalysis }: { draft: ApplicationDraft; error?: string; setDocument: (type: DocumentType, document?: ApplicationDocument) => void; onBuyerChange: (value: string) => void; onAnalysis: (analysis: ContractAnalysisResult) => void }) {
  const supporting = Object.values(draft.documents).filter((document): document is ApplicationDocument => Boolean(document && document.type !== "contract"));
  return <div><div className="flex items-start gap-4"><span className="font-display text-3xl text-moss-500">01</span><div><p className="eyebrow mb-1">Первое действие</p><h2 className="text-xl font-semibold text-ink">Загрузите договор</h2><p className="mt-1 text-sm leading-6 text-muted">FlowFactor проанализирует договор, определит условия оплаты и подготовит факторинговую заявку. Остальные документы можно добавить при наличии.</p></div></div><label className="mt-7 block max-w-xl"><span className="mb-2 block text-sm font-semibold text-ink">Покупатель / торговая сеть</span><input className="control" value={draft.network} placeholder="Например, ТОО «Aspan Market»" onChange={(event) => onBuyerChange(event.target.value)} /><span className="mt-1 block text-xs text-slate-500">Подставлено из профиля; после анализа договор имеет приоритет.</span></label><div className="mt-6 grid gap-3"><FileUploader type="contract" label="Договор поставки" value={draft.documents.contract} accept=".pdf" allowedMimeTypes={["application/pdf"]} helpText="Обязательный PDF до 10 МБ" onChange={(file) => setDocument("contract", file)} /><div className="grid gap-3 md:grid-cols-3"><FileUploader type="invoice" label="Накладная" optional value={draft.documents.invoice} accept=".pdf" allowedMimeTypes={["application/pdf"]} onChange={(file) => setDocument("invoice", file)} /><FileUploader type="esf" label="ЭСФ или акт приёмки" optional value={draft.documents.esf} accept=".pdf" allowedMimeTypes={["application/pdf"]} onChange={(file) => setDocument("esf", file)} /><FileUploader type="product_doc" label="Документы на товар" optional value={draft.documents.product_doc} accept=".pdf" allowedMimeTypes={["application/pdf"]} onChange={(file) => setDocument("product_doc", file)} /></div><DocumentAnalysisPanel contract={draft.documents.contract} supportingDocuments={supporting} onUseDemo={(file) => setDocument("contract", file)} onApply={onAnalysis} /></div>{error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}<p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Для реального PDF анализ запускается локально через авторизованный Codex CLI. «Готовое демо» работает детерминированно и не требует CLI.</p></div>;
}

function ApplicationSuccess({ id }: { id: string }) { return <div className="mx-auto flex min-h-[70vh] max-w-xl animate-scale-in flex-col items-center justify-center text-center"><span className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-moss-50 text-moss-700 ring-1 ring-moss-200"><CheckCircle2 className="h-10 w-10" /></span><p className="eyebrow mb-2">Заявка №{id}</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Анкета проверена</h1><p className="mt-4 max-w-md text-base leading-7 text-muted">FlowFactor выполнил внутреннюю демонстрационную проверку и подобрал предварительные варианты по прозрачным синтетическим правилам.</p><div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row"><Link href={`/applications/${id}`} className={primaryLinkClass}>Сравнить предложения <ArrowRight className="h-4 w-4" /></Link><Link href="/" className={secondaryLinkClass}>На главную</Link></div></div>; }
