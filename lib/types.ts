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

export type DocumentType = "invoice" | "bill" | "contract" | "acceptance" | "esf" | "product_doc" | "other";
export type ContractAnswer = "yes" | "no" | "unsure";
export type FactoringType = "recourse" | "non_recourse" | "partner_decides";
export type ProfitabilityResultType = "profitable" | "low_margin" | "unprofitable";
export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";
export type PaymentStatus = "waiting" | "partial" | "overdue" | "paid";
export type ProductCategory =
  | "tea_coffee"
  | "meat_chilled"
  | "dairy"
  | "produce"
  | "grocery"
  | "frozen"
  | "confectionery"
  | "beverages"
  | "other";
export type DataSource = "profile" | "contract" | "delivery_document" | "system" | "missing";

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

export interface CompanyProfile {
  company: string;
  bin: string;
  director: string;
  industry: string;
  businessDescription: string;
  mainProducts: string;
  monthlyTurnover: string;
  annualTurnover: string;
  yearsInBusiness: string;
  contact: string;
  phone: string;
  email: string;
  mainBuyer: string;
  bankDetails: string;
  iban: string;
}

export interface AnalysisEvidence {
  field: string;
  excerpt: string;
}

export interface ReceivableCalculation {
  acceptedSupplyAmount: number;
  returnsAmount: number;
  holdsAmount: number;
  confirmedReceivable: number;
  desiredFinancingAmount: number;
  availableFinancing: number;
  confirmationDate: string;
  dueDate: string | null;
}

export interface ReadinessProfile {
  score: number;
  category: ProductCategory;
  documentCompleteness: number;
  missingDocuments: string[];
  risks: string[];
  preliminaryConclusion: string;
}

export interface PartnerOffer {
  id: string;
  partnerName: string;
  description: string;
  eligible: boolean;
  financingPercentage: number;
  financingAmount: number;
  cost: number;
  netAmount: number;
  termDays: number;
  factoringType: FactoringType;
  requiredDocuments: string[];
  reasons: string[];
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
  source: "FlowFactor" | "Поставщик" | "Покупатель";
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
  contractNumber?: string;
  supplySubject?: string;
  paymentTerms?: string;
  companyProfile?: CompanyProfile;
  analysis?: ContractAnalysisResult;
  productCategory?: ProductCategory;
  receivable?: ReceivableCalculation;
  readiness?: ReadinessProfile;
  partnerOffers?: PartnerOffer[];
  selectedPartnerOfferId?: string;
}

export interface ApplicationDraft {
  network: string;
  amount: string;
  invoiceNumber: string;
  deliveryDate: string;
  paymentDate: string;
  paymentTermDays: string;
  paymentTerms: string;
  contractNumber: string;
  supplySubject: string;
  acceptanceTerms: string;
  assignmentTerms: string;
  productCategory: ProductCategory;
  categoryConfidence: number;
  categoryConfirmed: boolean;
  acceptedSupplyAmount: string;
  returnsAmount: string;
  holdsAmount: string;
  confirmationDate: string;
  desiredFinancingAmount: string;
  analysis: ContractAnalysisResult | null;
  companyProfile: CompanyProfile;
  documents: Partial<Record<DocumentType, ApplicationDocument>>;
  step: number;
}

export interface ContractAnalysisResult {
  supplierName: string | null;
  buyerName: string | null;
  network: string | null;
  invoiceNumber: string | null;
  amount: number | null;
  deliveryDate: string | null;
  paymentDueDate: string | null;
  paymentTermDays: number | null;
  contractNumber: string | null;
  contractDate: string | null;
  paymentTerms: string | null;
  supplySubject: string | null;
  productCategory: ProductCategory | null;
  categoryConfidence: number | null;
  deliveryMethod: string | null;
  delayTrigger: string | null;
  acceptanceTerms: string | null;
  returnsTerms: string | null;
  deductions: string | null;
  assignmentTerms: string | null;
  requiredProductDocuments: string[];
  evidence: AnalysisEvidence[];
  factoringReady: boolean;
  missingData: string[];
  notes: string[];
}
