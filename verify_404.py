from playwright.sync_api import sync_playwright

def test_console():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        errors = []
        page.on("requestfailed", lambda req: errors.append(f"Failed: {req.url}"))
        page.on("response", lambda res: errors.append(f"404: {res.url}") if res.status == 404 else None)

        page.goto("http://localhost:8080/dist/index.html")
        page.wait_for_timeout(2000)

        print("Network errors:", errors)
        browser.close()

if __name__ == "__main__":
    test_console()
