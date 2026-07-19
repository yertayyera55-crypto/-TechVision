import { createDemoOffer } from "@/data/demo-offers";
import { createDemoMonitoring } from "@/data/demo-monitoring";
import { calculateProfitability } from "@/lib/calculate-profitability";
import { Application, ContractConditions } from "@/lib/types";

export const standardDocuments = [
  { id: "invoice", type: "invoice" as const, label: "Накладная", name: "Накладная_125.pdf" },
  { id: "bill", type: "bill" as const, label: "Счёт-фактура", name: "Счет_фактура.pdf" },
  { id: "contract", type: "contract" as const, label: "Договор", name: "Договор_TeaLocal.pdf" },
];

export const defaultContractConditions: ContractConditions = {
  hasPaymentDelay: "yes",
  paymentTermSpecified: "yes",
  assignmentRestriction: "no",
  buyerConsentRequired: "yes",
  offsetsAllowed: "unsure",
  acceptanceMethodSpecified: "yes",
};

function documentsFor(id: string) {
  return standardDocuments.map((document) => ({ ...document, id: `${id}-${document.id}`, name: document.name.replace("125", id) }));
}

function financials(id: string, amount: number, costAmount: number, productionExpenses: number, savedDays: number) {
  return calculateProfitability({ revenue: amount, costAmount, productionExpenses, offer: createDemoOffer(id, amount, savedDays) });
}

const application118Financials = financials("118", 2_300_000, 1_960_000, 35_000, 73);
const application111Financials = financials("111", 1_200_000, 950_000, 20_000, 43);
const monitoring118 = createDemoMonitoring("118", 2_300_000, "2026-09-30");
const monitoring111 = createDemoMonitoring("111", 1_200_000, "2026-08-21");
monitoring111.amountPaidByBuyer = 1_200_000;
monitoring111.outstandingAmount = 0;
monitoring111.potentialRecourseAmount = 0;
monitoring111.recommendedReserve = 0;
monitoring111.riskLevel = "none";
monitoring111.paymentStatus = "paid";

export const demoApplications: Application[] = [
  {
    id: "125",
    supplierName: "Tea Local LLP",
    buyerName: "Green Market",
    network: "Green Market",
    invoiceNumber: "TL-1807-25",
    amount: 2_000_000,
    costAmount: 1_720_000,
    productionExpenses: 20_000,
    deliveryDate: "2026-07-18",
    paymentDueDate: "2026-10-16",
    paymentDate: "2026-10-16",
    delayDays: 90,
    termDays: 90,
    confirmationStatus: "waiting",
    confirmationRequestedAt: "2026-07-18T10:45:00+06:00",
    reminderCount: 0,
    documents: standardDocuments,
    contractConditions: defaultContractConditions,
    status: "awaiting_confirmation",
    remainingDays: 87,
    createdAt: "2026-07-18T10:30:00+06:00",
    financialDataCompleted: false,
  },
  {
    id: "121",
    supplierName: "Tea Local LLP",
    buyerName: "Small",
    network: "Small",
    invoiceNumber: "TL-0907-21",
    amount: 1_500_000,
    costAmount: 1_220_000,
    productionExpenses: 25_000,
    deliveryDate: "2026-07-09",
    paymentDueDate: "2026-09-09",
    paymentDate: "2026-09-09",
    delayDays: 60,
    termDays: 60,
    confirmationStatus: "confirmed",
    confirmationRequestedAt: "2026-07-09T09:25:00+06:00",
    confirmedAt: "2026-07-10T12:10:00+06:00",
    reminderCount: 1,
    lastReminderAt: "2026-07-10T09:00:00+06:00",
    documents: documentsFor("121"),
    contractConditions: defaultContractConditions,
    status: "delivery_confirmed",
    remainingDays: 51,
    createdAt: "2026-07-09T09:20:00+06:00",
    financialDataCompleted: false,
  },
  {
    id: "118",
    supplierName: "Tea Local LLP",
    buyerName: "Toimart",
    network: "Toimart",
    invoiceNumber: "TL-3006-18",
    amount: 2_300_000,
    costAmount: 1_960_000,
    productionExpenses: 35_000,
    deliveryDate: "2026-06-30",
    paymentDueDate: "2026-09-30",
    paymentDate: "2026-09-30",
    delayDays: 75,
    termDays: 75,
    confirmationStatus: "confirmed",
    confirmationRequestedAt: "2026-06-30T14:10:00+06:00",
    confirmedAt: "2026-07-01T11:00:00+06:00",
    reminderCount: 0,
    documents: documentsFor("118"),
    contractConditions: defaultContractConditions,
    status: "awaiting_buyer_payment",
    remainingDays: 72,
    createdAt: "2026-06-30T14:05:00+06:00",
    transferredAt: "2026-07-02T15:40:00+06:00",
    financialDataCompleted: true,
    factoringOffer: application118Financials.offer,
    profitability: application118Financials.analysis,
    selectedFactoringType: "recourse",
    recourseConsent: true,
    signedAt: "2026-07-02T15:35:00+06:00",
    monitoring: monitoring118,
  },
  {
    id: "111",
    supplierName: "Tea Local LLP",
    buyerName: "Green Market",
    network: "Green Market",
    invoiceNumber: "TL-2106-11",
    amount: 1_200_000,
    costAmount: 950_000,
    productionExpenses: 20_000,
    deliveryDate: "2026-06-21",
    paymentDueDate: "2026-08-21",
    paymentDate: "2026-08-21",
    delayDays: 45,
    termDays: 45,
    confirmationStatus: "confirmed",
    confirmationRequestedAt: "2026-06-21T16:15:00+06:00",
    confirmedAt: "2026-06-22T10:20:00+06:00",
    reminderCount: 0,
    documents: documentsFor("111"),
    contractConditions: defaultContractConditions,
    status: "closed",
    remainingDays: null,
    createdAt: "2026-06-21T16:10:00+06:00",
    transferredAt: "2026-06-23T13:00:00+06:00",
    financialDataCompleted: true,
    factoringOffer: application111Financials.offer,
    profitability: application111Financials.analysis,
    selectedFactoringType: "recourse",
    recourseConsent: true,
    signedAt: "2026-06-23T12:55:00+06:00",
    monitoring: monitoring111,
  },
];

export const metrics = [
  { label: "Ожидается от покупателей", value: "5 800 000 ₸", icon: "clock" },
  { label: "В активных сделках", value: "3 870 000 ₸", icon: "wallet" },
  { label: "Сэкономлено дней", value: "176", icon: "calendar" },
  { label: "Получено средств", value: "2 160 000 ₸", icon: "card" },
] as const;

export const networkOptions = ["Green Market", "Magnum Cash & Carry", "Small", "Toimart", "Anvar", "Другой контрагент"];
