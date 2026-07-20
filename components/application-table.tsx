import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Application } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";

export function ApplicationTable({ applications }: { applications: Application[] }) {
  return (
    <>
      <div className="hidden overflow-hidden border-y border-line bg-paper md:block md:rounded-lg md:border">
        <table className="w-full border-collapse text-left">
          <thead><tr className="border-b border-line bg-[#fbfaf6] text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
            <th className="px-4 py-3.5">№ заявки</th><th className="px-4 py-3.5">Торговая сеть</th><th className="px-4 py-3.5">Сумма поставки</th><th className="px-4 py-3.5">Оплата по договору</th><th className="px-4 py-3.5">Статус</th><th className="px-4 py-3.5">Осталось</th><th className="w-12" />
          </tr></thead>
          <tbody>{applications.map((application) => <ApplicationRow key={application.id} application={application} />)}</tbody>
        </table>
      </div>
      <div className="divide-y divide-line border-y border-line bg-paper md:hidden">
        {applications.map((application) => <ApplicationCard key={application.id} application={application} />)}
      </div>
    </>
  );
}

function ApplicationRow({ application }: { application: Application }) {
  return (
    <tr className="group border-b border-line text-sm transition last:border-0 hover:bg-moss-50/60">
      <td className="p-0"><Link className="block px-4 py-4 font-semibold text-ink" href={`/applications/${application.id}`}>№{application.id}</Link></td>
      <td className="p-0"><Link className="block px-4 py-4 text-slate-700" href={`/applications/${application.id}`}>{application.network}</Link></td>
      <td className="p-0"><Link className="block px-4 py-4 font-medium text-ink" href={`/applications/${application.id}`}>{formatCurrency(application.amount)}</Link></td>
      <td className="p-0"><Link className="block px-4 py-4 text-slate-600" href={`/applications/${application.id}`}>{formatDate(application.paymentDate)}<span className="mt-0.5 block text-xs text-slate-400">({application.termDays} дней)</span></Link></td>
      <td className="p-0"><Link className="block px-4 py-4" href={`/applications/${application.id}`}><StatusBadge status={application.status} /></Link></td>
      <td className="p-0"><Link className="block px-4 py-4 text-slate-700" href={`/applications/${application.id}`}>{application.remainingDays === null ? "—" : `${application.remainingDays} ${application.remainingDays === 1 ? "день" : "дней"}`}</Link></td>
      <td className="p-0"><Link className="flex px-3 py-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-moss-700" href={`/applications/${application.id}`} aria-label={`Открыть заявку №${application.id}`}><ChevronRight className="h-5 w-5" /></Link></td>
    </tr>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  return (
    <Link href={`/applications/${application.id}`} className="group block px-4 py-4 transition hover:bg-moss-50/60">
      <div className="mb-2 flex items-start justify-between gap-3"><span className="text-sm font-semibold">№{application.id}</span><StatusBadge status={application.status} /></div>
      <p className="text-xs text-slate-500">{application.network}</p>
      <div className="mt-3 flex items-end justify-between gap-3"><span className="text-base font-semibold">{formatCurrency(application.amount)}</span><span className="inline-flex items-center gap-1 text-xs text-slate-500">{application.remainingDays === null ? "Завершено" : `${application.remainingDays} дней`}<ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div>
    </Link>
  );
}
