const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('depthi.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// remove protect.js script
const protectScript = document.querySelector('script[src="protect.js"]');
if (protectScript) {
  protectScript.remove();
}

// remove the devtools protection script early in head
const devtoolsEarlyScript = document.querySelector('script:not([src])');
if (devtoolsEarlyScript && devtoolsEarlyScript.textContent.includes('debugger')) {
  devtoolsEarlyScript.remove();
}

// ensure missing protect.js and detect-devtools are cleanly handled
const scripts = document.querySelectorAll('script');
scripts.forEach(s => {
  if (s.textContent.includes('protect.js')) {
    s.remove();
  }
});

fs.writeFileSync('depthi.html', dom.serialize());
