const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const originalHtml = fs.readFileSync('rendered.html', 'utf8');
const dom = new JSDOM(originalHtml);
const document = dom.window.document;

// 1. Remove Firebase and DevTools detector
['firebase-app-compat.js', 'firebase-firestore-compat.js', 'detect-devtools.js', 'firebase-shared.js'].forEach(scriptName => {
  const scripts = document.querySelectorAll(`script[src*="${scriptName}"]`);
  scripts.forEach(s => s.remove());
});
const moduleScript = document.querySelector('script[type="module"]');
if (moduleScript) moduleScript.remove();
const inlineScript = document.querySelector('script:not([src]):not([type="module"])');
if (inlineScript && inlineScript.textContent.includes('DisableDevtool')) inlineScript.remove();

const resourcesData = JSON.parse(fs.readFileSync('resources_data.json', 'utf8'));

// Inject CSS inline
const styles = document.querySelectorAll('link[rel="stylesheet"]');
let combinedCss = '';
for (const style of styles) {
  const url = style.href;
  if (url.includes('google')) continue; // Keep google fonts as link
  if (resourcesData[url]) {
    const cssContent = Buffer.from(resourcesData[url], 'base64').toString('utf8');
    combinedCss += `\n/* From ${url} */\n${cssContent}`;
    style.remove();
  }
}
if (combinedCss) {
  const styleEl = document.createElement('style');
  styleEl.textContent = combinedCss;
  document.head.appendChild(styleEl);
}

// Write the html
fs.writeFileSync('temp.html', dom.serialize());
