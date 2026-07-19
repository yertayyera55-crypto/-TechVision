import os

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")
STORAGE_KEY = "mighty-miners-payment-monitoring-v1"


def run() -> None:
    """Проверяет реестр, оплаты, persistence, fallback и мобильную геометрию."""
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)

        page.goto(BASE_URL)
        page.evaluate("key => localStorage.removeItem(key)", STORAGE_KEY)
        page.goto(f"{BASE_URL}/payments-monitoring")
        page.wait_for_load_state("networkidle")

        expect(page.get_by_role("heading", name="Контроль оплат", exact=True)).to_be_visible()
        expect(page.locator("tbody tr")).to_have_count(8)

        page.get_by_role("button", name="Требуют внимания", exact=True).click()
        expect(page.locator("tbody tr")).to_have_count(5)

        page.get_by_role("button", name="Просрочено", exact=True).click()
        expect(page.locator("tbody tr")).to_have_count(2)
        page.get_by_role("link", name="Открыть сделку №205", exact=True).click()
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", name="Anvar", exact=True)).to_be_visible()
        expect(page.get_by_text("21.09.2026", exact=True).first).to_be_visible()
        expect(page.get_by_text("05.10.2026", exact=True).first).to_be_visible()

        page.get_by_role("button", name="Отправить напоминание", exact=True).click()
        expect(page.get_by_text("Демонстрационное напоминание отправлено покупателю", exact=True)).to_be_visible()
        expect(page.get_by_text("Напоминание покупателю", exact=True)).to_be_visible()

        page.get_by_role("button", name="Зафиксировать оплату", exact=True).click()
        payment_dialog = page.get_by_role("dialog", name="Зафиксировать оплату покупателя", exact=True)
        expect(payment_dialog).to_be_visible()
        payment_dialog.get_by_role("spinbutton", name="Сумма оплаты", exact=True).fill("500000")
        payment_dialog.get_by_role("textbox", name="Комментарий", exact=True).fill("Проверка smoke-сценария")
        payment_dialog.get_by_role("button", name="Зафиксировать оплату", exact=True).click()
        expect(page.get_by_text("1 500 000 ₸", exact=True).first).to_be_visible()
        expect(page.get_by_text("1 300 000 ₸", exact=True).first).to_be_visible()

        page.reload()
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("1 500 000 ₸", exact=True).first).to_be_visible()
        expect(page.get_by_text("1 300 000 ₸", exact=True).first).to_be_visible()
        expect(page.get_by_text("Частичная оплата получена", exact=True)).to_be_visible()

        page.once("dialog", lambda dialog: dialog.accept())
        page.get_by_role("button", name="Отметить полную оплату", exact=True).click()
        expect(page.get_by_text("Покупатель полностью оплатил задолженность", exact=True)).to_be_visible()
        expect(page.get_by_text("Отсутствует", exact=True).first).to_be_visible()

        page.get_by_role("link", name="К контролю оплат", exact=True).click()
        page.get_by_role("button", name="Требуют внимания", exact=True).click()
        expect(page.get_by_role("link", name="Открыть сделку №205", exact=True)).to_have_count(0)
        page.get_by_role("button", name="Закрытые сделки", exact=True).click()
        expect(page.get_by_role("link", name="Открыть сделку №205", exact=True)).to_be_visible()

        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(f"{BASE_URL}/payments-monitoring")
        page.wait_for_load_state("networkidle")
        expect(page.locator("article")).to_have_count(8)
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        page.locator("article").filter(has_text="Сделка №203").click()
        page.get_by_role("button", name="Зафиксировать оплату", exact=True).click()
        mobile_dialog = page.get_by_role("dialog", name="Зафиксировать оплату покупателя", exact=True)
        box = mobile_dialog.bounding_box()
        assert box is not None
        assert box["y"] >= 0 and box["y"] + box["height"] <= 812
        assert mobile_dialog.evaluate("element => element.parentElement?.parentElement === document.body")
        page.keyboard.press("Escape")
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")

        assert not errors, f"Browser console errors before recovery test: {errors}"
        errors.clear()
        page.evaluate("key => localStorage.setItem(key, '{broken-json')", STORAGE_KEY)
        page.reload()
        page.wait_for_load_state("networkidle")
        page.goto(f"{BASE_URL}/payments-monitoring")
        recovery_alert = page.get_by_role("alert").filter(has_text="Контроль оплат восстановлен из demo-данных")
        expect(recovery_alert).to_contain_text("Показаны исходные demo-сделки")
        expect(page.locator("article")).to_have_count(8)

        page.once("dialog", lambda dialog: dialog.accept())
        page.get_by_role("button", name="Сбросить demo-данные", exact=True).click()
        expect(page.get_by_text("Demo-данные контроля оплат восстановлены", exact=True)).to_be_visible()

        assert errors and all("Не удалось загрузить контроль оплат" in error for error in errors), errors
        browser.close()


if __name__ == "__main__":
    run()
    print("Payments monitoring smoke scenario passed")
