import { DealEvent } from "@/lib/types";

export function createDemoEvents(deliveryId: string): DealEvent[] {
  return [
    { id: `${deliveryId}-created`, type: "created", title: "Заявка создана", description: "Данные поставки и документы сохранены.", timestamp: "2026-07-18T10:30:00+06:00", source: "Поставщик" },
    { id: `${deliveryId}-received`, type: "contract_received", title: "Договор получен", description: "Поставщик загрузил договор для предварительной заявки.", timestamp: "2026-09-25T10:45:00+06:00", source: "Поставщик" },
    { id: `${deliveryId}-checked`, type: "document_review", title: "Договор проверен", description: "FlowFactor сформировал предварительное предложение без запроса покупателю.", timestamp: "2026-09-26T11:12:00+06:00", source: "FlowFactor" },
    { id: `${deliveryId}-calculated`, type: "calculated", title: "Демопредложение сформировано", description: "FlowFactor применил фиксированные правила демосценария.", timestamp: "2026-09-26T11:18:00+06:00", source: "FlowFactor" },
    { id: `${deliveryId}-signed`, type: "signed", title: "Согласие подписано", description: "Выполнено демонстрационное подписание.", timestamp: "2026-07-20T11:25:00+06:00", source: "Поставщик" },
    { id: `${deliveryId}-transferred`, type: "accepted", title: "Демопредложение принято", description: "Поставщик принял условия учебного сценария.", timestamp: "2026-09-27T11:30:00+06:00", source: "Поставщик" },
    { id: `${deliveryId}-financed`, type: "financed", title: "Демонстрационное финансирование оформлено", description: "По условиям демосценария средства перечислены.", timestamp: "2026-09-27T12:00:00+06:00", source: "FlowFactor" },
  ];
}
