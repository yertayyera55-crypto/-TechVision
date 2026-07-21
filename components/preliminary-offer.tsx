"use client";

import { BadgeCheck, CheckCircle2, ChevronDown, CircleAlert, Scale, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PrimaryButton, TextLink } from "@/components/ui/buttons";
import { formatCurrency } from "@/lib/format";
import { Application, PartnerOffer } from "@/lib/types";

export function PreliminaryOffer({ application, onAccept, loading = false }: { application: Application; onAccept: (offer?: PartnerOffer) => void; loading?: boolean }) {
  const [showRules, setShowRules] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const partnerOffers = application.partnerOffers;

  if (partnerOffers?.length) {
    const recommendedOffer = partnerOffers.find((offer) => offer.recommendation === "recommended") ?? partnerOffers.find((offer) => offer.eligible) ?? partnerOffers[0];
    const chooseOffer = (offer: PartnerOffer) => { setSelectedId(offer.id); onAccept(offer); };
    return <section aria-labelledby="offers-title">
      <div className="mb-5 flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-50 text-moss-700 ring-1 ring-moss-200"><Scale className="h-5 w-5" /></span><div><p className="eyebrow mb-1">Сравнение по синтетическим критериям</p><h2 id="offers-title" className="text-2xl font-semibold text-ink">Демонстрационные предложения</h2><p className="mt-1 text-sm leading-6 text-slate-600">Вы можете выбрать любого партнёра. Рекомендация FlowFactor помогает сравнить варианты, но не ограничивает выбор и не является одобрением.</p></div></div>

      <div className="mb-5 border-l-2 border-moss-600 bg-moss-50/60 px-4 py-4"><p className="flex items-center gap-2 text-sm font-semibold text-moss-900"><BadgeCheck className="h-5 w-5" /> Самый подходящий для этой заявки — {recommendedOffer.partnerName}</p><p className="mt-1 pl-7 text-xs leading-5 text-slate-600">{recommendedOffer.reasons[0]}. У партнёра всё равно будет собственная проверка документов и условий.</p></div>

      <div className="grid gap-4 lg:grid-cols-3">{partnerOffers.map((offer) => {
        const isRecommended = offer.id === recommendedOffer.id;
        const caveats = offer.caveats ?? [];
        return <article key={offer.id} className={`flex flex-col border p-5 ${isRecommended ? "border-moss-300 bg-moss-50/35 ring-1 ring-moss-100" : "border-line bg-paper"}`}>
          <div className="flex-1"><div className="flex items-start justify-between gap-3"><div><StatusLabel recommended={isRecommended} hasCaveats={caveats.length > 0} /><h3 className="mt-3 text-lg font-semibold text-ink">{offer.partnerName}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{offer.description}</p></div>{isRecommended ? <BadgeCheck className="h-6 w-6 shrink-0 text-moss-700" /> : caveats.length ? <CircleAlert className="h-5 w-5 shrink-0 text-amber-700" /> : <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-500" />}</div>
            <dl className="mt-5 divide-y divide-line"><OfferRow label="Требование" value={formatCurrency(application.receivable?.confirmedReceivable ?? application.amount)} /><OfferRow label="Получить сейчас" value={formatCurrency(offer.financingAmount)} strong /><OfferRow label="Финансирование" value={`${offer.financingPercentage}%`} /><OfferRow label="Демо-стоимость" value={formatCurrency(offer.cost)} /><OfferRow label="Чистая сумма" value={formatCurrency(offer.netAmount)} /><OfferRow label="Тип" value={offer.factoringType === "non_recourse" ? "Без регресса" : "С регрессом"} /></dl>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">Особенности партнёра</p><ul className="mt-2 space-y-2">{offer.reasons.map((reason) => <li key={reason} className="flex gap-2 text-xs leading-5 text-slate-600"><span aria-hidden="true">•</span>{normalizeReason(reason)}</li>)}</ul>
            {caveats.length > 0 && <div className="mt-4 border-l-2 border-amber-400 pl-3"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">Перед отправкой учтите</p><ul className="mt-1 space-y-1">{caveats.map((caveat) => <li key={caveat} className="text-xs leading-5 text-amber-900">{caveat}</li>)}</ul></div>}
          </div>
          <PrimaryButton type="button" className="mt-5 w-full" disabled={loading} loading={loading && selectedId === offer.id} onClick={() => chooseOffer(offer)}>Выбрать предложение</PrimaryButton>
        </article>;
      })}</div>

      <div className="mt-5 border border-line bg-paper p-4"><TextLink type="button" onClick={() => setShowRules((value) => !value)}>Как работает рекомендация? <ChevronDown className={`h-4 w-4 transition ${showRules ? "rotate-180" : ""}`} /></TextLink>{showRules && <p className="mt-3 text-xs leading-5 text-slate-600">ИИ извлекает сведения и предварительно определяет категорию. Затем прозрачные правила сравнивают сумму, срок, документы, тип факторинга и особенности товара. Лучший результат получает метку «Рекомендуем», но все варианты остаются доступными пользователю.</p>}</div>
    </section>;
  }

  if (!application.factoringOffer) return null;
  const offer = application.factoringOffer;
  return <section className="border-y border-moss-200 bg-moss-50/50 px-4 py-6 sm:rounded-lg sm:border sm:p-6"><p className="eyebrow mb-1">Старый демосценарий</p><h2 className="text-xl font-semibold text-ink">Предварительное демонстрационное предложение</h2><dl className="mt-5 divide-y divide-moss-200"><OfferRow label="Сумма требования" value={formatCurrency(application.amount)} /><OfferRow label="Финансирование" value={`${offer.financingPercentage}%`} /><OfferRow label="Поставщик получит сейчас" value={formatCurrency(offer.netAmount)} strong /></dl><p className="mt-4 flex gap-2 text-xs leading-5 text-slate-600"><ShieldCheck className="h-4 w-4 shrink-0" />Это не банковское одобрение.</p><PrimaryButton type="button" className="mt-5" loading={loading} onClick={() => onAccept()}><CheckCircle2 className="h-4 w-4" /> Принять демопредложение</PrimaryButton></section>;
}

function StatusLabel({ recommended, hasCaveats }: { recommended: boolean; hasCaveats: boolean }) {
  const text = recommended ? "Рекомендуем" : hasCaveats ? "Доступен · есть особенности" : "Доступный вариант";
  return <span className={`inline-flex rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${recommended ? "bg-moss-700 text-white" : hasCaveats ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200" : "bg-slate-100 text-slate-600"}`}>{text}</span>;
}

function normalizeReason(reason: string) { return reason.replace(/^Не подходит:\s*/i, "Особенность: "); }
function OfferRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className="flex items-baseline justify-between gap-3 py-2.5"><dt className="text-xs text-slate-500">{label}</dt><dd className={`${strong ? "text-base text-moss-800" : "text-sm text-ink"} text-right font-semibold`}>{value}</dd></div>; }
