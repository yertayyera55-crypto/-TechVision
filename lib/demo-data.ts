import { createDemoMonitoring } from "@/data/demo-monitoring";
import { createDemoFlowFactorOffer } from "@/data/demo-offers";
import { Application, ContractConditions } from "@/lib/types";

export const standardDocuments = [
  { id: "125-contract", type: "contract" as const, label: "Договор поставки", name: "Договор_ArmanTea_Aspan.pdf", storageKind: "demo" as const },
];

export const defaultContractConditions: ContractConditions = {
  hasPaymentDelay: "yes",
  paymentTermSpecified: "yes",
  assignmentRestriction: "no",
  buyerConsentRequired: "yes",
  offsetsAllowed: "unsure",
  acceptanceMethodSpecified: "yes",
};

const demoOffer = createDemoFlowFactorOffer("125", 10_000_000, 60, "recourse");
const demoMonitoring = createDemoMonitoring("125", 10_000_000, "2026-11-24", demoOffer.gracePeriodDays, demoOffer.netAmount);

export const demoApplications: Application[] = [
  {
    id: "125",
    supplierName: "ТОО «Arman Tea»",
    buyerName: "ТОО «Aspan Market»",
    network: "ТОО «Aspan Market»",
    invoiceNumber: "AT-2026-001",
    amount: 10_000_000,
    costAmount: 0,
    productionExpenses: 0,
    deliveryDate: "2026-09-25",
    paymentDueDate: "2026-11-24",
    paymentDate: "2026-11-24",
    delayDays: 60,
    termDays: 60,
    confirmationStatus: "not_sent",
    reminderCount: 0,
    documents: standardDocuments,
    contractConditions: defaultContractConditions,
    status: "awaiting_buyer_payment",
    remainingDays: 60,
    createdAt: "2026-09-25T10:20:00+06:00",
    transferredAt: "2026-09-27T12:00:00+06:00",
    financialDataCompleted: true,
    factoringOffer: demoOffer,
    selectedFactoringType: "recourse",
    recourseConsent: true,
    signedAt: "2026-09-27T11:50:00+06:00",
    monitoring: demoMonitoring,
  },
];

export const metrics = [
  { label: "Требование к покупателю", value: "10 000 000 ₸", icon: "clock" },
  { label: "Демо-сумма сейчас", value: "9 200 000 ₸", icon: "wallet" },
  { label: "Срок оплаты покупателя", value: "60 дней", icon: "calendar" },
  { label: "Активных сделок", value: "1", icon: "card" },
] as const;

export const networkOptions = ["ТОО «Aspan Market»", "Другой покупатель"];
