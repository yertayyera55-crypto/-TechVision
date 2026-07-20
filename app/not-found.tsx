import Link from "next/link";
import { Logo } from "@/components/logo";
import { primaryLinkClass } from "@/components/ui/buttons";
export default function NotFound() { return <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center"><Logo /><p className="eyebrow mt-10">Ошибка 404</p><h1 className="mt-2 font-display text-5xl font-medium">Страница не найдена</h1><p className="mt-4 text-sm text-muted">Проверьте адрес или вернитесь в кабинет поставщика.</p><Link href="/" className={`${primaryLinkClass} mt-7`}>На главную</Link></main>; }
