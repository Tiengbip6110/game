const fs = require('fs');
let html = fs.readFileSync('src/cubejump.html', 'utf8');

// What if the original has one `<button id="playOnlineBtn"` but my replacement somehow added a second one?
