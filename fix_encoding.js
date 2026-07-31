const fs = require('fs');

let html = fs.readFileSync('Cubejump.htm', 'utf8');
const v1Html = fs.readFileSync('.git/refs/heads/jules-17701099733452045326-fe30a1f9', 'utf8'); // Wait no. I can get V1 by `git show HEAD:Cubejump.htm` if I commit.

// We need to inject drawCharacter into V2.
