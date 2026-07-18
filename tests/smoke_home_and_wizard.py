import os
from pathlib import Path
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:3000"
REFERENCE_FILE = Path("/Users/adilindira/Downloads/ChatGPT Image 18 июл. 2026 г., 23_35_18.png")


def run() -> None:
    errors: list[str] = []
    with sync_playwright() as playwright:
        launch_options = {"headless": True}
        chrome_path = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH")
        if chrome_path:
            launch_options["executable_path"] = chrome_path
        browser = playwright.chromium.launch(**launch_options)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: errors.append(f"page error: {error}"))
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        page.get_by_role("heading", name="Здравствуйте, Tea Local!").wait_for()
        assert page.get_by_text("5 800 000 ₸").is_visible()
        assert page.get_by_role("link", name="Открыть заявку №125").is_visible()
        page.wait_for_timeout(800)
        page.screenshot(path="/tmp/mighty-miners-home.png", full_page=True)

        page.get_by_role("link", name="Новая заявка").last.click()
        page.get_by_label("Торговая сеть").select_option(label="Magnum Cash & Carry")
        page.get_by_label("Сумма поставки").fill("2000000")
        page.get_by_label("Номер накладной").fill("TEST-2026-01")
        page.get_by_role("button", name="Далее").click()
        page.get_by_text("Срок оплаты: 90 дней").wait_for()
        page.get_by_role("button", name="Далее").click()

        for document_type in ("invoice", "bill", "contract"):
            page.locator(f"#file-{document_type}").set_input_files(str(REFERENCE_FILE))
        page.get_by_role("button", name="Далее").click()
        page.get_by_text("TEST-2026-01").wait_for()
        page.get_by_role("button", name="Отправить заявку").click()
        page.get_by_role("heading", name="Заявка отправлена").wait_for()
        assert page.get_by_text("Заявка №126").is_visible()
        page.screenshot(path="/tmp/mighty-miners-success.png", full_page=True)

        # Основной статусный сценарий: сеть подтверждает поставку, после чего
        # поставщик видит расчёт и передаёт пакет финансовому партнёру.
        page.goto(f"{BASE_URL}/confirm/supply-125")
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="Подтвердить поставку").click()
        page.get_by_role("heading", name="Поставка подтверждена").wait_for()
        page.goto(f"{BASE_URL}/applications/125")
        page.wait_for_load_state("networkidle")
        page.get_by_text("1 940 822 ₸").wait_for()
        page.get_by_role("button", name="Передать заявку партнёру").click()
        page.get_by_text("Я согласен на передачу данных для рассмотрения заявки.").click()
        page.get_by_role("button", name="Подтвердить и передать").click()
        page.get_by_role("heading", name="Передано финансовому партнёру").wait_for()
        page.screenshot(path="/tmp/mighty-miners-transferred.png", full_page=True)

        for route, heading in (
            ("/applications", "Мои заявки"),
            ("/documents", "Документы"),
            ("/notifications", "Уведомления"),
            ("/profile", "Профиль"),
            ("/settings", "Настройки"),
        ):
            page.goto(BASE_URL + route)
            page.wait_for_load_state("networkidle")
            page.get_by_role("heading", name=heading, exact=True).wait_for()

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        mobile.goto(BASE_URL)
        mobile.wait_for_load_state("networkidle")
        assert mobile.get_by_label("Создать новую заявку").is_visible()
        page_width = mobile.evaluate("document.documentElement.scrollWidth")
        viewport_width = mobile.evaluate("window.innerWidth")
        assert page_width == viewport_width, f"Horizontal overflow: {page_width}px > {viewport_width}px"
        mobile.screenshot(path="/tmp/mighty-miners-mobile.png", full_page=True)

        browser.close()

    if errors:
        raise AssertionError("Browser console errors:\n" + "\n".join(errors))


if __name__ == "__main__":
    run()
    print("home + wizard smoke test: OK")
