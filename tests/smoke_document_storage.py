import base64
import os
import re

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


def run() -> None:
    """Проверяет IndexedDB: upload, reload, open, application и общий архив."""
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900}, accept_downloads=True)
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: errors.append(f"page error: {error}"))

        page.goto(BASE_URL)
        page.evaluate("localStorage.clear()")
        page.evaluate(
            """async () => {
              await new Promise((resolve) => {
                const request = indexedDB.deleteDatabase('mighty-miners-files-v1');
                request.onsuccess = request.onerror = request.onblocked = () => resolve();
              });
            }"""
        )
        page.goto(f"{BASE_URL}/applications/new")
        page.wait_for_load_state("networkidle")

        page.locator("#network").select_option(label="Green Market")
        page.locator("#amount").fill("750000")
        page.locator("#invoiceNumber").fill("DOC-STORAGE-1")
        page.get_by_role("button", name="Далее", exact=False).click()
        page.get_by_role("button", name="Далее", exact=False).click()

        for field_id, name in [
            ("file-invoice", "invoice-proof.png"),
            ("file-bill", "bill-proof.png"),
            ("file-contract", "contract-proof.png"),
        ]:
            page.locator(f"#{field_id}").set_input_files(
                {"name": name, "mimeType": "image/png", "buffer": PNG}
            )
            expect(page.get_by_text(name, exact=True)).to_be_visible()

        expect(page.get_by_role("button", name="Открыть", exact=True)).to_have_count(3)

        # Метаданные и Blob должны пережить reload на третьем шаге.
        page.reload()
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("invoice-proof.png", exact=True)).to_be_visible()
        with page.expect_popup() as popup_info:
            page.get_by_role("button", name="Открыть", exact=True).first.click()
        popup = popup_info.value
        popup.wait_for_url(re.compile(r"^blob:"))
        popup.close()

        page.get_by_role("button", name="Далее", exact=False).click()
        page.get_by_role("button", name="Отправить заявку", exact=True).click()
        expect(page.get_by_role("heading", name="Заявка отправлена", exact=True)).to_be_visible()
        page.get_by_role("link", name="Перейти к заявке", exact=False).click()
        expect(page.locator("#documents").get_by_text("invoice-proof.png", exact=True)).to_be_visible()

        page.goto(f"{BASE_URL}/documents")
        page.wait_for_load_state("networkidle")
        document = page.locator("article").filter(has_text="invoice-proof.png")
        expect(document.get_by_role("button", name="Открыть", exact=True)).to_be_visible()
        with page.expect_download() as download_info:
            document.get_by_role("button", name="Скачать", exact=True).click()
        assert download_info.value.suggested_filename == "invoice-proof.png"

        # Старые demo-записи хранили только имя; их можно восстановить одной повторной загрузкой.
        legacy = page.locator("article").filter(has_text="Накладная_125.pdf")
        expect(legacy.get_by_role("button", name="Загрузить заново", exact=True)).to_be_visible()
        legacy.locator("input[type=file]").set_input_files(
            {"name": "legacy-recovered.png", "mimeType": "image/png", "buffer": PNG}
        )
        expect(page.get_by_text("legacy-recovered.png", exact=True)).to_be_visible()
        recovered = page.locator("article").filter(has_text="legacy-recovered.png")
        expect(recovered.get_by_role("button", name="Открыть", exact=True)).to_be_visible()
        page.screenshot(path="/tmp/mighty-miners-documents.png", full_page=True)

        assert not errors, "Browser console errors:\n" + "\n".join(errors)
        browser.close()


if __name__ == "__main__":
    run()
    print("Document storage smoke scenario passed")
