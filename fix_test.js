const fs = require('fs');
let html = fs.readFileSync('dist/index.html', 'utf8');
const count = (html.match(/<button id="playOnlineBtn"/g) || []).length;
console.log("Count in dist/index.html:", count);
