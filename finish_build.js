const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const originalHtml = fs.readFileSync('temp.html', 'utf8');
const dom = new JSDOM(originalHtml);
const document = dom.window.document;

// Add FIREBASE_DATA
const firebaseData = JSON.parse(fs.readFileSync('firebase_data.json', 'utf8'));

// Update image/audio src in FIREBASE_DATA to use base64
const mediaBase64 = JSON.parse(fs.readFileSync('media_base64.json', 'utf8'));

if (firebaseData.book && firebaseData.book.pages) {
    firebaseData.book.pages.forEach(p => {
        if (p.image && mediaBase64[p.image]) {
            p.image = mediaBase64[p.image];
        }
    });
}
if (firebaseData.galaxy && firebaseData.galaxy.plates) {
    firebaseData.galaxy.plates.forEach(p => {
        if (p.src && mediaBase64[p.src]) {
            p.src = mediaBase64[p.src];
        }
    });
}
if (firebaseData.audio && firebaseData.audio.src) {
    if (mediaBase64[firebaseData.audio.src]) {
        firebaseData.audio.src = mediaBase64[firebaseData.audio.src];
    }
}

const dataScript = document.createElement('script');
dataScript.textContent = `window.FIREBASE_DATA = ${JSON.stringify(firebaseData)};\nwindow.CUSTOMER_ID = 'offline_mode';\nwindow.IS_PREVIEW = false;`;
document.body.appendChild(dataScript);

// Append bundled JS
const bundledJs = fs.readFileSync('js_bundle/out.js', 'utf8');
const appScript = document.createElement('script');
appScript.textContent = bundledJs;
document.body.appendChild(appScript);

const resultHtml = dom.serialize();
fs.writeFileSync('depthi.html', resultHtml);

const stats = fs.statSync('depthi.html');
console.log(`Generated depthi.html: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
