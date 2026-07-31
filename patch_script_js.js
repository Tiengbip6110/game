const fs = require('fs');
let html = fs.readFileSync('cubejump_standalone.html', 'utf8');

// The original JS bound these buttons with Event Listeners, which might override or interfere with our onclick,
// so we'll remove their original bindings in the JS string
// original code bindings:
// o.playOnlineBtn.addEventListener("click",Rs)
// o.playOnlineDeathBtn.addEventListener("click",Bs)
// o.onlineCreateRoomChoiceBtn?.addEventListener("click",()=>{qa(1e3)&&Xr()})
// o.onlineJoinRoomChoiceBtn?.addEventListener("click",Is)

html = html.replace(/o\.playOnlineBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.playOnlineBtn.addEventListener removed*/");
html = html.replace(/o\.playOnlineDeathBtn\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.playOnlineDeathBtn.addEventListener removed*/");
html = html.replace(/o\.onlineCreateRoomChoiceBtn\?\.addEventListener\("click",\(\)=>\{.*?\}\)/g, "/*o.onlineCreateRoomChoiceBtn.addEventListener removed*/");
html = html.replace(/o\.onlineJoinRoomChoiceBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.onlineJoinRoomChoiceBtn.addEventListener removed*/");
html = html.replace(/o\.homeJoinRoomBtn\?\.addEventListener\("click",[a-zA-Z0-9_]+\)/g, "/*o.homeJoinRoomBtn.addEventListener removed*/");

fs.writeFileSync('cubejump_standalone.html', html);
