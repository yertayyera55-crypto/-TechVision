import os

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")


def run() -> None:
    """Проверяет FlowFactor: договор → демопредложение → активная сделка."""
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: errors.append(f"page error: {error}"))

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        expect(page.get_by_text("Учебный MVP", exact=True).first).to_be_visible()
        expect(page.get_by_role("link", name="Сроки оплаты", exact=True)).to_be_visible()

        # Одна синтетическая активная сделка показывает, кто кому платит.
        page.get_by_role("link", name="Сроки оплаты", exact=True).click()
        expect(page.get_by_role("heading", name="Сроки оплаты", exact=True)).to_be_visible()
        expect(page.get_by_text("ТОО «Aspan Market»", exact=True).first).to_be_visible()
        expect(page.get_by_role("link", name="Открыть сделку №125", exact=True).get_by_text("Получено от FlowFactor", exact=False)).to_be_visible()
        expect(page.get_by_role("button", name="Зафиксировать оплату", exact=True)).to_have_count(0)
        expect(page.get_by_role("button", name="Отметить полную оплату", exact=True)).to_have_count(0)

        # Создание новой заявки: документ → ручная проверка → предложение → принятие.
        page.goto(f"{BASE_URL}/applications/new")
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="Взять демодоговор", exact=True).click()
        expect(page.get_by_text("demo-contract.pdf", exact=True)).to_be_visible()
        page.get_by_role("button", name="Проверить данные", exact=True).click()
        page.locator("#network").fill("ТОО «Aspan Market»")
        page.locator("#amount").fill("10000000")
        page.locator("#invoiceNumber").fill("AT-SMOKE-001")
        page.get_by_role("button", name="Перейти к отправке", exact=True).click()
        page.get_by_role("button", name="Отправить заявку", exact=True).click()
        expect(page.get_by_role("heading", name="Предварительная заявка создана", exact=True)).to_be_visible()
        expect(page.get_by_text("Покупателю ничего отправлять не нужно.", exact=False)).to_be_visible()
        page.get_by_role("link", name="Перейти к заявке", exact=False).click()
        expect(page.get_by_role("heading", name="Предварительное демонстрационное предложение", exact=True)).to_be_visible()
        expect(page.get_by_text("9 200 000 ₸", exact=True)).to_be_visible()
        page.get_by_role("button", name="Принять демопредложение", exact=True).click()
        expect(page.get_by_role("heading", name="Демонстрационное финансирование оформлено", exact=True)).to_be_visible()
        page.get_by_role("link", name="Перейти в «Сроки оплаты»", exact=True).click()
        expect(page.get_by_role("heading", name="ТОО «Aspan Market»", exact=True)).to_be_visible()
        expect(page.get_by_role("heading", name="Кто и кому платит", exact=True)).to_be_visible()
        expect(page.get_by_role("button", name="Зафиксировать оплату", exact=True)).to_have_count(0)

        mobile = browser.new_page(viewport={"width": 375, "height": 812})
        mobile.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        mobile.on("pageerror", lambda error: errors.append(f"mobile page error: {error}"))
        mobile.goto(f"{BASE_URL}/payments-monitoring")
        mobile.wait_for_load_state("networkidle")
        expect(mobile.get_by_label("Создать новую заявку", exact=True)).to_be_visible()
        assert mobile.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        expect(mobile.get_by_role("button", name="Зафиксировать оплату", exact=True)).to_have_count(0)
        browser.close()

    if errors:
        raise AssertionError("Browser console errors:\n" + "\n".join(errors))


if __name__ == "__main__":
    run()
    print("FlowFactor main scenario: OK")
