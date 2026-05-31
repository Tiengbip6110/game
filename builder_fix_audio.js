const fs = require('fs');

let html = fs.readFileSync('depthi.html', 'utf8');

// The code sets audio.src = DATA.audio.src which should be our base64 string
// Let's ensure the JS bundle isn't using a different property name if DATA is accessed via another way

// Also there is a window.fsGetImages / window.fsGetSong in the inline script of index.html that we should override.
// Actually we removed the boot() script completely and just placed window.FIREBASE_DATA and main.js

fs.writeFileSync('depthi.html', html);
