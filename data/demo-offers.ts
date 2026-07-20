import { FactoringOffer, FactoringType } from "@/lib/types";

export function createDemoOffer(deliveryId: string, amount: number, savedDays: number, factoringType: FactoringType = "recourse"): Omit<FactoringOffer, "netAmount"> {
  return {
    deliveryId,
    financingPercentage: 90,
    financingAmount: Math.round(amount * 0.9),
    financingCost: 59_178,
    documentFees: 9_000,
    otherFees: 12_000,
    taxExpenses: 0,
    platformFee: 0,
    savedDays,
    factoringType,
    gracePeriodDays: 20,
  };
}
