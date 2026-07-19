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
    event(input.id, "confirmation_request", "Запрос подтверждения отправлен", "Покупателю создана одноразовая ссылка.", input.deliveryDate, "Mighty Miners"),
    event(input.id, "delivery_confirmed", "Поставка подтверждена", "Покупатель подтвердил поставку и комплект документов.", input.confirmationDate, "Покупатель"),
    event(input.id, "financing_received", "Финансирование получено", `Партнёр ${input.financialPartnerName} перечислил финансирование.`, input.financingDate, "Финансовый партнёр", input.financedAmount ?? undefined),
  ];
  if (input.amountPaidByBuyer > 0) {
    events.push(event(
      input.id,
      input.closedAt ? "closed" : "partial_payment",
      input.closedAt ? "Сделка полностью оплачена и закрыта" : "Частичная оплата получена",
      input.closedAt ? "Покупатель полностью погасил задолженность." : "Зафиксирована частичная оплата покупателя.",
      input.lastPaymentDate ?? DEMO_MONITORING_TODAY,
      "Поставщик",
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
  supplierName: "Tea Local LLP",
  factoringType: "recourse" as FactoringType,
  reminderCount: 0,
  lastReminderAt: null,
  lastPaymentDate: null,
  closedAt: null,
};

export const demoPaymentMonitoringDeals: PaymentMonitoringDeal[] = [
  makeDeal({ ...common, id: "118", applicationId: "118", buyerName: "Toimart", financialPartnerName: "Halyk Factor", invoiceNumber: "TL-3006-18", invoiceAmount: 2_300_000, financedAmount: 2_070_000, amountPaidByBuyer: 0, deliveryDate: "2026-06-30", confirmationDate: "2026-07-01", financingDate: "2026-07-22", paymentDueDate: addDays(DEMO_MONITORING_TODAY, 30), gracePeriodDays: 20 }),
  makeDeal({ ...common, id: "202", applicationId: "202", buyerName: "Green Market", financialPartnerName: "BCC Factoring", invoiceNumber: "TL-1907-202", invoiceAmount: 1_850_000, financedAmount: 1_665_000, amountPaidByBuyer: 0, deliveryDate: "2026-07-19", confirmationDate: "2026-07-20", financingDate: "2026-07-22", paymentDueDate: addDays(DEMO_MONITORING_TODAY, 10), gracePeriodDays: 14 }),
  makeDeal({ ...common, id: "203", applicationId: "203", buyerName: "Small Market", financialPartnerName: "ForteFactor", invoiceNumber: "TL-2207-203", invoiceAmount: 980_000, financedAmount: 882_000, amountPaidByBuyer: 0, deliveryDate: "2026-07-22", confirmationDate: "2026-07-23", financingDate: "2026-07-25", paymentDueDate: addDays(DEMO_MONITORING_TODAY, 3), gracePeriodDays: 7 }),
  makeDeal({ ...common, id: "204", applicationId: "204", buyerName: "Magnum Cash & Carry", financialPartnerName: "Halyk Factor", invoiceNumber: "TL-2507-204", invoiceAmount: 3_400_000, financedAmount: 3_060_000, amountPaidByBuyer: 0, deliveryDate: "2026-07-25", confirmationDate: "2026-07-26", financingDate: "2026-07-28", paymentDueDate: DEMO_MONITORING_TODAY, gracePeriodDays: 20 }),
  makeDeal({ ...common, id: "205", applicationId: "205", buyerName: "Anvar", financialPartnerName: "BCC Factoring", invoiceNumber: "TL-1207-205", invoiceAmount: 2_000_000, financedAmount: 1_800_000, amountPaidByBuyer: 0, deliveryDate: "2026-07-12", confirmationDate: "2026-07-13", financingDate: "2026-07-15", paymentDueDate: addDays(DEMO_MONITORING_TODAY, -4), gracePeriodDays: 14, reminderCount: 1, lastReminderAt: "2026-09-24T10:30:00+06:00" }),
  makeDeal({ ...common, id: "206", applicationId: "206", buyerName: "A-Store", financialPartnerName: "ForteFactor", invoiceNumber: "TL-0807-206", invoiceAmount: 1_000_000, financedAmount: 900_000, amountPaidByBuyer: 0, deliveryDate: "2026-07-08", confirmationDate: "2026-07-09", financingDate: "2026-07-11", paymentDueDate: addDays(DEMO_MONITORING_TODAY, -17), gracePeriodDays: 20, reminderCount: 2, lastReminderAt: "2026-09-23T15:00:00+06:00" }),
  makeDeal({ ...common, id: "207", applicationId: "207", buyerName: "Green Market", financialPartnerName: "Halyk Factor", invoiceNumber: "TL-2107-207", invoiceAmount: 3_000_000, financedAmount: 2_700_000, amountPaidByBuyer: 500_000, deliveryDate: "2026-07-21", confirmationDate: "2026-07-22", financingDate: "2026-07-24", paymentDueDate: addDays(DEMO_MONITORING_TODAY, 7), gracePeriodDays: 30, lastPaymentDate: "2026-09-20" }),
  makeDeal({ ...common, id: "111", applicationId: "111", buyerName: "Green Market", financialPartnerName: "BCC Factoring", invoiceNumber: "TL-2106-11", invoiceAmount: 1_200_000, financedAmount: 1_080_000, amountPaidByBuyer: 1_200_000, deliveryDate: "2026-06-21", confirmationDate: "2026-06-22", financingDate: "2026-06-23", paymentDueDate: "2026-08-21", gracePeriodDays: 20, lastPaymentDate: "2026-08-20", closedAt: "2026-08-20" }),
];
