import { DEMO_MONITORING_TODAY } from "@/data/demo-monitoring-rules";
import { recalculatePaymentMonitoringDeal } from "@/lib/calculate-payment-monitoring";
import { PaymentEvent, PaymentMonitoringDeal } from "@/lib/types";

export interface MonitoringPaymentInput {
  amount: number;
  date: string;
  comment: string;
}

export function recordDealPayment(
  deal: PaymentMonitoringDeal,
  payment: MonitoringPaymentInput,
  full = false,
): PaymentMonitoringDeal {
  if (deal.paymentStatus === "closed") throw new Error("Нельзя повторно закрыть оплаченную сделку.");
  if (!Number.isFinite(payment.amount) || payment.amount <= 0) throw new Error("Сумма оплаты должна быть больше нуля.");
  if (!payment.date) throw new Error("Дата оплаты обязательна.");

  const amount = full ? deal.outstandingAmount : payment.amount;
  if (amount > deal.outstandingAmount) throw new Error("Сумма оплаты превышает остаток задолженности.");
  const amountPaidByBuyer = Math.min(deal.invoiceAmount, deal.amountPaidByBuyer + amount);
  const closed = amountPaidByBuyer === deal.invoiceAmount;
  const event = createPaymentEvent(deal, amount, payment, closed);
  const changed: PaymentMonitoringDeal = {
    ...deal,
    amountPaidByBuyer,
    lastPaymentDate: payment.date,
    closedAt: closed ? payment.date : null,
    events: [...deal.events, event],
  };
  return appendRiskChangeEvent(deal, recalculatePaymentMonitoringDeal(changed), payment.date);
}

export function recordDealReminder(
  deal: PaymentMonitoringDeal,
  timestamp = `${DEMO_MONITORING_TODAY}T12:00:00+06:00`,
): PaymentMonitoringDeal {
  if (deal.paymentStatus === "closed") throw new Error("Закрытой сделке напоминание не требуется.");
  const event: PaymentEvent = {
    id: `${deal.id}-reminder-${Date.now()}`,
    dealId: deal.id,
    type: "payment_reminder",
    title: "Напоминание покупателю",
    description: "Создано демонстрационное напоминание об оплате. Во внешние сервисы оно не отправлялось.",
    timestamp,
    source: "Mighty Miners",
  };
  return {
    ...deal,
    reminderCount: deal.reminderCount + 1,
    lastReminderAt: timestamp,
    events: [...deal.events, event],
  };
}

export function changeDealGracePeriod(
  deal: PaymentMonitoringDeal,
  gracePeriodDays: number,
): PaymentMonitoringDeal {
  if (!Number.isInteger(gracePeriodDays) || gracePeriodDays < 0 || gracePeriodDays > 365) {
    throw new Error("Grace period должен быть целым числом от 0 до 365.");
  }
  const event: PaymentEvent = {
    id: `${deal.id}-grace-${Date.now()}`,
    dealId: deal.id,
    type: "grace_period_changed",
    title: "Grace period обновлён",
    description: `Льготный период установлен: ${gracePeriodDays} дней.`,
    timestamp: `${DEMO_MONITORING_TODAY}T12:00:00+06:00`,
    source: "Поставщик",
  };
  const recalculated = recalculatePaymentMonitoringDeal({
    ...deal,
    gracePeriodDays,
    events: [...deal.events, event],
  });
  return appendRiskChangeEvent(deal, recalculated, DEMO_MONITORING_TODAY);
}

function createPaymentEvent(
  deal: PaymentMonitoringDeal,
  amount: number,
  payment: MonitoringPaymentInput,
  closed: boolean,
): PaymentEvent {
  return {
    id: `${deal.id}-${closed ? "closed" : "payment"}-${Date.now()}`,
    dealId: deal.id,
    type: closed ? "closed" : "partial_payment",
    title: closed ? "Сделка полностью оплачена и закрыта" : "Частичная оплата получена",
    description: closed
      ? "Покупатель полностью погасил задолженность. Контроль и напоминания завершены."
      : `Покупатель внёс частичную оплату.${payment.comment ? ` ${payment.comment}` : ""}`,
    amount,
    timestamp: `${payment.date}T12:00:00+06:00`,
    source: "Поставщик",
  };
}

function appendRiskChangeEvent(
  previous: PaymentMonitoringDeal,
  next: PaymentMonitoringDeal,
  date: string,
) {
  if (previous.riskLevel === next.riskLevel) return next;
  const riskEvent: PaymentEvent = {
    id: `${next.id}-risk-${Date.now()}`,
    dealId: next.id,
    type: "risk_changed",
    title: "Уровень риска изменён",
    description: `Автоматический расчёт: «${riskLabel(previous.riskLevel)}» → «${riskLabel(next.riskLevel)}».`,
    timestamp: `${date}T12:01:00+06:00`,
    source: "Mighty Miners",
  };
  return { ...next, events: [...next.events, riskEvent] };
}

function riskLabel(level: PaymentMonitoringDeal["riskLevel"]) {
  return {
    none: "Отсутствует",
    low: "Низкий",
    medium: "Средний",
    elevated: "Повышенный",
    high: "Высокий",
    critical: "Критический",
    review: "Требуется проверка",
  }[level];
}
