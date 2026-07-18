import { Inbox } from "lucide-react";
import { ReactNode } from "react";

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border-y border-dashed border-line bg-paper px-5 py-12 text-center sm:rounded-lg sm:border">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-500"><Inbox className="h-6 w-6" /></span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
