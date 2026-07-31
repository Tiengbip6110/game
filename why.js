// Ah, the original html text had some stuff inside it.
// Wait! `engineJs`, `onlineJs`, or `gameJs` might have `<button id="playOnlineBtn"` strings inside it!
const fs = require('fs');

const onlineJs = fs.readFileSync('src/online.js', 'utf8');
const engineJs = fs.readFileSync('src/engine.js', 'utf8');
const gameJs = fs.readFileSync('src/game.js', 'utf8');
const css = fs.readFileSync('src/style.css', 'utf8');

console.log("onlineJs match:", onlineJs.includes('playOnlineBtn'));
console.log("engineJs match:", engineJs.includes('playOnlineBtn'));
console.log("gameJs match:", gameJs.includes('playOnlineBtn'));

// Ah! `game.js` probably has strings of the whole HTML block embedded! (e.g. innerHTML for the popup?)
