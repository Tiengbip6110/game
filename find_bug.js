const fs = require('fs');
let text = fs.readFileSync('cubejump_standalone.html', 'utf8');
const matchCount = (text.match(/<button id="playOnlineBtn"/g) || []).length;
console.log("Count in standalone:", matchCount);

// Let's find out WHERE the second one is coming from.
const lines = text.split('\n');
lines.forEach((line, i) => {
    if (line.includes('<button id="playOnlineBtn"')) {
        console.log(`Line ${i+1}: ${line.trim()}`);
    }
});
