const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('depthi.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// We need to inject the CSS properly. The previous script:
// 1. injected style tag. Let's check if it did.
const styles = document.querySelectorAll('style');
console.log('Number of style tags:', styles.length);
// Check if the original css like :root is there.
let hasRoot = false;
styles.forEach(s => {
  if (s.textContent.includes(':root')) hasRoot = true;
});
console.log('Has :root CSS?', hasRoot);

// Let's re-embed all the CSS from resources_data.json
const resourcesData = JSON.parse(fs.readFileSync('resources_data.json', 'utf8'));

let combinedCss = '';
for (const [url, base64] of Object.entries(resourcesData)) {
  if (url.endsWith('.css') && !url.includes('google')) {
    const cssContent = Buffer.from(base64, 'base64').toString('utf8');
    combinedCss += `\n/* From ${url} */\n${cssContent}`;
  }
}

const newStyle = document.createElement('style');
newStyle.textContent = combinedCss;
document.head.appendChild(newStyle);

fs.writeFileSync('depthi.html', dom.serialize());
