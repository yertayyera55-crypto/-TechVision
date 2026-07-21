import base64
import os

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")
PDF = base64.b64decode(
    "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA1IDAgUiA+PiA+PiAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCA1NiA+PgpzdHJlYW0KQlQgL0YxIDExIFRmIDcyIDcyMCBUZCAoRmxvd0ZhY3RvciBkZW1vIGNvbnRyYWN0KSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDEgMDAwMDAgbiAKMDAwMDAwMDU1NCAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjYyNAolJUVPRgo="
)


def run() -> None:
    """Проверяет сохранение единственного обязательного договора и его открытие после reload."""
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: errors.append(f"page error: {error}"))

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="Продолжить с демо-профилем", exact=True).click()
        page.goto(f"{BASE_URL}/applications/new")
        page.wait_for_load_state("networkidle")

        page.locator("#file-contract").set_input_files(
            {"name": "contract-proof.pdf", "mimeType": "application/pdf", "buffer": PDF}
        )
        expect(page.get_by_text("contract-proof.pdf", exact=True)).to_be_visible()
        page.reload()
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("contract-proof.pdf", exact=True)).to_be_visible()

        with page.expect_popup() as popup_info:
            page.get_by_role("button", name="Открыть", exact=True).click()
        popup = popup_info.value
        expect(popup.locator("iframe[title='Предпросмотр документа']")).to_have_count(1)
        expect(popup.get_by_role("link", name="Скачать документ")).to_be_visible()
        popup.close()

        page.get_by_role("button", name="Запустить готовое демо", exact=True).click()
        page.get_by_role("button", name="Показать результат анализа", exact=True).click()
        expect(page.get_by_role("heading", name="Паспорт договора", exact=True)).to_be_visible()
        page.get_by_role("button", name="Подтвердить категорию", exact=True).click()
        page.get_by_role("button", name="Сформировать анкету", exact=True).click()
        expect(page.get_by_role("heading", name="Универсальная анкета FlowFactor", exact=True)).to_be_visible()
        expect(page.get_by_role("button", name="Скачать анкету", exact=True)).to_be_visible()
        assert not errors, "Browser console errors:\n" + "\n".join(errors)
        browser.close()


if __name__ == "__main__":
    run()
    print("Document storage smoke scenario passed")
