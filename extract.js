const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const resources = {};

  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    // Only capture assets we might need to bundle
    if (status === 200 && !url.startsWith('data:') && !url.includes('google-analytics')) {
      try {
        const buffer = await response.body();
        resources[url] = buffer.toString('base64');
        console.log('Saved resource:', url);
      } catch (e) {}
    }
  });

  try {
    console.log('Navigating to page...');
    await page.goto('https://our-day-bice.vercel.app/?id=261f2m2x0b0tihu9', { waitUntil: 'load', timeout: 60000 });
    console.log('Page loaded. Waiting for assets to settle...');
    await page.waitForTimeout(10000); // give it more time to load dynamic imports and firebase data
  } catch (e) {
    console.error('Error during navigation:', e);
  }

  fs.writeFileSync('resources.json', JSON.stringify(Object.keys(resources), null, 2));
  fs.writeFileSync('resources_data.json', JSON.stringify(resources, null, 2));

  const content = await page.content();
  fs.writeFileSync('rendered.html', content);

  await browser.close();
})();
