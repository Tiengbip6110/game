const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://our-day-bice.vercel.app/?id=261f2m2x0b0tihu9', { waitUntil: 'load' });

  // Wait for window.FIREBASE_DATA
  await page.waitForFunction(() => window.FIREBASE_DATA !== undefined, { timeout: 30000 });

  const data = await page.evaluate(() => window.FIREBASE_DATA);
  fs.writeFileSync('firebase_data.json', JSON.stringify(data, null, 2));

  await browser.close();
})();
