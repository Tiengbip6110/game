const fs = require('fs');
let gameJs = fs.readFileSync('dist/script.js', 'utf8');

let petModelsCode = fs.readFileSync('dist/blockpet-models-9497ef2b5b.js', 'utf8');
petModelsCode = petModelsCode.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

let loaderCode = `
const _petModelsBlob = new Blob([\`${petModelsCode}\`], { type: 'application/javascript' });
const _petModelsUrl = URL.createObjectURL(_petModelsBlob);
`;

const importRegex = /import\("blockpet-models[a-zA-Z0-9\-\.]*\.js"\)/g;
if (importRegex.test(gameJs)) {
    gameJs = loaderCode + '\n' + gameJs.replace(importRegex, 'import(_petModelsUrl)');
    fs.writeFileSync('dist/script.js', gameJs);
    console.log("Patched dynamic import!");
} else {
    // Wait, let's search where 'blockpet-models' is.
    const idx = gameJs.indexOf('blockpet-models');
    console.log("Found at:", idx);
    console.log(gameJs.substring(idx - 20, idx + 40));
}
