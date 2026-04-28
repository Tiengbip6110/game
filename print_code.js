const fs = require('fs');

const code = fs.readFileSync('cubejump-v2-final.html', 'utf8');
const MAX_LENGTH = 7000;
for (let i = 0; i < code.length; i += MAX_LENGTH) {
    console.log(`SPLIT_${Math.floor(i / MAX_LENGTH)}`);
    console.log(code.substring(i, i + MAX_LENGTH));
}
