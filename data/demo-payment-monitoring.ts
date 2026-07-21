import { DEMO_MONITORING_TODAY } from "@/data/demo-monitoring-rules";
import { addDays } from "@/lib/calculate-deal-dates";
import { recalculatePaymentMonitoringDeal } from "@/lib/calculate-payment-monitoring";
import { FactoringType, PaymentEvent, PaymentMonitoringDeal } from "@/lib/types";

type DemoDealInput = Omit<
  PaymentMonitoringDeal,
  | "outstandingAmount"
  | "recourseDate"
  | "paymentStatus"
  | "riskLevel"
  | "recommendedReserve"
  | "potentialRecourseAmount"
  | "daysUntilPayment"
  | "overdueDays"
  | "daysUntilRecourse"
  | "nextImportantEvent"
  | "recommendedAction"
  | "events"
> & { events?: PaymentEvent[] };

function makeDeal(input: DemoDealInput): PaymentMonitoringDeal {
  const base: PaymentMonitoringDeal = {
    ...input,
    outstandingAmount: 0,
    recourseDate: null,
    paymentStatus: "scheduled",
    riskLevel: "low",
    recommendedReserve: 0,
    potentialRecourseAmount: 0,
    daysUntilPayment: null,
    overdueDays: 0,
    daysUntilRecourse: null,
    nextImportantEvent: "",
    recommendedAction: "",
    events: input.events ?? createBaseEvents(input),
  };
  return recalculatePaymentMonitoringDeal(base);
}

function createBaseEvents(input: DemoDealInput): PaymentEvent[] {
  const events: PaymentEvent[] = [
    event(input.id, "contract_received", "Договор получен", "FlowFactor получил договор для предварительной проверки.", input.deliveryDate, "Поставщик"),
    event(input.id, "document_review", "Проверка договора завершена", "FlowFactor сформировал предварительное предложение без запроса покупателю.", input.confirmationDate, "FlowFactor"),
    event(input.id, "financing_received", "Демонстрационное финансирование оформлено", `${input.financialPartnerName} отметил демофинансирование в сценарии.`, input.financingDate, "FlowFactor", input.financedAmount ?? undefined),
  ];
  if (input.amountPaidByBuyer > 0) {
    events.push(event(
      input.id,
      input.closedAt ? "closed" : "partial_payment",
      input.closedAt ? "Сделка полностью оплачена и закрыта" : "Частичная оплата получена",
      input.closedAt ? "FlowFactor получил оплату покупателя по демосценарию." : "FlowFactor отметил частичную оплату покупателя по демосценарию.",
      input.lastPaymentDate ?? DEMO_MONITORING_TODAY,
      "FlowFactor",
      input.amountPaidByBuyer,
    ));
  }
  return events;
}

function event(
  dealId: string,
  type: string,
  title: string,
  description: string,
  date: string,
  source: PaymentEvent["source"],
  amount?: number,
): PaymentEvent {
  return {
    id: `${dealId}-${type}`,
    dealId,
    type,
    title,
    description,
    amount,
    timestamp: `${date}T12:00:00+06:00`,
    source,
  };
}

const common = {
  supplierName: "ТОО «Arman Tea»",
  factoringType: "recourse" as FactoringType,
  reminderCount: 0,
  lastReminderAt: null,
  lastPaymentDate: null,
  closedAt: null,
};

export const demoPaymentMonitoringDeals: PaymentMonitoringDeal[] = [
  makeDeal({ ...common, id: "125", applicationId: "125", buyerName: "ТОО «Aspan Market»", financialPartnerName: "Örnek Capital", invoiceNumber: "AT-2026-001", invoiceAmount: 10_000_000, financedAmount: 9_200_000, amountPaidByBuyer: 0, deliveryDate: "2026-09-25", confirmationDate: "2026-09-26", financingDate: "2026-09-27", paymentDueDate: addDays(DEMO_MONITORING_TODAY, 60), gracePeriodDays: 20 }),
];
