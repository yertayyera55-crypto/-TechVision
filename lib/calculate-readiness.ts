import { demoRules } from "@/data/demo-rules";
import { Application } from "@/lib/types";

export interface ReadinessItem {
  id: string;
  label: string;
  ready: boolean;
  weight: number;
}

export function calculateReadiness(application: Application) {
  const weights = demoRules.readinessWeights;
  const items: ReadinessItem[] = [
    { id: "confirmation", label: "Поставка подтверждена", ready: application.confirmationStatus === "confirmed", weight: weights.confirmation },
    { id: "invoice", label: "Накладная найдена", ready: application.documents.some((document) => document.type === "invoice"), weight: weights.invoice },
    { id: "bill", label: "Счёт-фактура найдена", ready: application.documents.some((document) => document.type === "bill"), weight: weights.bill },
    { id: "amount", label: "Сумма документов совпадает", ready: application.amount > 0, weight: weights.amountMatch },
    { id: "buyer", label: "Покупатель определён", ready: Boolean(application.buyerName), weight: weights.buyer },
    { id: "delay", label: "Срок отсрочки указан", ready: application.delayDays > 0, weight: weights.delay },
    { id: "year", label: "Договор относится к текущему финансовому году", ready: application.deliveryDate.startsWith("2026"), weight: weights.currentYear },
    { id: "assignment", label: "Условие уступки требования проверено", ready: application.contractConditions.assignmentRestriction !== "unsure", weight: weights.assignment },
    { id: "financials", label: "Финансовые данные заполнены", ready: application.financialDataCompleted, weight: weights.financials },
  ];
  const percentage = items.reduce((total, item) => total + (item.ready ? item.weight : 0), 0);
  return { items, percentage, missing: items.filter((item) => !item.ready) };
}
