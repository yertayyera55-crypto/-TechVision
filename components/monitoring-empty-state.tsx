import { EmptyState } from "@/components/ui/empty-state";
import { secondaryLinkClass } from "@/components/ui/buttons";

export function MonitoringEmptyState({ onReset }: { onReset: () => void }) {
  return <EmptyState title="Сделки не найдены" text="Измените поиск, фильтр или сортировку реестра." action={<button type="button" className={secondaryLinkClass} onClick={onReset}>Сбросить фильтры</button>} />;
}
