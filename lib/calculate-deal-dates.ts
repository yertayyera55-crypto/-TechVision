export function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  const day = 86_400_000;
  return Math.ceil((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / day);
}

export function getDealDateMessage(paymentDueDate: string, regressionDate: string, today: string) {
  const untilPayment = daysBetween(today, paymentDueDate);
  const untilRegression = daysBetween(today, regressionDate);
  if (untilPayment > 0) return `Следующее важное событие: оплата покупателем через ${untilPayment} ${dayWord(untilPayment)}.`;
  if (untilRegression > 0) return `Покупатель просрочил оплату. До окончания льготного периода осталось ${untilRegression} ${dayWord(untilRegression)}.`;
  return `Льготный период завершён ${Math.abs(untilRegression)} ${dayWord(Math.abs(untilRegression))} назад.`;
}

function dayWord(value: number) {
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "дней";
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дня";
  return "дней";
}
