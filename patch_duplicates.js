const fs = require('fs');
let html = fs.readFileSync('cubejump_standalone.html', 'utf8');

// I'll clean up the mess and properly patch only the buttons
// Let's use cheerio to properly modify HTML, it's safer. Wait, no cheerio in node by default.
// Let's do it using regex to replace exactly the specific button tags, or rather since I appended the replaced code in my earlier sed/replace.

// Read from original src/cubejump.html again, merge, and then properly replace.
const originalHtml = fs.readFileSync('src/cubejump.html', 'utf8');
const css = fs.readFileSync('src/style.css', 'utf8');
const engineJs = fs.readFileSync('src/engine.js', 'utf8');
const onlineJs = fs.readFileSync('src/online.js', 'utf8');
const gameJs = fs.readFileSync('src/game.js', 'utf8');

let newHtml = originalHtml.replace('<link rel="stylesheet" href="style-36cea290a8.css">', `<style>${css}</style>`);
newHtml = newHtml.replace('<script src="engine-15dc71f900.js"></script>', `<script>${engineJs}</script>`);
newHtml = newHtml.replace('<script src="online-e3209b1cb9.js"></script>', `<script>${onlineJs}</script>`);
newHtml = newHtml.replace('<script src="game-97a12b09d8.js"></script>', `<script>${gameJs}</script>`);

const alertCode = `alert('Tính năng này cần kết nối server, đây là bản demo offline'); event.stopPropagation(); return false;`;

newHtml = newHtml.replace(
    /<button id="playOnlineBtn"[^>]*>([\s\S]*?)<\/button>/,
    `<button id="playOnlineBtn" class="ghost-btn hero-play room-btn" type="button" onclick="${alertCode}">\n                            <span id="playOnlineBtnLabel">Tạo phòng</span>\n                        </button>`
);

newHtml = newHtml.replace(
    /<button id="homeJoinRoomBtn"[^>]*>([\s\S]*?)<\/button>/,
    `<button id="homeJoinRoomBtn" class="ghost-btn hero-play room-btn" type="button" onclick="${alertCode}">Nhập code</button>`
);

newHtml = newHtml.replace(
    /<button id="playOnlineDeathBtn"[^>]*>([\s\S]*?)<\/button>/,
    `<button id="playOnlineDeathBtn" class="ghost-btn compact-play room-btn" type="button" aria-label="Create room" onclick="${alertCode}">\n                        <span id="playOnlineDeathLabel">Tạo phòng</span>\n                    </button>`
);

newHtml = newHtml.replace(
    /<button id="onlineCreateRoomChoiceBtn"[^>]*>([\s\S]*?)<\/button>/,
    `<button id="onlineCreateRoomChoiceBtn" class="play-btn room-action-btn" type="button" onclick="${alertCode}">Tạo phòng</button>`
);

newHtml = newHtml.replace(
    /<button id="onlineJoinRoomChoiceBtn"[^>]*>([\s\S]*?)<\/button>/,
    `<button id="onlineJoinRoomChoiceBtn" class="ghost-btn room-action-btn" type="button" onclick="${alertCode}">Nhập code</button>`
);

newHtml = newHtml.replace(/o\.playOnlineBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.playOnlineBtn.addEventListener removed*/");
newHtml = newHtml.replace(/o\.playOnlineDeathBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.playOnlineDeathBtn.addEventListener removed*/");
newHtml = newHtml.replace(/o\.onlineCreateRoomChoiceBtn\?\.addEventListener\("click",\(\)=>\{.*?\}\)/g, "/*o.onlineCreateRoomChoiceBtn.addEventListener removed*/");
newHtml = newHtml.replace(/o\.onlineJoinRoomChoiceBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.onlineJoinRoomChoiceBtn.addEventListener removed*/");
newHtml = newHtml.replace(/o\.homeJoinRoomBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.homeJoinRoomBtn.addEventListener removed*/");


fs.writeFileSync('cubejump_standalone.html', newHtml);
