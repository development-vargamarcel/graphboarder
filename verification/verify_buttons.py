from playwright.sync_api import sync_playwright

def test_buttons(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/home.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_buttons(page)
        finally:
            browser.close()
