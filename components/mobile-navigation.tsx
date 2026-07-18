"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, Plus, UserRound, Workflow } from "lucide-react";

const items = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/applications", label: "Заявки", icon: Workflow },
  { href: "/documents", label: "Документы", icon: FileText },
  { href: "/profile", label: "Профиль", icon: UserRound },
];

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Мобильная навигация" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(24,32,43,0.06)] backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-5 items-end">
        {items.slice(0, 2).map((item) => <MobileItem key={item.href} {...item} active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)} />)}
        <Link href="/applications/new" aria-label="Создать новую заявку" className="mx-auto -mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-canvas bg-moss-700 text-white shadow-lift transition hover:bg-moss-800 active:scale-95">
          <Plus aria-hidden="true" className="h-7 w-7" />
        </Link>
        {items.slice(2).map((item) => <MobileItem key={item.href} {...item} active={pathname.startsWith(item.href)} />)}
      </div>
    </nav>
  );
}

function MobileItem({ href, label, icon: Icon, active }: (typeof items)[number] & { active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${active ? "text-moss-700" : "text-slate-500"}`}>
      <Icon aria-hidden="true" className="h-5 w-5" /> {label}
    </Link>
  );
}
