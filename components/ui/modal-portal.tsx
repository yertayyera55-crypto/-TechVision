"use client";

import { createPortal } from "react-dom";

/**
 * Выносит модальный слой в document.body. Это не даёт transform-анимациям
 * родительских страниц превращать position: fixed в позиционирование по странице.
 */
export function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
