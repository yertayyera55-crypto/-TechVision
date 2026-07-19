import { Info } from "lucide-react";

export function DemoIntegrationNotice({ children }: { children: React.ReactNode }) {
  return <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0 text-moss-700" />{children}</p>;
}
