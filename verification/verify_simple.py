from playwright.sync_api import Page, expect, sync_playwright

def verify_history(page: Page):
    print("Navigating to /endpoints")
    page.goto("http://localhost:5173/endpoints")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/verification.png")
    print("Screenshot taken")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_history(page)
        finally:
            browser.close()
