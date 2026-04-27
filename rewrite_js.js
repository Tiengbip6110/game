const fs = require('fs');
let gameJs = fs.readFileSync('src/game.js', 'utf8');

// The original code has:
// !0),o.playOnlineBtn.addEventListener("click",Rs),o.playOnlineDeathBtn.addEventListener("click",Bs),o.watchAdBtn...

// When I replace it with `/*removed*/`, it becomes:
// !0),/*removed*/,/*removed*/,o.watchAdBtn...
// The commas are left behind! e.g. `!0),,,o.watchAdBtn` which is an invalid expression sequence!

// Instead of replacing with `/*removed*/`, I should replace with `void 0` or just let it bind to dummy functions. Or just leave it?
// The buttons now have `onclick="alert(...); event.stopPropagation(); return false;"`
// If I leave the original `.addEventListener("click", ...)` they might still trigger the original online logic! But `event.stopPropagation()` might prevent it? No, both are on the same element, so order matters. `return false` from inline `onclick` might not stop `addEventListener`. It's better to replace them with `0`.

let fixedGameJs = gameJs;
fixedGameJs = fixedGameJs.replace(/o\.playOnlineBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "0");
fixedGameJs = fixedGameJs.replace(/o\.playOnlineDeathBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "0");
fixedGameJs = fixedGameJs.replace(/o\.onlineCreateRoomChoiceBtn\?\.addEventListener\("click",\(\)=>\{.*?\}\)/g, "0");
fixedGameJs = fixedGameJs.replace(/o\.onlineJoinRoomChoiceBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "0");
fixedGameJs = fixedGameJs.replace(/o\.homeJoinRoomBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "0");

const engineJs = fs.readFileSync('src/engine.js', 'utf8');
const onlineJs = fs.readFileSync('src/online.js', 'utf8');
const mergedJs = engineJs + '\n' + onlineJs + '\n' + fixedGameJs;

fs.writeFileSync('dist/script.js', mergedJs);
