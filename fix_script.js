const fs = require('fs');

// Ah, I understand now. The first replace logic I ran previously mutated my original files? Or `originalHtml.replace(regex, string)` runs globally if it's a string, or maybe the template has multiple `<button id="playOnlineBtn"` in `cubejump.html`! Let me check `src/cubejump.html`
let srcHtml = fs.readFileSync('src/cubejump.html', 'utf8');
const matchCount = (srcHtml.match(/<button id="playOnlineBtn"/g) || []).length;
console.log("Count in src:", matchCount);
