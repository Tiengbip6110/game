const fs = require('fs');
let html = fs.readFileSync('cubejump_standalone.html', 'utf8');

// Replace the event listener assignment in the HTML string directly by doing a replace on the buttons
html = html.replace(/<button id="playOnlineBtn".*?>[\s\S]*?<\/button>/,
    '<button id="playOnlineBtn" class="ghost-btn hero-play room-btn" type="button" onclick="alert(\\\'Tính năng này cần kết nối server, đây là bản demo offline\\\'); event.stopPropagation(); return false;">\n                            <span id="playOnlineBtnLabel">Tạo phòng</span>\n                        </button>');

html = html.replace(/<button id="homeJoinRoomBtn".*?>[\s\S]*?<\/button>/,
    '<button id="homeJoinRoomBtn" class="ghost-btn hero-play room-btn" type="button" onclick="alert(\\\'Tính năng này cần kết nối server, đây là bản demo offline\\\'); event.stopPropagation(); return false;">Nhập code</button>');

html = html.replace(/<button id="playOnlineDeathBtn".*?>[\s\S]*?<\/button>/,
    '<button id="playOnlineDeathBtn" class="ghost-btn compact-play room-btn" type="button" aria-label="Create room" onclick="alert(\\\'Tính năng này cần kết nối server, đây là bản demo offline\\\'); event.stopPropagation(); return false;">\n                        <span id="playOnlineDeathLabel">Tạo phòng</span>\n                    </button>');

html = html.replace(/<button id="onlineCreateRoomChoiceBtn".*?>[\s\S]*?<\/button>/,
    '<button id="onlineCreateRoomChoiceBtn" class="play-btn room-action-btn" type="button" onclick="alert(\\\'Tính năng này cần kết nối server, đây là bản demo offline\\\'); event.stopPropagation(); return false;">Tạo phòng</button>');

html = html.replace(/<button id="onlineJoinRoomChoiceBtn".*?>[\s\S]*?<\/button>/,
    '<button id="onlineJoinRoomChoiceBtn" class="ghost-btn room-action-btn" type="button" onclick="alert(\\\'Tính năng này cần kết nối server, đây là bản demo offline\\\'); event.stopPropagation(); return false;">Nhập code</button>');


fs.writeFileSync('cubejump_standalone.html', html);
