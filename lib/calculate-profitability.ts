import { demoRules } from "@/data/demo-rules";
import { FactoringOffer, ProfitabilityAnalysis, ProfitabilityResultType } from "@/lib/types";

export interface ProfitabilityInput {
  revenue: number;
  costAmount: number;
  productionExpenses: number;
  offer: Omit<FactoringOffer, "netAmount">;
}

export function calculateFinancingCost(financingAmount: number, termDays: number, annualRatePercent = demoRules.factoring.annualRatePercent) {
  return Math.round(financingAmount * (annualRatePercent / 100) * Math.max(termDays, 0) / 365);
}

export function calculateProfitability(input: ProfitabilityInput): { analysis: ProfitabilityAnalysis; offer: FactoringOffer } {
  const { revenue, costAmount, productionExpenses } = input;
  const totalFactoringCost = input.offer.financingCost + input.offer.documentFees + input.offer.otherFees + input.offer.taxExpenses + input.offer.platformFee;
  const profitBeforeFactoring = revenue - costAmount - productionExpenses;
  const profitAfterFactoring = profitBeforeFactoring - totalFactoringCost;
  const marginBeforeFactoring = revenue > 0 ? (profitBeforeFactoring / revenue) * 100 : 0;
  const marginAfterFactoring = revenue > 0 ? (profitAfterFactoring / revenue) * 100 : 0;
  const result = assessProfitability(profitAfterFactoring, marginAfterFactoring);
  const warnings: string[] = [];
  if (result === "low_margin") warnings.push("После расходов остаётся небольшой запас маржинальности.");
  if (result === "unprofitable") warnings.push("Расходы на факторинг могут сделать сделку убыточной.");

  return {
    offer: { ...input.offer, netAmount: Math.max(0, input.offer.financingAmount - totalFactoringCost) },
    analysis: {
      revenue,
      costAmount,
      productionExpenses,
      profitBeforeFactoring,
      marginBeforeFactoring,
      totalFactoringCost,
      profitAfterFactoring,
      marginAfterFactoring,
      profitReduction: totalFactoringCost,
      result,
      warnings,
    },
  };
}

function assessProfitability(profit: number, margin: number): ProfitabilityResultType {
  if (profit <= 0) return "unprofitable";
  if (margin < demoRules.profitability.healthyMarginPercent) return "low_margin";
  return "profitable";
}
