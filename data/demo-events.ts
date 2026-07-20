import { DealEvent } from "@/lib/types";

export function createDemoEvents(deliveryId: string): DealEvent[] {
  return [
    { id: `${deliveryId}-created`, type: "created", title: "Заявка создана", description: "Данные поставки и документы сохранены.", timestamp: "2026-07-18T10:30:00+06:00", source: "Поставщик" },
    { id: `${deliveryId}-request`, type: "confirmation_request", title: "Запрос подтверждения отправлен", description: "Покупателю создана одноразовая ссылка.", timestamp: "2026-07-18T10:45:00+06:00", source: "Mighty Miners" },
    { id: `${deliveryId}-confirmed`, type: "confirmed", title: "Поставка подтверждена", description: "Покупатель подтвердил факт поставки.", timestamp: "2026-07-20T11:10:00+06:00", source: "Покупатель" },
    { id: `${deliveryId}-checked`, type: "checked", title: "Документы проверены", description: "Комплектность заявки подтверждена demo-проверкой.", timestamp: "2026-07-20T11:12:00+06:00", source: "Mighty Miners" },
    { id: `${deliveryId}-calculated`, type: "calculated", title: "Расчёт сформирован", description: "Поставщик проверил прибыльность и риск регресса.", timestamp: "2026-07-20T11:18:00+06:00", source: "Mighty Miners" },
    { id: `${deliveryId}-signed`, type: "signed", title: "Согласие подписано", description: "Выполнено демонстрационное подписание.", timestamp: "2026-07-20T11:25:00+06:00", source: "Поставщик" },
    { id: `${deliveryId}-transferred`, type: "transferred", title: "Заявка передана партнёру", description: "Пакет отправлен на рассмотрение.", timestamp: "2026-07-20T11:30:00+06:00", source: "Mighty Miners" },
    { id: `${deliveryId}-financed`, type: "financed", title: "Финансирование получено", description: "Demo-сумма финансирования зафиксирована.", timestamp: "2026-07-22T14:00:00+06:00", source: "Финансовый партнёр" },
  ];
}
