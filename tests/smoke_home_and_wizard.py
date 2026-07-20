import os

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")


def assert_modal_in_viewport(page, dialog) -> None:
    """Регрессия: transform у длинной страницы не должен уводить fixed-modal вниз."""
    box = dialog.bounding_box()
    viewport = page.viewport_size
    assert box is not None and viewport is not None
    assert box["y"] >= 0
    assert box["y"] + box["height"] <= viewport["height"]
    assert dialog.evaluate("element => element.parentElement?.parentElement === document.body")


def run() -> None:
    """Проверяет полный P0-путь на чистых demo-данных."""
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

        # Поставщик находит поставку и отправляет demo-напоминание.
        page.get_by_role("link", name="Найти мои поставки", exact=True).click()
        delivery = page.locator("article").filter(has_text="2 000 000 ₸")
        expect(delivery.get_by_role("heading", name="Green Market", exact=True)).to_be_visible()
        delivery.get_by_role("link", name="Выбрать поставку", exact=True).click()
        page.get_by_role("button", name="Отправить напоминание", exact=True).click()
        expect(page.get_by_text("Отправлено напоминаний: 1", exact=True)).to_be_visible()

        # Покупатель подтверждает факт поставки; повторный ответ блокируется.
        page.goto(f"{BASE_URL}/confirm/supply-125")
        page.get_by_role("button", name="Подтвердить поставку", exact=True).click()
        expect(page.get_by_role("heading", name="Поставка подтверждена", exact=True)).to_be_visible()
        page.reload()
        expect(page.get_by_text("Ответ уже зафиксирован. Повторное подтверждение по этой ссылке заблокировано.", exact=True)).to_be_visible()

        # Готовность, прибыльность, регресс, согласие и demo-ЭЦП.
        page.goto(f"{BASE_URL}/applications/125")
        expect(page.get_by_text("Готовность заявки: 85%", exact=True)).to_be_visible()
        page.get_by_role("button", name="Рассчитать прибыльность", exact=True).click()
        expect(page.get_by_text("260 000 ₸", exact=True)).to_be_visible()
        expect(page.get_by_text("179 822 ₸", exact=True)).to_be_visible()
        expect(page.get_by_text("Маржинальность снизится с 13% до 8,99%.", exact=True)).to_be_visible()

        sign = page.get_by_role("button", name="Подписать через demo-ЭЦП", exact=True)
        expect(sign).to_be_disabled()
        page.get_by_role(
            "checkbox",
            name="Я понимаю, что при факторинге с регрессом мне может потребоваться вернуть полученное финансирование.",
            exact=True,
        ).check()
        expect(sign).to_be_enabled()
        sign.click()
        expect(page.get_by_text("Demo-подпись добавлена", exact=True)).to_be_visible()

        page.get_by_role("button", name="Передать заявку партнёру", exact=True).click()
        transfer_dialog = page.get_by_role("dialog", name="Подтвердите согласие", exact=True)
        assert_modal_in_viewport(page, transfer_dialog)
        transfer_dialog.get_by_role(
            "checkbox",
            name="Я согласен на передачу данных для рассмотрения заявки.",
            exact=True,
        ).check()
        transfer_dialog.get_by_role("button", name="Подтвердить и передать", exact=True).click()
        expect(page.get_by_role("heading", name="Заявка передана финансовому партнёру", exact=True)).to_be_visible()
        page.get_by_role("link", name="Перейти в «Контроль сделки»", exact=True).click()
        expect(page.get_by_role("heading", name="Green Market", exact=True)).to_be_visible()
        expect(page.get_by_text("Оплата покупателем через 21 день.", exact=True)).to_be_visible()

        # Частичная оплата уменьшает долг и потенциальный регресс.
        page.get_by_role("button", name="Зафиксировать оплату", exact=True).click()
        payment_dialog = page.get_by_role("dialog", name="Зафиксировать оплату покупателя", exact=True)
        assert_modal_in_viewport(page, payment_dialog)
        payment_dialog.get_by_role("spinbutton", name="Сумма оплаты", exact=True).fill("500000")
        payment_dialog.get_by_role("textbox", name="Комментарий", exact=True).fill("Demo-частичная оплата")
        payment_dialog.get_by_role("button", name="Зафиксировать оплату", exact=True).click()
        metrics = page.get_by_role("region", name="Параметры сделки", exact=True)
        expect(metrics.get_by_text("500 000 ₸", exact=True)).to_be_visible()
        expect(metrics.get_by_text("1 500 000 ₸", exact=True)).to_be_visible()
        recourse = page.get_by_role("region", name="Контроль возможного регресса", exact=True)
        expect(recourse.get_by_text("1 300 000 ₸", exact=True)).to_be_visible()
        expect(page.get_by_text("Частичная оплата получена", exact=True)).to_be_visible()

        # Полная оплата закрывает сделку; localStorage переживает reload.
        page.once("dialog", lambda dialog: dialog.accept())
        page.get_by_role("button", name="Отметить полную оплату", exact=True).click()
        expect(page.get_by_role("heading", name="Покупатель полностью оплатил задолженность", exact=True)).to_be_visible()
        expect(page.get_by_text("Сделка закрыта", exact=True).first).to_be_visible()
        page.reload()
        expect(page.get_by_role("heading", name="Покупатель полностью оплатил задолженность", exact=True)).to_be_visible()

        # Сброс защищён отдельным подтверждением и не выполняется в smoke-тесте.
        page.goto(f"{BASE_URL}/settings")
        page.once("dialog", lambda dialog: dialog.dismiss())
        page.get_by_role("button", name="Восстановить", exact=True).click()

        mobile = browser.new_page(viewport={"width": 375, "height": 812})
        mobile.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        mobile.on("pageerror", lambda error: errors.append(f"mobile page error: {error}"))
        mobile.goto(BASE_URL)
        mobile.wait_for_load_state("networkidle")
        expect(mobile.get_by_label("Создать новую заявку", exact=True)).to_be_visible()
        page_width = mobile.evaluate("document.documentElement.scrollWidth")
        viewport_width = mobile.evaluate("document.documentElement.clientWidth")
        assert page_width == viewport_width, f"Horizontal overflow: {page_width}px > {viewport_width}px"
        mobile.screenshot(path="/tmp/mighty-miners-mobile.png", full_page=True)
        browser.close()

    if errors:
        raise AssertionError("Browser console errors:\n" + "\n".join(errors))


if __name__ == "__main__":
    run()
    print("Mighty Miners P0 smoke test: OK")
