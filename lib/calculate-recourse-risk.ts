import { demoRules } from "@/data/demo-rules";
import { daysBetween } from "@/lib/calculate-deal-dates";
import { RiskLevel } from "@/lib/types";

export function calculateRecourseRisk(financedAmount: number, amountPaidByBuyer: number, regressionDate: string, today: string) {
  const potentialRecourseAmount = Math.max(0, financedAmount - amountPaidByBuyer);
  const daysUntilRegression = daysBetween(today, regressionDate);
  let riskLevel: RiskLevel = "low";
  if (potentialRecourseAmount === 0) riskLevel = "none";
  else if (daysUntilRegression <= 0) riskLevel = "critical";
  else if (daysUntilRegression <= demoRules.recourse.highRiskDays) riskLevel = "high";
  else if (daysUntilRegression <= demoRules.recourse.mediumRiskDays) riskLevel = "medium";
  return {
    potentialRecourseAmount,
    recommendedReserve: Math.round(potentialRecourseAmount * demoRules.recourse.recommendedReserveShare),
    daysUntilRegression,
    riskLevel,
  };
}
