export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₸`;
}

export function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function calculateDays(start: string, end: string) {
  if (!start || !end) return 0;
  const day = 86_400_000;
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / day));
}
