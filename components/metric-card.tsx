import { CalendarDays, Clock3, CreditCard, LucideIcon, WalletCards } from "lucide-react";

const icons: Record<string, LucideIcon> = { clock: Clock3, wallet: WalletCards, calendar: CalendarDays, card: CreditCard };
const iconStyles: Record<string, string> = {
  clock: "bg-amber-50 text-amber-700 ring-amber-100",
  wallet: "bg-moss-50 text-moss-700 ring-moss-100",
  calendar: "bg-moss-50 text-moss-700 ring-moss-100",
  card: "bg-blue-50 text-blue-700 ring-blue-100",
};

export function MetricCard({ label, value, icon, delay = 0 }: { label: string; value: string; icon: string; delay?: number }) {
  const Icon = icons[icon];
  return (
    <article className="animate-rise border-t border-line py-5 md:border md:bg-paper md:p-5 md:shadow-soft" style={{ animationDelay: `${delay}ms` }}>
      <div className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ${iconStyles[icon]}`}><Icon aria-hidden="true" className="h-5 w-5" /></div>
      <p className="min-h-10 text-sm leading-5 text-slate-600">{label}</p>
      <p className="mt-1 text-[1.55rem] font-semibold tracking-tight text-ink">{value}</p>
    </article>
  );
}
