const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('depthi.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// In the original, the boot script hides the loading spinner. We removed it, so we need to add a small script to hide it.
const hideLoadingScript = document.createElement('script');
hideLoadingScript.textContent = `
  window.addEventListener('load', function() {
    var loading = document.getElementById('u-loading');
    if (loading) {
      loading.classList.add('hide');
      setTimeout(function() {
        if (loading.parentNode) loading.parentNode.removeChild(loading);
      }, 700);
    }
  });
`;
document.body.appendChild(hideLoadingScript);

fs.writeFileSync('depthi.html', dom.serialize());
