"use client";

import { Calculator, Check } from "lucide-react";
import { FormEvent, useState } from "react";
import { FormField } from "@/components/form/form-field";
import { ProfitabilityResult } from "@/components/profitability-result";
import { PrimaryButton } from "@/components/ui/buttons";
import { calculateFinancingCost, calculateProfitability } from "@/lib/calculate-profitability";
import { demoRules } from "@/data/demo-rules";
import { Application, FactoringOffer, ProfitabilityAnalysis } from "@/lib/types";

export function ProfitabilityCalculator({ application, onSave }: { application: Application; onSave: (update: Partial<Application>) => void }) {
  const [costAmount, setCostAmount] = useState(application.costAmount ? String(application.costAmount) : "");
  const [productionExpenses, setProductionExpenses] = useState(String(application.productionExpenses || ""));
  const [financingPercentage, setFinancingPercentage] = useState(String(application.factoringOffer?.financingPercentage ?? demoRules.factoring.financingPercentage));
  const [documentFees, setDocumentFees] = useState(String(application.factoringOffer?.documentFees ?? 9_000));
  const [otherFees, setOtherFees] = useState(String(application.factoringOffer?.otherFees ?? 12_000));
  const [taxExpenses, setTaxExpenses] = useState(String(application.factoringOffer?.taxExpenses ?? 0));
  const [includeAdditionalCosts, setIncludeAdditionalCosts] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: ProfitabilityAnalysis; offer: FactoringOffer } | null>(application.profitability && application.factoringOffer ? { analysis: application.profitability, offer: application.factoringOffer } : null);

  const financingAmount = Math.round(application.amount * Number(financingPercentage || demoRules.factoring.financingPercentage) / 100);
  const financingCost = calculateFinancingCost(financingAmount, application.termDays || application.delayDays);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const cost = Number(costAmount);
    const percentage = Number(financingPercentage);
    const optionalValues = [productionExpenses, percentage, documentFees, otherFees, taxExpenses].map(Number);
    if (!Number.isFinite(cost) || cost < 0 || !costAmount.trim()) {
      setError("Укажите себестоимость поставки, чтобы рассчитать маржу.");
      return;
    }
    if (optionalValues.some((value) => !Number.isFinite(value) || value < 0) || percentage > 100 || percentage === 0) {
      setError("Проверьте дополнительные значения: суммы не могут быть отрицательными, доля — от 1 до 100%.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const additionalProduction = includeAdditionalCosts ? Number(productionExpenses || 0) : 0;
    const additionalDocumentFees = includeAdditionalCosts ? Number(documentFees || 0) : 0;
    const additionalOtherFees = includeAdditionalCosts ? Number(otherFees || 0) : 0;
    const additionalTaxExpenses = includeAdditionalCosts ? Number(taxExpenses || 0) : 0;
    const calculated = calculateProfitability({
      revenue: application.amount,
      costAmount: cost,
      productionExpenses: additionalProduction,
      offer: {
        deliveryId: application.id,
        financingPercentage: percentage,
        financingAmount: Math.round(application.amount * percentage / 100),
        financingCost: calculateFinancingCost(Math.round(application.amount * percentage / 100), application.termDays || application.delayDays),
        documentFees: additionalDocumentFees,
        otherFees: additionalOtherFees,
        taxExpenses: additionalTaxExpenses,
        platformFee: 0,
        savedDays: Math.max(1, application.delayDays - 2),
        factoringType: application.selectedFactoringType ?? "recourse",
        gracePeriodDays: application.factoringOffer?.gracePeriodDays ?? demoRules.factoring.defaultGracePeriodDays,
      },
    });
    setResult(calculated);
    onSave({ costAmount: cost, productionExpenses: additionalProduction, factoringOffer: calculated.offer, profitability: calculated.analysis, financialDataCompleted: true, status: "ready_for_signing" });
    setLoading(false);
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Расчёт прибыльности сохранён" }));
  };

  return <section aria-labelledby="profitability-heading" className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6">
    <div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-moss-50 text-moss-700"><Calculator className="h-5 w-5" /></span><div><p className="eyebrow mb-1">Экономика поставки</p><h2 id="profitability-heading" className="text-xl font-semibold">Расчёт прибыльности</h2><p className="mt-1 text-sm text-slate-500">Стоимость финансирования и чистая сумма считаются автоматически по сумме и сроку договора.</p></div></div>
    <form onSubmit={submit} className="mt-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <MoneyField id="costAmount" label="Себестоимость поставки" value={costAmount} onChange={setCostAmount} required hint="Единственная обязательная цифра для расчёта маржи" />
        <AutoValue label="Предварительное финансирование" value={formatCurrency(financingAmount)} hint={`${financingPercentage}% от суммы поставки`} />
        <AutoValue label="Стоимость финансирования" value={formatCurrency(financingCost)} hint={`${application.termDays || application.delayDays} дней · расчётная ставка ${demoRules.factoring.annualRatePercent.toFixed(2)}% годовых`} />
      </div>
      <label className="mt-6 flex cursor-pointer items-start gap-3 border border-line bg-slate-50/60 px-4 py-3 text-sm text-ink"><input type="checkbox" checked={includeAdditionalCosts} onChange={(event) => setIncludeAdditionalCosts(event.target.checked)} className="mt-1 h-4 w-4 accent-moss-700" /><span><strong className="block">Учитывать дополнительные расходы и условия</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Откройте, если хотите добавить расходы производителя, комиссии или изменить долю финансирования.</span></span></label>
      {includeAdditionalCosts && <div className="mt-5 grid gap-5 border-l-2 border-moss-200 pl-4 sm:grid-cols-2"><MoneyField id="productionExpenses" label="Дополнительные расходы производителя" value={productionExpenses} onChange={setProductionExpenses} /><FormField label="Доля финансирования" htmlFor="financingPercentage"><div className="relative"><input id="financingPercentage" type="number" min="1" max="100" className="control pr-10" value={financingPercentage} onChange={(event) => setFinancingPercentage(event.target.value)} /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">%</span></div></FormField><MoneyField id="documentFees" label="Комиссия за документы" value={documentFees} onChange={setDocumentFees} /><MoneyField id="otherFees" label="Другие комиссии" value={otherFees} onChange={setOtherFees} /><MoneyField id="taxExpenses" label="Дополнительные налоговые расходы" value={taxExpenses} onChange={setTaxExpenses} /></div>}
      {error && <p role="alert" className="mt-4 text-sm font-medium text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end"><PrimaryButton type="submit" loading={loading}>Рассчитать прибыльность</PrimaryButton></div>
    </form>
    {result && <ProfitabilityResult analysis={result.analysis} offer={result.offer} />}
  </section>;
}

function MoneyField({ id, label, value, onChange, required = false, hint }: { id: string; label: string; value: string; onChange: (value: string) => void; required?: boolean; hint?: string }) {
  return <FormField label={label} htmlFor={id} required={required} hint={hint}><div className="relative"><input id={id} type="number" min="0" className="control pr-10" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">₸</span></div></FormField>;
}

function AutoValue({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div><span className="mb-2 block text-sm font-semibold text-ink">{label}</span><div className="flex min-h-11 items-center gap-2 border border-moss-200 bg-moss-50/60 px-3 text-sm font-semibold text-moss-900"><Check className="h-4 w-4 shrink-0 text-moss-700" />{value}</div><p className="mt-1.5 text-xs text-slate-500">{hint}</p></div>;
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₸`;
}
