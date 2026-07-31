const fs = require('fs');
let html = fs.readFileSync('cubejump_standalone.html', 'utf8');

// Replace any occurrence of data:image base64 with SVG data URIs if they exist.
// Specifically the link rel="icon" uses SVG but is URL encoded, not base64, which is fine (the requirement says "Tuyệt đối không dùng mã hóa base64").
// Let's verify there are really NO base64 strings
const base64Pattern = /data:[a-zA-Z0-9\/\+]+;base64,[a-zA-Z0-9\/\+=\r\n]+/g;
const matches = html.match(base64Pattern);
if (matches) {
    console.log("Found base64 matches: ", matches.length);
} else {
    console.log("No base64 matches found!");
}
