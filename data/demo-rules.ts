export const demoRules = {
  profitability: {
    healthyMarginPercent: 8,
    lowMarginPercent: 3,
  },
  recourse: {
    recommendedReserveShare: 0.2,
    highRiskDays: 5,
    mediumRiskDays: 20,
  },
  readinessWeights: {
    confirmation: 15,
    invoice: 10,
    bill: 10,
    amountMatch: 10,
    buyer: 10,
    delay: 10,
    currentYear: 10,
    assignment: 10,
    financials: 15,
  },
} as const;

export const DEMO_TODAY = "2026-09-25";
