import { demoPaymentMonitoringDeals } from "@/data/demo-payment-monitoring";
import { PaymentMonitoringDeal } from "@/lib/types";

export class PaymentMonitoringRepository {
  constructor(private readonly storageKey: string) {}

  list(): PaymentMonitoringDeal[] {
    if (typeof window === "undefined") return demoPaymentMonitoringDeals;
    const saved = window.localStorage.getItem(this.storageKey);
    if (!saved) return demoPaymentMonitoringDeals;
    const parsed: unknown = JSON.parse(saved);
    if (!isMonitoringDealArray(parsed)) {
      throw new Error("Сохранённые данные контроля оплат имеют неверную структуру.");
    }
    return parsed;
  }

  replaceAll(deals: PaymentMonitoringDeal[]) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(this.storageKey, JSON.stringify(deals));
    }
  }
}

function isMonitoringDealArray(value: unknown): value is PaymentMonitoringDeal[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const deal = item as Partial<PaymentMonitoringDeal>;
    return typeof deal.id === "string"
      && typeof deal.invoiceNumber === "string"
      && typeof deal.buyerName === "string"
      && typeof deal.invoiceAmount === "number"
      && typeof deal.amountPaidByBuyer === "number"
      && Array.isArray(deal.events);
  });
}
