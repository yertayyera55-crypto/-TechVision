"use client";

import { AlertTriangle, FileSearch2, Sparkles } from "lucide-react";
import { PRODUCT_CATEGORIES, getCategoryConfig } from "@/data/product-categories";
import { ApplicationDraft, ContractAnalysisResult, ProductCategory } from "@/lib/types";

interface AnalysisReviewProps {
  draft: ApplicationDraft;
  analysis: ContractAnalysisResult;
  onCategoryChange: (category: ProductCategory) => void;
}

export function AnalysisReview({ draft, analysis, onCategoryChange }: AnalysisReviewProps) {
  const category = getCategoryConfig(draft.productCategory);
  const paymentRows = [
    ["Когда начинается отсрочка", analysis.delayTrigger || "Не найдено — нужно проверить договор"],
    ["Срок отсрочки", draft.paymentTermDays ? `${draft.paymentTermDays} дней` : "Не найден"],
    ["Ожидаемая дата оплаты", draft.paymentDate || "Рассчитаем после даты подтверждения"],
    ["Подтверждение приёмки", analysis.acceptanceTerms || "Условие не найдено"],
    ["Возвраты и удержания", [analysis.returnsTerms, analysis.deductions].filter(Boolean).join("; ") || "Не найдены"],
    ["Уступка требования", analysis.assignmentTerms || "Требует отдельной проверки"],
  ];
  const evidence = new Map(analysis.evidence.map((item) => [item.field, item.excerpt]));
  const extracted: Array<[string, string | null, string]> = [
    ["Поставщик", analysis.supplierName, "supplierName"],
    ["Покупатель", analysis.buyerName || analysis.network, "buyerName"],
    ["Номер договора", analysis.contractNumber, "contractNumber"],
    ["Предмет поставки", analysis.supplySubject, "supplySubject"],
    ["Сумма", analysis.amount ? `${new Intl.NumberFormat("ru-RU").format(analysis.amount)} ₸` : null, "amount"],
    ["Условия оплаты", analysis.paymentTerms, "paymentTerms"],
  ];

  return <div>
    <div className="flex items-start gap-4"><span className="font-display text-3xl text-moss-500">02</span><div><p className="eyebrow mb-1">Результат AI-анализа</p><h2 className="text-xl font-semibold text-ink">Паспорт договора</h2><p className="mt-1 text-sm leading-6 text-muted">Проверьте найденные условия. ИИ не принимает решение о финансировании и не заполняет отсутствующие сведения догадками.</p></div></div>

    <section className="mt-7 border border-moss-200 bg-moss-50/60 p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-moss-700"><Sparkles className="h-4 w-4" /> Предварительно определил ИИ</p><h3 className="mt-2 text-2xl font-semibold text-ink">{category.label}</h3><p className="mt-1 text-sm text-slate-600">Уверенность: {draft.categoryConfidence}%</p></div><label className="min-w-64 text-sm font-semibold text-ink">Проверить категорию<select className="control mt-2" value={draft.productCategory} onChange={(event) => onCategoryChange(event.target.value as ProductCategory)}>{PRODUCT_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label></div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Категория меняет список документов и риск-профиль, но не означает автоматическую ставку или одобрение.</p>
    </section>

    <section className="mt-7"><h3 className="text-lg font-semibold text-ink">Что найдено в договоре</h3><div className="mt-4 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">{extracted.map(([label, value, field]) => <div key={label} className="bg-paper p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs text-slate-500">{label}</p><span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${value ? "bg-moss-50 text-moss-800" : "bg-amber-50 text-amber-900"}`}>{value ? "Из договора" : "Не найдено"}</span></div><p className="mt-2 text-sm font-semibold text-ink">{value || "Нужно заполнить или уточнить"}</p>{evidence.get(field) && <blockquote className="mt-2 border-l-2 border-moss-300 pl-2 text-[11px] leading-4 text-slate-500">«{evidence.get(field)}»</blockquote>}</div>)}</div></section>

    <section className="mt-7"><h3 className="text-lg font-semibold text-ink">Условия оплаты простыми словами</h3><dl className="mt-4 divide-y divide-line border-y border-line">{paymentRows.map(([label, value]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]"><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="text-sm font-semibold text-ink">{value}</dd></div>)}</dl></section>

    {analysis.missingData.length > 0 && <div className="mt-6 flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><strong>Не хватает данных:</strong><ul className="mt-1 list-disc pl-5">{analysis.missingData.map((item) => <li key={item}>{item}</li>)}</ul></div></div>}
    <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500"><FileSearch2 className="mt-0.5 h-4 w-4 shrink-0" /> Результат предварительный: окончательную возможность факторинга и условия определяет выбранный финансовый партнёр.</p>
  </div>;
}
