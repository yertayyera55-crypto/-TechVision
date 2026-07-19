import { CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { DealEvent } from "@/lib/types";

export function DealEventTimeline({ events }: { events: DealEvent[] }) {
  const ordered = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return <section aria-labelledby="history-heading" className="border-t border-line pt-6"><p className="eyebrow mb-1">Audit trail</p><h2 id="history-heading" className="text-xl font-semibold">История действий</h2><ol className="mt-6">{ordered.map((event, index) => <li key={event.id} className="relative grid grid-cols-[28px_1fr] gap-3 pb-6 last:pb-0">{index < ordered.length - 1 && <span className="absolute left-[13px] top-6 h-[calc(100%-4px)] w-px bg-line" />}<span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-moss-50 text-moss-700 ring-1 ring-moss-100"><CheckCircle2 className="h-4 w-4" /></span><div><div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm font-semibold text-ink">{event.title}</p><time className="text-xs text-slate-400">{formatDateTime(event.timestamp)}</time></div><p className="mt-1 text-xs leading-5 text-slate-500">{event.description}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-moss-700">Источник: {event.source}</p></div></li>)}</ol></section>;
}
