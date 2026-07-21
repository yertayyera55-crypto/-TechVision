import { recalculatePaymentMonitoringDeal } from "@/lib/calculate-payment-monitoring";
import { Application, PaymentMonitoringDeal } from "@/lib/types";

/**
 * Адаптер сохраняет совместимость с P0-заявками: новая переданная заявка сразу
 * становится сделкой контроля оплат без дублирования данных в wizard.
 */
export function paymentMonitoringDealFromApplication(application: Application): PaymentMonitoringDeal | null {
  const monitoring = application.monitoring;
  if (!monitoring) return null;
  const closedEvent = monitoring.events.findLast((event) => event.type === "closed");
  const paymentEvent = monitoring.events.findLast((event) => event.type === "partial_payment" || event.type === "closed");
  const base: PaymentMonitoringDeal = {
    id: application.id,
    applicationId: application.id,
    supplierName: application.supplierName,
    buyerName: application.buyerName,
    financialPartnerName: "FlowFactor",
    invoiceNumber: application.invoiceNumber,
    invoiceAmount: application.amount,
    financedAmount: monitoring.financedAmount,
    amountPaidByBuyer: monitoring.amountPaidByBuyer,
    outstandingAmount: monitoring.outstandingAmount,
    deliveryDate: application.deliveryDate,
    confirmationDate: application.confirmedAt?.slice(0, 10) ?? application.deliveryDate,
    financingDate: monitoring.financedAt.slice(0, 10),
    paymentDueDate: monitoring.paymentDueDate,
    gracePeriodDays: monitoring.gracePeriodDays,
    recourseDate: monitoring.regressionDate,
    lastPaymentDate: paymentEvent?.timestamp.slice(0, 10) ?? null,
    closedAt: closedEvent?.timestamp.slice(0, 10) ?? null,
    factoringType: application.selectedFactoringType ?? application.factoringOffer?.factoringType ?? "partner_decides",
    paymentStatus: "scheduled",
    riskLevel: "low",
    reminderCount: application.reminderCount,
    lastReminderAt: application.lastReminderAt ?? null,
    recommendedReserve: monitoring.recommendedReserve,
    potentialRecourseAmount: monitoring.potentialRecourseAmount,
    daysUntilPayment: null,
    overdueDays: 0,
    daysUntilRecourse: null,
    nextImportantEvent: "",
    recommendedAction: "",
    events: monitoring.events.map((event) => ({ ...event, dealId: application.id })),
  };
  return recalculatePaymentMonitoringDeal(base);
}
