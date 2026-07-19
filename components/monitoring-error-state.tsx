import { AlertTriangle, X } from "lucide-react";

export function MonitoringErrorState({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div role="alert" className="mb-5 flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950 sm:rounded-lg"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Контроль оплат восстановлен из demo-данных</p><p className="mt-1 text-xs leading-5">{message}</p></div><button type="button" onClick={onDismiss} aria-label="Закрыть сообщение" className="rounded p-1 hover:bg-amber-100"><X className="h-4 w-4" /></button></div>;
}
