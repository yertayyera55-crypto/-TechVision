"use client";

import { Download, FileCheck2, Info, Sparkles } from "lucide-react";
import { ApplicationDraft, CompanyProfile, ContractAnalysisResult } from "@/lib/types";
import { calculateDays, formatCurrency } from "@/lib/format";
import { SecondaryButton } from "@/components/ui/buttons";

type Source = "profile" | "contract" | "calculated" | "missing";
type DraftChange = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => void;

interface FlowFactorQuestionnaireProps {
  draft: ApplicationDraft;
  analysis: ContractAnalysisResult | null;
  errors: Record<string, string>;
  onDraftChange: DraftChange;
}

const sourceCopy: Record<Source, string> = {
  profile: "Из профиля",
  contract: "Из договора",
  calculated: "Рассчитано системой",
  missing: "Нужно заполнить",
};

const sourceStyle: Record<Source, string> = {
  profile: "bg-sky-50 text-sky-800 ring-sky-200",
  contract: "bg-moss-50 text-moss-800 ring-moss-200",
  calculated: "bg-violet-50 text-violet-800 ring-violet-200",
  missing: "bg-amber-50 text-amber-900 ring-amber-200",
};

export function FlowFactorQuestionnaire({ draft, analysis, errors, onDraftChange }: FlowFactorQuestionnaireProps) {
  const profile = draft.companyProfile;
  const dateTermDays = calculateDays(draft.deliveryDate, draft.paymentDate);
  const explicitTermDays = Number(draft.paymentTermDays);
  const termDays = explicitTermDays > 0 ? explicitTermDays : dateTermDays;
  const amount = Number(draft.amount);
  const financingAmount = amount > 0 ? Math.round(amount * 0.95) : null;
  const commission = amount > 0 ? Math.round(amount * 0.03) : null;
  const netAmount = financingAmount !== null && commission !== null ? Math.max(0, financingAmount - commission) : null;
  const setProfile = <K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) => onDraftChange("companyProfile", { ...profile, [key]: value });
  const contractSource = (value: string | number | null | undefined): Source => value === null || value === undefined || value === "" ? "missing" : "contract";
  const paymentTermSource: Source = analysis?.paymentTermDays !== null && analysis?.paymentTermDays !== undefined ? "contract" : dateTermDays > 0 ? "calculated" : "missing";

  return <div>
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-50 text-moss-700 ring-1 ring-moss-200"><FileCheck2 className="h-5 w-5" /></span><div><p className="eyebrow mb-1">Предварительная заявка</p><h2 className="text-xl font-semibold text-ink">Анкета FlowFactor</h2><p className="mt-1 text-sm leading-6 text-muted">Проверьте подготовленные данные и добавьте только поля с пометкой «Нужно заполнить».</p></div></div>
      <SecondaryButton type="button" onClick={() => downloadQuestionnaire(draft, termDays, financingAmount, commission, netAmount)}><Download className="h-4 w-4" /> Скачать анкету</SecondaryButton>
    </div>

    <div className="mt-6 flex items-start gap-3 border border-moss-200 bg-moss-50 px-4 py-3 text-sm leading-6 text-moss-900"><Sparkles className="mt-0.5 h-5 w-5 shrink-0" /><p>Анкета заполнена автоматически с помощью ИИ на основе профиля компании и загруженного договора. Проверьте данные перед отправкой.</p></div>

    <QuestionnaireSection title="О поставщике" text="Данные берутся из профиля компании и при необходимости редактируются здесь.">
      <div className="grid gap-5 sm:grid-cols-2">
        <QuestionnaireField label="Название компании" id="questionnaire-company" source={profileSource(profile.company)} error={errors.company}><input id="questionnaire-company" className="control" value={profile.company} onChange={(event) => setProfile("company", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="БИН" id="questionnaire-bin" source={profileSource(profile.bin)} error={errors.bin}><input id="questionnaire-bin" className="control" value={profile.bin} inputMode="numeric" onChange={(event) => setProfile("bin", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Отрасль" id="questionnaire-industry" source={profileSource(profile.industry)} error={errors.industry}><input id="questionnaire-industry" className="control" value={profile.industry} onChange={(event) => setProfile("industry", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Годовой оборот" id="questionnaire-turnover" source={profileSource(profile.annualTurnover)} error={errors.annualTurnover}><input id="questionnaire-turnover" className="control" value={profile.annualTurnover} onChange={(event) => setProfile("annualTurnover", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Срок работы компании" id="questionnaire-years" source={profileSource(profile.yearsInBusiness)} error={errors.yearsInBusiness}><input id="questionnaire-years" className="control" value={profile.yearsInBusiness} onChange={(event) => setProfile("yearsInBusiness", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Контактное лицо" id="questionnaire-contact" source={profileSource(profile.contact)} error={errors.contact}><input id="questionnaire-contact" className="control" value={profile.contact} onChange={(event) => setProfile("contact", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Телефон" id="questionnaire-phone" source={profileSource(profile.phone)} error={errors.phone}><input id="questionnaire-phone" className="control" type="tel" value={profile.phone} onChange={(event) => setProfile("phone", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Email" id="questionnaire-email" source={profileSource(profile.email)} error={errors.email}><input id="questionnaire-email" className="control" type="email" value={profile.email} onChange={(event) => setProfile("email", event.target.value)} /></QuestionnaireField>
      </div>
    </QuestionnaireSection>

    <QuestionnaireSection title="По договору" text="ИИ переносит только найденные сведения. Если поле осталось пустым, его нужно заполнить вручную.">
      <div className="grid gap-5 sm:grid-cols-2">
        <QuestionnaireField label="Покупатель" id="network" source={contractSource(analysis?.network ?? analysis?.buyerName)} error={errors.network}><input id="network" className="control" value={draft.network} placeholder="Не найдено в договоре" onChange={(event) => onDraftChange("network", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Номер договора" id="contractNumber" source={contractSource(analysis?.contractNumber)} error={errors.contractNumber}><input id="contractNumber" className="control" value={draft.contractNumber} placeholder="Не найдено в договоре" onChange={(event) => onDraftChange("contractNumber", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Предмет поставки" id="supplySubject" source={contractSource(analysis?.supplySubject)} error={errors.supplySubject}><input id="supplySubject" className="control" value={draft.supplySubject} placeholder="Например, чай в упаковке" onChange={(event) => onDraftChange("supplySubject", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Номер накладной" id="invoiceNumber" source={contractSource(analysis?.invoiceNumber)} error={errors.invoiceNumber}><input id="invoiceNumber" className="control" value={draft.invoiceNumber} placeholder="Не найдено в договоре" onChange={(event) => onDraftChange("invoiceNumber", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Сумма поставки" id="amount" source={contractSource(analysis?.amount)} error={errors.amount}><div className="relative"><input id="amount" className="control pr-12" inputMode="numeric" type="number" min="1" value={draft.amount} placeholder="Не найдена" onChange={(event) => onDraftChange("amount", event.target.value)} /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-slate-500">₸</span></div></QuestionnaireField>
        <QuestionnaireField label="Дата поставки" id="deliveryDate" source={contractSource(analysis?.deliveryDate)} error={errors.deliveryDate}><input id="deliveryDate" className="control" type="date" value={draft.deliveryDate} onChange={(event) => onDraftChange("deliveryDate", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Дата оплаты по договору" id="paymentDate" source={contractSource(analysis?.paymentDueDate)} error={errors.paymentDate}><input id="paymentDate" className="control" type="date" value={draft.paymentDate} onChange={(event) => onDraftChange("paymentDate", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Срок отсрочки, дней" id="paymentTermDays" source={paymentTermSource} error={errors.paymentTermDays}><input id="paymentTermDays" className="control" inputMode="numeric" type="number" min="1" value={draft.paymentTermDays || (dateTermDays > 0 ? String(dateTermDays) : "")} placeholder="Не найден" onChange={(event) => onDraftChange("paymentTermDays", event.target.value)} /></QuestionnaireField>
        <QuestionnaireField label="Условия оплаты" id="paymentTerms" source={contractSource(analysis?.paymentTerms)} error={errors.paymentTerms} className="sm:col-span-2"><input id="paymentTerms" className="control" value={draft.paymentTerms} placeholder="Не найдены в договоре" onChange={(event) => onDraftChange("paymentTerms", event.target.value)} /></QuestionnaireField>
      </div>
    </QuestionnaireSection>

    <QuestionnaireSection title="Расчёт предварительного предложения" text="Эти показатели не вводятся вручную и появляются только после указания суммы поставки.">
      <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
        <CalculatedField label="Доступно к финансированию" value={financingAmount === null ? "Укажите сумму поставки" : formatCurrency(financingAmount)} />
        <CalculatedField label="Комиссия FlowFactor" value={commission === null ? "Укажите сумму поставки" : formatCurrency(commission)} />
        <CalculatedField label="Поставщик получит сейчас" value={netAmount === null ? "Укажите сумму поставки" : formatCurrency(netAmount)} />
      </div>
      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Расчёт в демо: финансирование 95% от суммы поставки, комиссия 3%. Это не финансовое одобрение.</p>
    </QuestionnaireSection>
  </div>;
}

function QuestionnaireSection({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return <section className="mt-8"><div className="mb-5"><h3 className="text-lg font-semibold text-ink">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div>{children}</section>;
}

function QuestionnaireField({ label, id, source, error, className = "", children }: { label: string; id: string; source: Source; error?: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label><SourceBadge source={source} /></div>{children}{error && <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}</div>;
}

function CalculatedField({ label, value }: { label: string; value: string }) {
  return <div className="bg-paper px-4 py-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-500">{label}</p><SourceBadge source="calculated" /></div><p className="mt-2 text-lg font-semibold tracking-tight text-ink">{value}</p></div>;
}

function SourceBadge({ source }: { source: Source }) {
  return <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${sourceStyle[source]}`}>{sourceCopy[source]}</span>;
}

function profileSource(value: string): Source { return value.trim() ? "profile" : "missing"; }

function downloadQuestionnaire(draft: ApplicationDraft, termDays: number, financingAmount: number | null, commission: number | null, netAmount: number | null) {
  const fields: Array<[string, string, string]> = [
    ["Название компании", draft.companyProfile.company, sourceCopy[profileSource(draft.companyProfile.company)]],
    ["БИН", draft.companyProfile.bin, sourceCopy[profileSource(draft.companyProfile.bin)]],
    ["Отрасль", draft.companyProfile.industry, sourceCopy[profileSource(draft.companyProfile.industry)]],
    ["Годовой оборот", draft.companyProfile.annualTurnover, sourceCopy[profileSource(draft.companyProfile.annualTurnover)]],
    ["Срок работы", draft.companyProfile.yearsInBusiness, sourceCopy[profileSource(draft.companyProfile.yearsInBusiness)]],
    ["Контакт", `${draft.companyProfile.contact} · ${draft.companyProfile.phone} · ${draft.companyProfile.email}`, sourceCopy.profile],
    ["Покупатель", draft.network, sourceCopy.contract],
    ["Номер договора", draft.contractNumber, sourceCopy.contract],
    ["Предмет поставки", draft.supplySubject, sourceCopy.contract],
    ["Номер накладной", draft.invoiceNumber, sourceCopy.contract],
    ["Сумма поставки", draft.amount ? `${draft.amount} ₸` : "", sourceCopy.contract],
    ["Срок отсрочки", termDays > 0 ? `${termDays} дней` : "", sourceCopy.calculated],
    ["Условия оплаты", draft.paymentTerms, sourceCopy.contract],
    ["Доступно к финансированию", financingAmount === null ? "" : formatCurrency(financingAmount), sourceCopy.calculated],
    ["Комиссия FlowFactor", commission === null ? "" : formatCurrency(commission), sourceCopy.calculated],
    ["Поставщик получит сейчас", netAmount === null ? "" : formatCurrency(netAmount), sourceCopy.calculated],
  ];
  const rows = fields.map(([label, value, source]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "Не заполнено")}</td><td>${escapeHtml(source)}</td></tr>`).join("");
  const documentHtml = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Анкета FlowFactor</title><style>body{font-family:Arial,sans-serif;color:#172033;padding:36px}h1{font-size:26px;margin-bottom:6px}p{color:#526075}table{border-collapse:collapse;width:100%;margin-top:24px}th,td{border:1px solid #d8ddd6;padding:10px;text-align:left;font-size:13px}th{width:32%;background:#f5f7f3}td:last-child{width:18%;color:#31542d;font-weight:700}</style></head><body><h1>Анкета FlowFactor</h1><p>Предварительная демонстрационная заявка. Данные заполнены из профиля компании, договора и расчётов приложения.</p><table><thead><tr><th>Поле</th><th>Значение</th><th>Источник</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const blob = new Blob([documentHtml], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Анкета_FlowFactor.doc";
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", "\"": "&quot;" })[character] ?? character); }
