import os

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")
STORAGE_KEY = "flowfactor-payment-monitoring-v4"


def run() -> None:
    """Проверяет read-only раздел «Сроки оплаты» и recovery localStorage."""
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)

        page.goto(BASE_URL)
        page.evaluate("key => localStorage.removeItem(key)", STORAGE_KEY)
        page.goto(f"{BASE_URL}/payments-monitoring")
        page.wait_for_load_state("networkidle")

        expect(page.get_by_role("heading", name="Сроки оплаты", exact=True)).to_be_visible()
        expect(page.locator("tbody tr")).to_have_count(1)
        expect(page.get_by_text("Покупатель перечисляет оплату FlowFactor", exact=False)).to_be_visible()
        expect(page.get_by_text("Ожидается оплата покупателя", exact=True).first).to_be_visible()
        expect(page.get_by_role("button", name="Зафиксировать оплату", exact=True)).to_have_count(0)
        expect(page.get_by_role("button", name="Отметить полную оплату", exact=True)).to_have_count(0)

        page.get_by_role("link", name="Открыть сделку №125", exact=True).click()
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", name="ТОО «Aspan Market»", exact=True)).to_be_visible()
        expect(page.get_by_role("heading", name="Кто и кому платит", exact=True)).to_be_visible()
        expect(page.get_by_text("Оплата поступает FlowFactor", exact=True)).to_be_visible()
        expect(page.get_by_role("button", name="Зафиксировать оплату", exact=True)).to_have_count(0)
        expect(page.get_by_role("button", name="Отметить полную оплату", exact=True)).to_have_count(0)

        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(f"{BASE_URL}/payments-monitoring")
        page.wait_for_load_state("networkidle")
        expect(page.locator("article")).to_have_count(1)
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")

        # Повреждённый cache не ломает read-only реестр.
        page.evaluate("key => localStorage.setItem(key, '{broken-json')", STORAGE_KEY)
        page.reload()
        page.wait_for_load_state("networkidle")
        recovery_alert = page.get_by_role("alert").filter(has_text="Сохранённые данные повреждены")
        expect(recovery_alert).to_contain_text("Показаны исходные demo-сделки")
        expect(page.locator("article")).to_have_count(1)
        browser.close()


if __name__ == "__main__":
    run()
    print("FlowFactor payment monitoring: OK")
