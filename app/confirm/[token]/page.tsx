import Link from "next/link";
import { secondaryLinkClass } from "@/components/ui/buttons";

export default function ConfirmPage() {
  return <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-10"><section className="w-full border-y border-line bg-paper px-6 py-10 text-center shadow-soft sm:rounded-xl sm:border"><p className="eyebrow mb-2">FlowFactor</p><h1 className="font-display text-3xl font-medium tracking-tight text-ink">Подтверждение не требуется</h1><p className="mt-3 text-sm leading-6 text-muted">В текущем сценарии FlowFactor рассматривает договор внутри своего процесса. Покупателю не нужно подтверждать поставку по ссылке.</p><Link href="/" className={`${secondaryLinkClass} mt-7`}>На главную</Link></section></main>;
}
