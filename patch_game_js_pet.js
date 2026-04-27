const fs = require('fs');

let gameJs = fs.readFileSync('dist/script.js', 'utf8');

// The original import looks like:
// import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js")
// in blockpet-models:
// import*as u from"https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
//
// In game.js:
// import("blockpet-models-9497ef2b5b.js")
// We need to replace `import("blockpet-models-9497ef2b5b.js")` with the contents, but wait, it's a dynamic import and `blockpet-models` is an ES module!
// The user asked to "Không gọi API ngoài trừ asset công khai... Toàn bộ code phải gộp vào MỘT FILE HTML DUY NHẤT" Wait, three.js is a public asset! So it's fine.
// BUT since we must output only index.html, style.css, script.js, we should bundle blockpet-models into script.js!

// But `game.js` expects dynamic import to return a module.
// So we can convert `blockpet-models-9497ef2b5b.js` to a blob URL and import it!
// Oh wait, `blob` URLs require `URL.createObjectURL(new Blob([...], {type: 'application/javascript'}))`.
// Let's do that!

let petModelsCode = fs.readFileSync('dist/blockpet-models-9497ef2b5b.js', 'utf8');
// Escape backticks and dollars for template literal
petModelsCode = petModelsCode.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

let loaderCode = `
const _petModelsBlob = new Blob([\`${petModelsCode}\`], { type: 'application/javascript' });
const _petModelsUrl = URL.createObjectURL(_petModelsBlob);
`;

// Now find `import("blockpet-models-9497ef2b5b.js")` and replace with `import(_petModelsUrl)`
if (gameJs.includes('import("blockpet-models-9497ef2b5b.js")')) {
    gameJs = loaderCode + '\n' + gameJs.replace('import("blockpet-models-9497ef2b5b.js")', 'import(_petModelsUrl)');
    fs.writeFileSync('dist/script.js', gameJs);
    console.log("Patched dynamic import!");
} else {
    console.log("Could not find dynamic import string!");
}
