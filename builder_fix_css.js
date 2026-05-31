const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('depthi.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// remove missing relative css
const styles = document.querySelectorAll('link[rel="stylesheet"]');
styles.forEach(s => {
  if (s.href && !s.href.startsWith('http') && !s.href.includes('google')) {
    s.remove();
  }
});

fs.writeFileSync('depthi.html', dom.serialize());
