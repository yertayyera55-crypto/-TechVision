import { DEMO_TODAY } from "@/data/demo-rules";
import { createDemoEvents } from "@/data/demo-events";
import { addDays } from "@/lib/calculate-deal-dates";
import { calculateRecourseRisk } from "@/lib/calculate-recourse-risk";
import { DealMonitoring } from "@/lib/types";

export function createDemoMonitoring(dealId: string, amount: number, paymentDueDate: string, gracePeriodDays = 20, supplierReceivedAmount = Math.round(amount * 0.92)): DealMonitoring {
  const financedAmount = supplierReceivedAmount;
  const regressionDate = addDays(paymentDueDate, gracePeriodDays);
  const risk = calculateRecourseRisk(financedAmount, 0, regressionDate, DEMO_TODAY);
  return {
    dealId,
    paymentDueDate,
    gracePeriodDays,
    regressionDate,
    financedAmount,
    amountPaidByBuyer: 0,
    outstandingAmount: amount,
    potentialRecourseAmount: risk.potentialRecourseAmount,
    recommendedReserve: risk.recommendedReserve,
    riskLevel: risk.riskLevel,
    paymentStatus: "waiting",
    financedAt: "2026-07-22T14:00:00+06:00",
    events: createDemoEvents(dealId),
  };
}
