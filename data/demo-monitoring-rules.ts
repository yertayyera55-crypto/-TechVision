export const DEMO_MONITORING_TODAY = "2026-09-25";

/**
 * Бизнес-пороги вынесены из UI и расчётной функции. В production их можно
 * получать из настроек продукта или договора партнёра без переписывания JSX.
 */
export const demoMonitoringRules = {
  dueSoonDays: 7,
  mediumRiskFromDays: 7,
  mediumRiskToDays: 14,
  criticalRecourseDays: 5,
  overdueReminderDay: 3,
  recommendedReserveShare: 0.2,
  attentionLimit: 5,
  riskOrder: {
    review: 6,
    critical: 5,
    high: 4,
    elevated: 3,
    medium: 2,
    low: 1,
    none: 0,
  },
} as const;
