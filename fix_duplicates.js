const fs = require('fs');

let originalHtml = fs.readFileSync('src/cubejump.html', 'utf8');
const css = fs.readFileSync('src/style.css', 'utf8');
const engineJs = fs.readFileSync('src/engine.js', 'utf8');
const onlineJs = fs.readFileSync('src/online.js', 'utf8');
const gameJs = fs.readFileSync('src/game.js', 'utf8');

// I will do exact string replacements on originalHtml first, THEN merge the css and js
const alertCode = `alert('Tính năng này cần kết nối server, đây là bản demo offline'); event.stopPropagation(); return false;`;

originalHtml = originalHtml.replace(
    /<button id="playOnlineBtn" class="ghost-btn hero-play room-btn" type="button">([\s\S]*?)<\/button>/,
    `<button id="playOnlineBtn" class="ghost-btn hero-play room-btn" type="button" onclick="${alertCode}">$1</button>`
);

originalHtml = originalHtml.replace(
    /<button id="homeJoinRoomBtn" class="ghost-btn hero-play room-btn" type="button">Nhập code<\/button>/,
    `<button id="homeJoinRoomBtn" class="ghost-btn hero-play room-btn" type="button" onclick="${alertCode}">Nhập code</button>`
);

originalHtml = originalHtml.replace(
    /<button id="playOnlineDeathBtn" class="ghost-btn compact-play room-btn" type="button" aria-label="Create room">([\s\S]*?)<\/button>/,
    `<button id="playOnlineDeathBtn" class="ghost-btn compact-play room-btn" type="button" aria-label="Create room" onclick="${alertCode}">$1</button>`
);

originalHtml = originalHtml.replace(
    /<button id="onlineCreateRoomChoiceBtn" class="play-btn room-action-btn" type="button">Tạo phòng<\/button>/,
    `<button id="onlineCreateRoomChoiceBtn" class="play-btn room-action-btn" type="button" onclick="${alertCode}">Tạo phòng</button>`
);

originalHtml = originalHtml.replace(
    /<button id="onlineJoinRoomChoiceBtn" class="ghost-btn room-action-btn" type="button">Nhập code<\/button>/,
    `<button id="onlineJoinRoomChoiceBtn" class="ghost-btn room-action-btn" type="button" onclick="${alertCode}">Nhập code</button>`
);

// Now merge the CSS and JS
originalHtml = originalHtml.replace('<link rel="stylesheet" href="style-36cea290a8.css">', `<style>${css}</style>`);
originalHtml = originalHtml.replace('<script src="engine-15dc71f900.js"></script>', `<script>${engineJs}</script>`);
originalHtml = originalHtml.replace('<script src="online-e3209b1cb9.js"></script>', `<script>${onlineJs}</script>`);

// Fix JS bindings on gameJs before inserting it
let fixedGameJs = gameJs;
fixedGameJs = fixedGameJs.replace(/o\.playOnlineBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.playOnlineBtn.addEventListener removed*/");
fixedGameJs = fixedGameJs.replace(/o\.playOnlineDeathBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.playOnlineDeathBtn.addEventListener removed*/");
fixedGameJs = fixedGameJs.replace(/o\.onlineCreateRoomChoiceBtn\?\.addEventListener\("click",\(\)=>\{.*?\}\)/g, "/*o.onlineCreateRoomChoiceBtn.addEventListener removed*/");
fixedGameJs = fixedGameJs.replace(/o\.onlineJoinRoomChoiceBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.onlineJoinRoomChoiceBtn.addEventListener removed*/");
fixedGameJs = fixedGameJs.replace(/o\.homeJoinRoomBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.homeJoinRoomBtn.addEventListener removed*/");

originalHtml = originalHtml.replace('<script src="game-97a12b09d8.js"></script>', `<script>${fixedGameJs}</script>`);

fs.writeFileSync('cubejump_standalone.html', originalHtml);
