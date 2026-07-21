import { DEMO_MONITORING_TODAY, demoMonitoringRules } from "@/data/demo-monitoring-rules";
import { addDays, daysBetween } from "@/lib/calculate-deal-dates";
import {
  PaymentMonitoringDeal,
  PaymentMonitoringRiskLevel,
  PaymentMonitoringStatus,
} from "@/lib/types";

type MonitoringSource = Pick<
  PaymentMonitoringDeal,
  "invoiceAmount" | "financedAmount" | "amountPaidByBuyer" | "paymentDueDate" | "gracePeriodDays"
>;

export interface PaymentMonitoringCalculation {
  daysUntilPayment: number | null;
  overdueDays: number;
  daysUntilRecourse: number | null;
  outstandingAmount: number;
  potentialRecourseAmount: number;
  recommendedReserve: number;
  riskLevel: PaymentMonitoringRiskLevel;
  paymentStatus: PaymentMonitoringStatus;
  recourseDate: string | null;
  nextImportantEvent: string;
  recommendedAction: string;
}

export function calculatePaymentMonitoring(
  deal: MonitoringSource,
  currentDate = DEMO_MONITORING_TODAY,
): PaymentMonitoringCalculation {
  const paid = Math.max(0, deal.amountPaidByBuyer);
  const outstandingAmount = Math.max(deal.invoiceAmount - paid, 0);
  const financedAmount = deal.financedAmount;
  const potentialRecourseAmount = financedAmount === null
    ? 0
    : Math.max(financedAmount - paid, 0);
  const recommendedReserve = Math.round(
    potentialRecourseAmount * demoMonitoringRules.recommendedReserveShare,
  );

  if (outstandingAmount === 0) {
    return {
      daysUntilPayment: deal.paymentDueDate ? daysBetween(currentDate, deal.paymentDueDate) : null,
      overdueDays: deal.paymentDueDate ? Math.max(daysBetween(deal.paymentDueDate, currentDate), 0) : 0,
      daysUntilRecourse: null,
      outstandingAmount: 0,
      potentialRecourseAmount: 0,
      recommendedReserve: 0,
      riskLevel: "none",
      paymentStatus: "closed",
      recourseDate: deal.paymentDueDate !== null && deal.gracePeriodDays !== null
        ? addDays(deal.paymentDueDate, deal.gracePeriodDays)
        : null,
      nextImportantEvent: "Сделка закрыта, контроль оплаты завершён.",
      recommendedAction: "Контроль не требуется",
    };
  }

  if (!deal.paymentDueDate || deal.gracePeriodDays === null || financedAmount === null) {
    return {
      daysUntilPayment: null,
      overdueDays: 0,
      daysUntilRecourse: null,
      outstandingAmount,
      potentialRecourseAmount,
      recommendedReserve,
      riskLevel: "review",
      paymentStatus: "needs_review",
      recourseDate: null,
      nextImportantEvent: "Не хватает данных для расчёта.",
      recommendedAction: missingDataAction(deal),
    };
  }

  const recourseDate = addDays(deal.paymentDueDate, deal.gracePeriodDays);
  const daysUntilPayment = daysBetween(currentDate, deal.paymentDueDate);
  const overdueDays = Math.max(-daysUntilPayment, 0);
  const daysUntilRecourse = daysBetween(currentDate, recourseDate);
  const riskLevel = calculateRisk(daysUntilPayment, daysUntilRecourse);
  const paymentStatus = calculateStatus(daysUntilPayment, daysUntilRecourse, paid);

  return {
    daysUntilPayment,
    overdueDays,
    daysUntilRecourse,
    outstandingAmount,
    potentialRecourseAmount,
    recommendedReserve,
    riskLevel,
    paymentStatus,
    recourseDate,
    nextImportantEvent: getNextEvent(daysUntilPayment, daysUntilRecourse, overdueDays),
    recommendedAction: getRecommendedAction({
      daysUntilPayment,
      daysUntilRecourse,
      overdueDays,
      partial: paid > 0,
    }),
  };
}

export function recalculatePaymentMonitoringDeal(
  deal: PaymentMonitoringDeal,
  currentDate = DEMO_MONITORING_TODAY,
): PaymentMonitoringDeal {
  return { ...deal, ...calculatePaymentMonitoring(deal, currentDate) };
}

export function requiresPaymentAttention(deal: PaymentMonitoringDeal) {
  return deal.paymentStatus !== "closed" && (
    deal.riskLevel === "review"
    || deal.riskLevel === "critical"
    || deal.paymentStatus === "grace_period"
    || deal.paymentStatus === "overdue"
    || deal.paymentStatus === "due_today"
    || (deal.daysUntilPayment !== null && deal.daysUntilPayment <= demoMonitoringRules.dueSoonDays)
  );
}

export function paymentAttentionPriority(deal: PaymentMonitoringDeal) {
  if (deal.riskLevel === "critical") return 600;
  if (deal.paymentStatus === "grace_period") return 500;
  if (deal.paymentStatus === "overdue") return 400;
  if (deal.paymentStatus === "due_today") return 300;
  if (deal.daysUntilPayment !== null && deal.daysUntilPayment <= demoMonitoringRules.dueSoonDays) return 200;
  if (deal.riskLevel === "review") return 100;
  return 0;
}

function calculateRisk(daysUntilPayment: number, daysUntilRecourse: number): PaymentMonitoringRiskLevel {
  if (daysUntilRecourse <= demoMonitoringRules.criticalRecourseDays) return "critical";
  if (daysUntilPayment < 0) return "high";
  if (daysUntilPayment < demoMonitoringRules.mediumRiskFromDays) return "elevated";
  if (daysUntilPayment <= demoMonitoringRules.mediumRiskToDays) return "medium";
  return "low";
}

function calculateStatus(
  daysUntilPayment: number,
  daysUntilRecourse: number,
  paid: number,
): PaymentMonitoringStatus {
  if (daysUntilPayment < 0) return daysUntilRecourse >= 0 ? "grace_period" : "overdue";
  if (daysUntilPayment === 0) return "due_today";
  if (paid > 0) return "partial";
  if (daysUntilPayment <= demoMonitoringRules.dueSoonDays) return "due_soon";
  return "scheduled";
}

function getNextEvent(daysUntilPayment: number, daysUntilRecourse: number, overdueDays: number) {
  if (daysUntilPayment > 0) return `Оплата покупателем через ${formatDays(daysUntilPayment)}.`;
  if (daysUntilPayment === 0) return "Сегодня дата оплаты покупателем.";
  if (daysUntilRecourse >= 0) return `Покупатель просрочил оплату на ${formatDays(overdueDays)}. До возможного регресса — ${formatDays(daysUntilRecourse)}.`;
  return `Дата возможного регресса прошла ${formatDays(Math.abs(daysUntilRecourse))} назад.`;
}

function getRecommendedAction({
  daysUntilPayment,
  daysUntilRecourse,
  overdueDays,
  partial,
}: {
  daysUntilPayment: number;
  daysUntilRecourse: number;
  overdueDays: number;
  partial: boolean;
}) {
  if (daysUntilRecourse <= demoMonitoringRules.criticalRecourseDays) {
    return "Связаться с фактором и подготовить резерв";
  }
  if (overdueDays >= demoMonitoringRules.overdueReminderDay) return "Связаться с покупателем";
  if (overdueDays > 0) return "Проверить поступление платежа";
  if (daysUntilPayment === 0) return "Проверить поступление платежа";
  if (daysUntilPayment <= demoMonitoringRules.dueSoonDays) return "Отправить напоминание покупателю";
  if (partial) return "Проверить остаток задолженности";
  return "Контроль не требуется";
}

function missingDataAction(deal: MonitoringSource) {
  if (deal.gracePeriodDays === null) return "Нужно уточнить льготный период";
  if (!deal.paymentDueDate) return "Указать дату оплаты";
  return "Указать сумму финансирования";
}

function formatDays(value: number) {
  const absolute = Math.abs(value);
  const lastTwo = absolute % 100;
  const last = absolute % 10;
  const word = lastTwo >= 11 && lastTwo <= 14
    ? "дней"
    : last === 1
      ? "день"
      : last >= 2 && last <= 4
        ? "дня"
        : "дней";
  return `${absolute} ${word}`;
}
