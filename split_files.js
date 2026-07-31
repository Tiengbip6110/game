const fs = require('fs');

const originalHtml = fs.readFileSync('src/cubejump.html', 'utf8');
const css = fs.readFileSync('src/style.css', 'utf8');
const engineJs = fs.readFileSync('src/engine.js', 'utf8');
const onlineJs = fs.readFileSync('src/online.js', 'utf8');
const gameJs = fs.readFileSync('src/game.js', 'utf8');

// The original HTML references:
// <link rel="stylesheet" href="style-36cea290a8.css">
// <script src="engine-15dc71f900.js"></script>
// <script src="online-e3209b1cb9.js"></script>
// <script src="game-97a12b09d8.js"></script>

let newHtml = originalHtml.replace('<link rel="stylesheet" href="style-36cea290a8.css">', '<link rel="stylesheet" href="style.css">');
newHtml = newHtml.replace('<script src="engine-15dc71f900.js"></script>', '');
newHtml = newHtml.replace('<script src="online-e3209b1cb9.js"></script>', '');
newHtml = newHtml.replace('<script src="game-97a12b09d8.js"></script>', '<script src="script.js"></script>');

const alertCode = `alert('Tính năng này cần kết nối server, đây là bản demo offline'); event.stopPropagation(); return false;`;

// We just replace the button elements to have the onclick alert
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

let fixedGameJs = gameJs;
fixedGameJs = fixedGameJs.replace(/o\.playOnlineBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.playOnlineBtn.addEventListener removed*/");
fixedGameJs = fixedGameJs.replace(/o\.playOnlineDeathBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.playOnlineDeathBtn.addEventListener removed*/");
fixedGameJs = fixedGameJs.replace(/o\.onlineCreateRoomChoiceBtn\?\.addEventListener\("click",\(\)=>\{.*?\}\)/g, "/*o.onlineCreateRoomChoiceBtn.addEventListener removed*/");
fixedGameJs = fixedGameJs.replace(/o\.onlineJoinRoomChoiceBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.onlineJoinRoomChoiceBtn.addEventListener removed*/");
fixedGameJs = fixedGameJs.replace(/o\.homeJoinRoomBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.homeJoinRoomBtn.addEventListener removed*/");

const mergedJs = engineJs + '\n' + onlineJs + '\n' + fixedGameJs;

fs.writeFileSync('index.html', newHtml);
fs.writeFileSync('style.css', css);
fs.writeFileSync('script.js', mergedJs);
