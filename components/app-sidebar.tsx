"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleHelp, FileText, Home, LogOut, Settings, Truck, UserRound, Workflow } from "lucide-react";
import { Logo } from "@/components/logo";

const navigation = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/deliveries", label: "Поставки", icon: Truck },
  { href: "/applications", label: "Мои заявки", icon: Workflow },
  { href: "/documents", label: "Документы", icon: FileText },
  { href: "/notifications", label: "Уведомления", icon: Bell },
  { href: "/profile", label: "Профиль", icon: UserRound },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-paper/95 px-5 py-7 backdrop-blur-sm lg:flex">
      <div className="px-2"><Logo /></div>
      <nav aria-label="Основная навигация" className="mt-10 flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${active ? "bg-moss-50 text-moss-800 ring-1 ring-inset ring-moss-100" : "text-slate-600 hover:bg-slate-50 hover:text-ink"}`}
            >
              <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-line pt-4">
        <a href="mailto:support@mightyminers.kz" className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-xs font-medium text-moss-700 transition hover:bg-moss-50">
          <CircleHelp aria-hidden="true" className="h-4 w-4" /> Связаться с поддержкой
        </a>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("mm-toast", { detail: "В demo-режиме авторизация не требуется" }))}
          className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-ink"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" /> Выйти
        </button>
      </div>
    </aside>
  );
}
