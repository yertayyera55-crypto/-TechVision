"use client";

import { ArrowRight, Calculator, ChevronDown, CircleHelp, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PrimaryButton, SecondaryButton, TextLink } from "@/components/ui/buttons";
import { Application } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function PreliminaryOffer({ application, onTransfer }: { application: Application; onTransfer: () => void }) {
  const [showFormula, setShowFormula] = useState(false);
  const available = Math.round(application.amount * 0.970411);
  const cost = application.amount - available;
  return (
    <section aria-labelledby="offer-title" className="border-y border-moss-200 bg-moss-50/50 px-4 py-6 sm:rounded-lg sm:border sm:p-6">
      <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-moss-700 ring-1 ring-moss-200"><Calculator className="h-5 w-5" /></span><div><p className="eyebrow mb-1">Предварительный расчёт</p><h2 id="offer-title" className="text-xl font-semibold text-ink">Можно получить на {Math.max(1, application.termDays - 2)} дней раньше</h2></div></div>
      <dl className="mt-6 divide-y divide-moss-200/70 border-y border-moss-200/70">
        <OfferRow label="Сумма поставки" value={formatCurrency(application.amount)} />
        <OfferRow label="Предварительно доступно" value={formatCurrency(available)} strong />
        <OfferRow label="Стоимость финансирования" value={formatCurrency(cost)} />
        <OfferRow label="Комиссия Mighty Miners" value="0 ₸" />
      </dl>
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss-700" />Это предварительный расчёт. Окончательные условия определяет финансовый партнёр.</p>
      {showFormula && <div className="mt-4 animate-scale-in border-l-2 border-moss-500 pl-4 text-xs leading-5 text-slate-600">В demo используется фиксированная ставка: доступная сумма = сумма поставки × 97,0411%. В production ставку и условия вернёт финансовый партнёр.</div>}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <PrimaryButton type="button" onClick={onTransfer}>Передать заявку партнёру <ArrowRight className="h-4 w-4" /></PrimaryButton>
        <SecondaryButton type="button" onClick={() => window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Запрос на консультацию отправлен" }))}><CircleHelp className="h-4 w-4" /> Запросить консультацию</SecondaryButton>
        <TextLink type="button" onClick={() => setShowFormula((value) => !value)}>Как рассчитана сумма? <ChevronDown className={`h-4 w-4 transition ${showFormula ? "rotate-180" : ""}`} /></TextLink>
      </div>
    </section>
  );
}

function OfferRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-baseline justify-between gap-4 py-3"><dt className="text-sm text-slate-600">{label}</dt><dd className={`${strong ? "text-lg text-moss-800" : "text-sm text-ink"} whitespace-nowrap font-semibold`}>{value}</dd></div>;
}
