import Link from "next/link";
import { Bell, ChevronDown, Plus } from "lucide-react";
import { Logo } from "@/components/logo";
import { primaryLinkClass } from "@/components/ui/buttons";

export function TopHeader({ title = "Здравствуйте, Tea Local!", subtitle = "Ваши поставки. Ваши деньги раньше.", showNew = true }: { title?: string; subtitle?: string; showNew?: boolean }) {
  return (
    <header className="mb-8 animate-rise">
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <Logo />
        <Link href="/notifications" aria-label="Открыть уведомления" className="relative rounded-lg border border-line bg-paper p-2.5 text-slate-600 transition hover:text-moss-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-moss-600 ring-2 ring-paper" />
        </Link>
      </div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Кабинет поставщика</p>
          <h1 className="font-display text-[clamp(2rem,4vw,3.3rem)] font-medium leading-[1.05] tracking-[-0.035em] text-ink">{title}</h1>
          <p className="mt-2 text-sm text-muted md:text-base">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 sm:pt-1">
          <Link href="/notifications" aria-label="Открыть уведомления" className="relative hidden rounded-lg border border-line bg-paper p-3 text-slate-600 transition hover:border-moss-200 hover:text-moss-700 lg:block">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-moss-600 ring-2 ring-paper" />
          </Link>
          <Link href="/profile" className="hidden min-h-12 items-center gap-3 rounded-lg border border-line bg-paper px-3 transition hover:border-moss-200 md:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-moss-50 text-xs font-bold text-moss-700 ring-1 ring-moss-100">TL</span>
            <span className="text-left"><span className="block text-xs font-semibold text-ink">Tea Local LLP</span><span className="block text-[10px] text-muted">Компания</span></span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </Link>
          {showNew && <Link href="/applications/new" className={`${primaryLinkClass} min-h-12 whitespace-nowrap`}><Plus className="h-[18px] w-[18px]" /> Новая заявка</Link>}
        </div>
      </div>
    </header>
  );
}
