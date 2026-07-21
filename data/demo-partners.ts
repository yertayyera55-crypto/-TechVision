import { FactoringType, ProductCategory } from "@/lib/types";

export interface DemoPartnerCriteria {
  id: string;
  name: string;
  description: string;
  maxTermDays: number;
  minReceivable: number;
  financingPercentage: number;
  commissionRate: number;
  factoringType: FactoringType;
  requiresAcceptanceProof: boolean;
  acceptsPerishables: boolean;
  preferredCategories: ProductCategory[];
}

export const DEMO_PARTNERS: DemoPartnerCriteria[] = [
  { id: "ornek-capital", name: "Örnek Capital", description: "Демо-фактор с фокусом на регулярные поставки в торговые сети.", maxTermDays: 90, minReceivable: 500_000, financingPercentage: 95, commissionRate: 0.029, factoringType: "recourse", requiresAcceptanceProof: true, acceptsPerishables: true, preferredCategories: ["tea_coffee", "grocery", "confectionery", "beverages"] },
  { id: "qala-finance", name: "Qala Finance", description: "Синтетический партнёр для подтверждённой дебиторской задолженности.", maxTermDays: 75, minReceivable: 1_000_000, financingPercentage: 90, commissionRate: 0.024, factoringType: "non_recourse", requiresAcceptanceProof: true, acceptsPerishables: false, preferredCategories: ["tea_coffee", "grocery", "beverages"] },
  { id: "bereke-flow", name: "Bereke Flow", description: "Демо-партнёр для продовольственных поставщиков, включая скоропортящиеся категории.", maxTermDays: 120, minReceivable: 250_000, financingPercentage: 85, commissionRate: 0.021, factoringType: "recourse", requiresAcceptanceProof: false, acceptsPerishables: true, preferredCategories: ["meat_chilled", "dairy", "produce", "frozen"] },
];
