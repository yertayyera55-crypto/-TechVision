"use client";

import { Calculator } from "lucide-react";
import { FormEvent, useState } from "react";
import { FormField } from "@/components/form/form-field";
import { ProfitabilityResult } from "@/components/profitability-result";
import { PrimaryButton } from "@/components/ui/buttons";
import { calculateProfitability } from "@/lib/calculate-profitability";
import { Application, FactoringOffer, ProfitabilityAnalysis } from "@/lib/types";

export function ProfitabilityCalculator({ application, onSave }: { application: Application; onSave: (update: Partial<Application>) => void }) {
  const [costAmount, setCostAmount] = useState(String(application.costAmount || 1_720_000));
  const [productionExpenses, setProductionExpenses] = useState(String(application.productionExpenses || 20_000));
  const [financingPercentage, setFinancingPercentage] = useState(String(application.factoringOffer?.financingPercentage ?? 90));
  const [financingCost, setFinancingCost] = useState(String(application.factoringOffer?.financingCost ?? 59_178));
  const [documentFees, setDocumentFees] = useState(String(application.factoringOffer?.documentFees ?? 9_000));
  const [otherFees, setOtherFees] = useState(String(application.factoringOffer?.otherFees ?? 12_000));
  const [taxExpenses, setTaxExpenses] = useState(String(application.factoringOffer?.taxExpenses ?? 0));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: ProfitabilityAnalysis; offer: FactoringOffer } | null>(application.profitability && application.factoringOffer ? { analysis: application.profitability, offer: application.factoringOffer } : null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const values = [costAmount, productionExpenses, financingPercentage, financingCost, documentFees, otherFees, taxExpenses].map(Number);
    if (values.some((value) => !Number.isFinite(value) || value < 0) || Number(financingPercentage) > 100) {
      setError("Проверьте значения: суммы не могут быть отрицательными, доля — больше 100%.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 550));
    const calculated = calculateProfitability({
      revenue: application.amount,
      costAmount: Number(costAmount),
      productionExpenses: Number(productionExpenses),
      offer: {
        deliveryId: application.id,
        financingPercentage: Number(financingPercentage),
        financingAmount: Math.round(application.amount * Number(financingPercentage) / 100),
        financingCost: Number(financingCost),
        documentFees: Number(documentFees),
        otherFees: Number(otherFees),
        taxExpenses: Number(taxExpenses),
        platformFee: 0,
        savedDays: Math.max(1, application.delayDays - 2),
        factoringType: application.selectedFactoringType ?? "recourse",
        gracePeriodDays: 20,
      },
    });
    setResult(calculated);
    onSave({ costAmount: Number(costAmount), productionExpenses: Number(productionExpenses), factoringOffer: calculated.offer, profitability: calculated.analysis, financialDataCompleted: true, status: "ready_for_signing" });
    setLoading(false);
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Расчёт прибыльности сохранён" }));
  };

  return <section aria-labelledby="profitability-heading" className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6"><div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-moss-50 text-moss-700"><Calculator className="h-5 w-5" /></span><div><p className="eyebrow mb-1">Экономика поставки</p><h2 id="profitability-heading" className="text-xl font-semibold">Калькулятор прибыльности</h2><p className="mt-1 text-sm text-slate-500">Сумма поставки: {new Intl.NumberFormat("ru-RU").format(application.amount)} ₸</p></div></div><form onSubmit={submit} className="mt-6"><div className="grid gap-5 sm:grid-cols-2"><MoneyField id="costAmount" label="Себестоимость поставки" value={costAmount} onChange={setCostAmount} /><MoneyField id="productionExpenses" label="Дополнительные расходы производителя" value={productionExpenses} onChange={setProductionExpenses} /><FormField label="Предполагаемая доля финансирования" htmlFor="financingPercentage"><div className="relative"><input id="financingPercentage" type="number" min="0" max="100" className="control pr-10" value={financingPercentage} onChange={(event) => setFinancingPercentage(event.target.value)} /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">%</span></div></FormField><MoneyField id="financingCost" label="Стоимость финансирования" value={financingCost} onChange={setFinancingCost} /><MoneyField id="documentFees" label="Комиссии за документы" value={documentFees} onChange={setDocumentFees} /><MoneyField id="otherFees" label="Другие комиссии" value={otherFees} onChange={setOtherFees} /><MoneyField id="taxExpenses" label="Дополнительные налоговые расходы" value={taxExpenses} onChange={setTaxExpenses} optional /></div>{error && <p role="alert" className="mt-4 text-sm font-medium text-red-700">{error}</p>}<div className="mt-6 flex justify-end"><PrimaryButton type="submit" loading={loading}>Рассчитать прибыльность</PrimaryButton></div></form>{result && <ProfitabilityResult analysis={result.analysis} offer={result.offer} />}</section>;
}

function MoneyField({ id, label, value, onChange, optional = false }: { id: string; label: string; value: string; onChange: (value: string) => void; optional?: boolean }) { return <FormField label={`${label}${optional ? " · необязательно" : ""}`} htmlFor={id}><div className="relative"><input id={id} type="number" min="0" className="control pr-10" value={value} onChange={(event) => onChange(event.target.value)} /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">₸</span></div></FormField>; }
