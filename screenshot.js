const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Serve via python
  await page.goto('http://localhost:8080/depthi.html', { waitUntil: 'load' });

  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'screenshot.png', fullPage: true });

  await browser.close();
})();
