export type ApplicationStatus =
  | "awaiting_confirmation"
  | "clarification_required"
  | "delivery_confirmed"
  | "document_review"
  | "additional_data"
  | "ready_for_calculation"
  | "ready_for_signing"
  | "transferred"
  | "financing_received"
  | "awaiting_buyer_payment"
  | "partially_paid"
  | "payment_overdue"
  | "recourse_approaching"
  | "closed"
  | "precheck_passed"
  | "paid"
  | "rejected"
  | "draft";

export type ConfirmationStatus =
  | "not_sent"
  | "waiting"
  | "reminder_sent"
  | "confirmed"
  | "mismatch"
  | "not_received";

export type DocumentType = "invoice" | "bill" | "contract" | "acceptance";
export type ContractAnswer = "yes" | "no" | "unsure";
export type FactoringType = "recourse" | "non_recourse" | "partner_decides";
export type ProfitabilityResultType = "profitable" | "low_margin" | "unprofitable";
export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";
export type PaymentStatus = "waiting" | "partial" | "overdue" | "paid";

export type PaymentMonitoringRiskLevel =
  | "none"
  | "low"
  | "medium"
  | "elevated"
  | "high"
  | "critical"
  | "review";

export type PaymentMonitoringStatus =
  | "scheduled"
  | "due_soon"
  | "due_today"
  | "overdue"
  | "grace_period"
  | "partial"
  | "closed"
  | "needs_review";

export interface ApplicationDocument {
  id: string;
  type: DocumentType;
  label: string;
  name: string;
  optional?: boolean;
  mimeType?: string;
  size?: number;
  storageKind?: "indexeddb" | "demo";
}

export interface ContractConditions {
  hasPaymentDelay: ContractAnswer;
  paymentTermSpecified: ContractAnswer;
  assignmentRestriction: ContractAnswer;
  buyerConsentRequired: ContractAnswer;
  offsetsAllowed: ContractAnswer;
  acceptanceMethodSpecified: ContractAnswer;
}

export interface Delivery {
  id: string;
  supplierName: string;
  buyerName: string;
  invoiceNumber: string;
  amount: number;
  costAmount: number;
  productionExpenses: number;
  deliveryDate: string;
  paymentDueDate: string;
  delayDays: number;
  confirmationStatus: ConfirmationStatus;
  confirmationRequestedAt?: string;
  confirmedAt?: string;
  reminderCount: number;
  lastReminderAt?: string;
  confirmationComment?: string;
  documents: ApplicationDocument[];
  contractConditions: ContractConditions;
  status: ApplicationStatus;
}

export interface FactoringOffer {
  deliveryId: string;
  financingPercentage: number;
  financingAmount: number;
  financingCost: number;
  documentFees: number;
  otherFees: number;
  taxExpenses: number;
  platformFee: number;
  netAmount: number;
  savedDays: number;
  factoringType: FactoringType;
  gracePeriodDays: number;
}

export interface ProfitabilityAnalysis {
  revenue: number;
  costAmount: number;
  productionExpenses: number;
  profitBeforeFactoring: number;
  marginBeforeFactoring: number;
  totalFactoringCost: number;
  profitAfterFactoring: number;
  marginAfterFactoring: number;
  profitReduction: number;
  result: ProfitabilityResultType;
  warnings: string[];
}

export interface DealEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  source: "Mighty Miners" | "Поставщик" | "Покупатель" | "Финансовый партнёр";
}

export interface PaymentEvent {
  id: string;
  dealId: string;
  type: string;
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  source: DealEvent["source"];
}

export interface PaymentMonitoringDeal {
  id: string;
  applicationId: string;
  supplierName: string;
  buyerName: string;
  financialPartnerName: string;
  invoiceNumber: string;
  invoiceAmount: number;
  financedAmount: number | null;
  amountPaidByBuyer: number;
  outstandingAmount: number;
  deliveryDate: string;
  confirmationDate: string;
  financingDate: string;
  paymentDueDate: string | null;
  gracePeriodDays: number | null;
  recourseDate: string | null;
  lastPaymentDate: string | null;
  closedAt: string | null;
  factoringType: FactoringType;
  paymentStatus: PaymentMonitoringStatus;
  riskLevel: PaymentMonitoringRiskLevel;
  reminderCount: number;
  lastReminderAt: string | null;
  recommendedReserve: number;
  potentialRecourseAmount: number;
  daysUntilPayment: number | null;
  overdueDays: number;
  daysUntilRecourse: number | null;
  nextImportantEvent: string;
  recommendedAction: string;
  events: PaymentEvent[];
}

export interface DealMonitoring {
  dealId: string;
  paymentDueDate: string;
  gracePeriodDays: number;
  regressionDate: string;
  financedAmount: number;
  amountPaidByBuyer: number;
  outstandingAmount: number;
  potentialRecourseAmount: number;
  recommendedReserve: number;
  riskLevel: RiskLevel;
  paymentStatus: PaymentStatus;
  financedAt: string;
  events: DealEvent[];
}

export interface Application extends Delivery {
  network: string;
  paymentDate: string;
  termDays: number;
  remainingDays: number | null;
  createdAt: string;
  transferredAt?: string;
  financialDataCompleted: boolean;
  factoringOffer?: FactoringOffer;
  profitability?: ProfitabilityAnalysis;
  selectedFactoringType?: FactoringType;
  recourseConsent?: boolean;
  dataTransferConsent?: boolean;
  signedAt?: string;
  monitoring?: DealMonitoring;
}

export interface ApplicationDraft {
  network: string;
  amount: string;
  invoiceNumber: string;
  deliveryDate: string;
  paymentDate: string;
  documents: Partial<Record<DocumentType, ApplicationDocument>>;
  step: number;
}
