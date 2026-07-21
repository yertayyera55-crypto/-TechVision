import { FactoringOffer, FactoringType } from "@/lib/types";

export function createDemoOffer(deliveryId: string, amount: number, savedDays: number, factoringType: FactoringType = "recourse"): Omit<FactoringOffer, "netAmount"> {
  return {
    deliveryId,
    financingPercentage: 95,
    financingAmount: Math.round(amount * 0.95),
    financingCost: Math.round(amount * 0.03),
    documentFees: 0,
    otherFees: 0,
    taxExpenses: 0,
    platformFee: 0,
    savedDays,
    factoringType,
    gracePeriodDays: 20,
  };
}

export function createDemoFlowFactorOffer(deliveryId: string, amount: number, savedDays: number, factoringType: FactoringType = "recourse"): FactoringOffer {
  const offer = createDemoOffer(deliveryId, amount, savedDays, factoringType);
  const commission = offer.financingCost + offer.documentFees + offer.otherFees + offer.taxExpenses + offer.platformFee;
  return { ...offer, netAmount: Math.max(0, offer.financingAmount - commission) };
}
