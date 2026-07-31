const fs = require('fs');
const html = fs.readFileSync('src/cubejump.html', 'utf8');
const css = fs.readFileSync('src/style.css', 'utf8');
const engineJs = fs.readFileSync('src/engine.js', 'utf8');
const onlineJs = fs.readFileSync('src/online.js', 'utf8');
const gameJs = fs.readFileSync('src/game.js', 'utf8');

let newHtml = html.replace('<link rel="stylesheet" href="style-36cea290a8.css">', `<style>${css}</style>`);
newHtml = newHtml.replace('<script src="engine-15dc71f900.js"></script>', `<script>${engineJs}</script>`);
newHtml = newHtml.replace('<script src="online-e3209b1cb9.js"></script>', `<script>${onlineJs}</script>`);
newHtml = newHtml.replace('<script src="game-97a12b09d8.js"></script>', `<script>${gameJs}</script>`);

fs.writeFileSync('cubejump_standalone.html', newHtml);
