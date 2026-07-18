export type ApplicationStatus =
  | "awaiting_confirmation"
  | "precheck_passed"
  | "transferred"
  | "paid"
  | "rejected"
  | "draft";

export type DocumentType = "invoice" | "bill" | "contract" | "acceptance";

export interface ApplicationDocument {
  id: string;
  type: DocumentType;
  label: string;
  name: string;
  optional?: boolean;
}

export interface Application {
  id: string;
  network: string;
  amount: number;
  invoiceNumber: string;
  deliveryDate: string;
  paymentDate: string;
  termDays: number;
  status: ApplicationStatus;
  remainingDays: number | null;
  documents: ApplicationDocument[];
  createdAt: string;
  confirmedAt?: string;
  transferredAt?: string;
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
