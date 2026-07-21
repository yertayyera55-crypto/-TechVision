"use client";

import { CheckCircle2, Calculator, ChevronDown, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PrimaryButton, TextLink } from "@/components/ui/buttons";
import { formatCurrency } from "@/lib/format";
import { Application } from "@/lib/types";

export function PreliminaryOffer({ application, onAccept, loading = false }: { application: Application; onAccept: () => void; loading?: boolean }) {
  const [showFormula, setShowFormula] = useState(false);
  if (!application.factoringOffer) return null;

  const offer = application.factoringOffer;
  const commission = offer.financingCost + offer.documentFees + offer.otherFees + offer.taxExpenses + offer.platformFee;
  const reserve = Math.max(0, application.amount - offer.financingAmount);
  const typeDescription = offer.factoringType === "non_recourse"
    ? "Без регресса: в рамках демосценария риск неплатежа покупателя несёт FlowFactor."
    : "С регрессом: при длительной просрочке покупателя FlowFactor может потребовать возврат финансирования в соответствии с условиями договора.";

  return <section aria-labelledby="offer-title" className="border-y border-moss-200 bg-moss-50/50 px-4 py-6 sm:rounded-lg sm:border sm:p-6">
    <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-moss-700 ring-1 ring-moss-200"><Calculator className="h-5 w-5" /></span><div><p className="eyebrow mb-1">FlowFactor · учебный MVP</p><h2 id="offer-title" className="text-xl font-semibold text-ink">Предварительное демонстрационное предложение</h2><p className="mt-1 text-sm text-slate-600">Предварительно соответствует условиям по данным заявки. Это не банковское одобрение.</p></div></div>
    <dl className="mt-6 divide-y divide-moss-200/70 border-y border-moss-200/70">
      <OfferRow label="Сумма денежного требования" value={formatCurrency(application.amount)} />
      <OfferRow label="Процент финансирования" value={`${offer.financingPercentage}%`} />
      <OfferRow label="Сумма первоначального финансирования" value={formatCurrency(offer.financingAmount)} />
      <OfferRow label="Комиссия FlowFactor" value={formatCurrency(commission)} />
      <OfferRow label="Поставщик получит сейчас" value={formatCurrency(offer.netAmount)} strong />
      <OfferRow label="Резерв после оплаты покупателя" value={formatCurrency(reserve)} />
      <OfferRow label="Срок оплаты покупателем" value={`${application.termDays} дней · ${new Intl.DateTimeFormat("ru-RU").format(new Date(`${application.paymentDueDate}T00:00:00`))}`} />
      <OfferRow label="Тип факторинга" value={offer.factoringType === "non_recourse" ? "Без регресса" : "С регрессом"} />
    </dl>
    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss-700" />{typeDescription}</p>
    {showFormula && <div className="mt-4 animate-scale-in border-l-2 border-moss-500 pl-4 text-xs leading-5 text-slate-600">В демосценарии: первоначальное финансирование = требование × {offer.financingPercentage}%, комиссия FlowFactor = требование × 3%, сумма сейчас = первоначальное финансирование − комиссия. Финальные условия реального продукта определялись бы после проверки документов.</div>}
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><PrimaryButton type="button" loading={loading} disabled={loading} onClick={onAccept}><CheckCircle2 className="h-4 w-4" /> Принять демопредложение</PrimaryButton><TextLink type="button" onClick={() => setShowFormula((value) => !value)}>Как рассчитана сумма? <ChevronDown className={`h-4 w-4 transition ${showFormula ? "rotate-180" : ""}`} /></TextLink></div>
  </section>;
}

function OfferRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-baseline justify-between gap-4 py-3"><dt className="text-sm text-slate-600">{label}</dt><dd className={`${strong ? "text-lg text-moss-800" : "text-sm text-ink"} whitespace-nowrap text-right font-semibold`}>{value}</dd></div>;
}
