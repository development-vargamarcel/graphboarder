from playwright.sync_api import Page, expect, sync_playwright
import json

def verify_history(page: Page):
    print("Navigating directly to /endpoints/localEndpoint--nhost")
    page.goto("http://localhost:5173/endpoints/localEndpoint--nhost")

    # Inject history
    history_data = json.dumps([
        {
            "id": "test-1",
            "query": "query { test }",
            "endpointId": "localEndpoint--nhost",
            "operationName": "Test Query",
            "timestamp": 1679000000000,
            "isFavorite": True,
            "name": "My Favorite Query"
        }
    ])
    page.evaluate(f"localStorage.setItem('queryHistory', '{history_data}')")

    # Reload
    page.reload()
    page.wait_for_timeout(10000) # Wait for introspection

    print("Taking screenshot of loaded page")
    page.screenshot(path="verification/explorer_loaded.png")

    print("Looking for History button")
    history_btn = page.locator("button:has-text('History')")

    if history_btn.count() > 0:
        print("Clicking History button")
        history_btn.first.click()
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/history_modal.png")
        print("Done")
    else:
        print("History button not found")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        try:
            verify_history(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
