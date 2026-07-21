import { ProductCategory } from "@/lib/types";

export interface ProductCategoryConfig {
  id: ProductCategory;
  label: string;
  keywords: string[];
  requiredDocuments: string[];
  risks: string[];
  perishable: boolean;
}

export const PRODUCT_CATEGORIES: ProductCategoryConfig[] = [
  { id: "tea_coffee", label: "Чай и кофе", keywords: ["чай", "кофе", "кофейн"], requiredDocuments: ["Договор поставки", "Накладная или акт приёмки", "Декларация соответствия"], risks: ["Возвраты из-за срока годности", "Маркетинговые удержания сети"], perishable: false },
  { id: "meat_chilled", label: "Мясо и охлаждённые продукты", keywords: ["мяс", "охлажд", "колбас"], requiredDocuments: ["Договор поставки", "Накладная или акт приёмки", "Ветеринарные документы", "Температурный лист"], risks: ["Короткий срок годности", "Температурный режим", "Повышенный риск возврата"], perishable: true },
  { id: "dairy", label: "Молочная продукция", keywords: ["молоч", "сыр", "кефир", "йогурт"], requiredDocuments: ["Договор поставки", "Накладная или акт приёмки", "Декларация соответствия"], risks: ["Короткий срок годности", "Возвраты непроданного товара"], perishable: true },
  { id: "produce", label: "Овощи и фрукты", keywords: ["овощ", "фрукт", "яблок", "томат"], requiredDocuments: ["Договор поставки", "Накладная или акт приёмки", "Фитосанитарный документ при необходимости"], risks: ["Естественная убыль", "Корректировки количества при приёмке"], perishable: true },
  { id: "grocery", label: "Бакалея", keywords: ["бакале", "круп", "макарон", "мук", "сахар"], requiredDocuments: ["Договор поставки", "Накладная или акт приёмки", "Декларация соответствия"], risks: ["Ретро-бонусы и удержания сети"], perishable: false },
  { id: "frozen", label: "Замороженная продукция", keywords: ["заморож", "морожен"], requiredDocuments: ["Договор поставки", "Накладная или акт приёмки", "Температурный лист"], risks: ["Нарушение холодовой цепи", "Споры о качестве при приёмке"], perishable: true },
  { id: "confectionery", label: "Кондитерские изделия", keywords: ["кондитер", "печень", "конфет", "шоколад"], requiredDocuments: ["Договор поставки", "Накладная или акт приёмки", "Декларация соответствия"], risks: ["Сезонность", "Возвраты по сроку годности"], perishable: false },
  { id: "beverages", label: "Напитки", keywords: ["напит", "вода", "сок", "лимонад"], requiredDocuments: ["Договор поставки", "Накладная или акт приёмки", "Декларация соответствия"], risks: ["Удержания за промо и логистику"], perishable: false },
  { id: "other", label: "Другая категория", keywords: [], requiredDocuments: ["Договор поставки", "Накладная или акт приёмки"], risks: ["Нужно уточнить отраслевые документы"], perishable: false },
];

export function getCategoryConfig(id: ProductCategory) {
  return PRODUCT_CATEGORIES.find((category) => category.id === id) ?? PRODUCT_CATEGORIES[PRODUCT_CATEGORIES.length - 1];
}
