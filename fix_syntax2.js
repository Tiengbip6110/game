const fs = require('fs');
let original = fs.readFileSync('src/game.js', 'utf8');

const snippetStart = original.indexOf('o.playOnlineBtn.addEventListener("click",');
console.log("Original surrounding code:", original.substring(snippetStart - 50, snippetStart + 200));
