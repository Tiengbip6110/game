const fs = require('fs');
let v1Html = fs.readFileSync('v1_original.html', 'utf8');

// The functions we need to copy from V1 to V2:
// function drawCharacter(...) ...
// function _darkened(...) ...
// function _drawSkinDetail(...) ...
// In V1, they are defined back to back. Let's just find the block from `function drawCharacter` to `function drawSparkle`
let start = v1Html.indexOf('function drawCharacter(');
let end = v1Html.indexOf('function drawSparkle(');
let drawFuncs = v1Html.slice(start, end);

let drawRoomPlayerEntityStart = v1Html.indexOf('function drawRoomPlayerEntity(');
let drawRoomPlayerEntityEnd = v1Html.indexOf('function getPlayerSortY(');
let drawRoomFuncs = v1Html.slice(drawRoomPlayerEntityStart, drawRoomPlayerEntityEnd);

// In V2, we need to locate the game loop rendering.
let v2Html = fs.readFileSync('Cubejump.htm', 'utf8');

// The user said: "V2 hiện tại = V1 + thêm UI tính năng (No Ads, Settings, Backgrounds, Sound) + giữ nguyên engine vẽ 2D."
// "Cậu cứ copy lại toàn bộ phần vẽ từ V1, ghép vào V2, chỉnh sửa UI theo yêu cầu trước đó."
// The reviewer said: "The patch completely removes the drawCharacter function... and replaces it with a WebGL/Three.js layer (gameplayPetLayer)."

// Wait, looking at the code, in V2 the 3D model is loaded via:
// import("./blockpet-models-9497ef2b5b.js"),import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js")
// Let's remove those.
v2Html = v2Html.replace(/import\([^)]+\)/g, 'Promise.reject("No 3D")');

// V2's `gl()` is the minified render function. Let's find it.
// Wait, the V2 we downloaded was MINIFIED. The V1 we started with was UNMINIFIED.
// Oh, `cubejump.app` serves minified JS!
// But the original `Cubejump.htm` (V1) has the UNMINIFIED JS.
// The user wants me to upgrade V1 to V2. I can just copy the UI changes from V2 and paste them into V1's unminified code!
// That's why the reviewer complained. I just replaced the entire file with minified V2 code which uses WebGL!

console.log("Ah, V1 is unminified. V2 from the server is minified. I should port the UI features from V2 into V1 instead of replacing V1 with V2.");
