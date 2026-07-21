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
        expect(page.get_by_role("heading", name="Начните работу с FlowFactor", exact=True)).to_be_visible()
        page.locator("#auth-company").fill("ТОО «Smoke Supplier»")
        page.locator("#auth-contact").fill("Тестовый пользователь")
        page.locator("#auth-email").fill("smoke@example.kz")
        page.get_by_role("button", name="Создать кабинет", exact=True).click()
        expect(page.get_by_role("heading", name="Здравствуйте, ТОО «Smoke Supplier»!", exact=True)).to_be_visible()

        expect(page.get_by_text("Учебный MVP", exact=True).first).to_be_visible()
        expect(page.get_by_role("link", name="Сроки оплаты", exact=True)).to_be_visible()

        # Одна синтетическая активная сделка показывает, кто кому платит.
        page.get_by_role("link", name="Сроки оплаты", exact=True).click()
        expect(page.get_by_role("heading", name="Сроки оплаты", exact=True)).to_be_visible()
        expect(page.get_by_text("ТОО «Aspan Market»", exact=True).first).to_be_visible()
        expect(page.get_by_role("link", name="Открыть сделку №125", exact=True).get_by_text("Получено от FlowFactor", exact=False)).to_be_visible()
        expect(page.get_by_role("button", name="Зафиксировать оплату", exact=True)).to_have_count(0)
        expect(page.get_by_role("button", name="Отметить полную оплату", exact=True)).to_have_count(0)

        # Создание новой заявки: договор → анкета FlowFactor → предложение → принятие.
        page.goto(f"{BASE_URL}/applications/new")
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="Взять демодоговор", exact=True).click()
        expect(page.get_by_text("demo-contract.pdf", exact=True)).to_be_visible()
        page.get_by_role("button", name="Перейти к анкете", exact=True).click()
        expect(page.get_by_role("heading", name="Анкета FlowFactor", exact=True)).to_be_visible()
        expect(page.get_by_text("Из профиля", exact=True).first).to_be_visible()
        expect(page.get_by_text("Нужно заполнить", exact=True).first).to_be_visible()
        page.locator("#network").fill("ТОО «Aspan Market»")
        page.locator("#contractNumber").fill("FF-AT-2026/01")
        page.locator("#supplySubject").fill("Чай в потребительской упаковке")
        page.locator("#amount").fill("10000000")
        page.locator("#invoiceNumber").fill("AT-SMOKE-001")
        page.locator("#deliveryDate").fill("2026-09-25")
        page.locator("#paymentDate").fill("2026-11-24")
        page.locator("#paymentTermDays").fill("60")
        page.locator("#paymentTerms").fill("Оплата в течение 60 дней после поставки")
        with page.expect_download() as questionnaire_download:
            page.get_by_role("button", name="Скачать анкету", exact=True).click()
        assert questionnaire_download.value.suggested_filename == "Анкета_FlowFactor.doc"
        page.get_by_role("button", name="Подтвердить и отправить в FlowFactor", exact=True).click()
        expect(page.get_by_role("heading", name="Анкета отправлена в FlowFactor", exact=True)).to_be_visible()
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
        mobile.get_by_role("button", name="Продолжить с демо-профилем", exact=True).click()
        expect(mobile.get_by_label("Создать новую заявку", exact=True)).to_be_visible()
        assert mobile.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        expect(mobile.get_by_role("button", name="Зафиксировать оплату", exact=True)).to_have_count(0)
        browser.close()

    if errors:
        raise AssertionError("Browser console errors:\n" + "\n".join(errors))


if __name__ == "__main__":
    run()
    print("FlowFactor main scenario: OK")
