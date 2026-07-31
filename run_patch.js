const fs = require('fs');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        fs.writeFileSync(dest, data, 'utf8');
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  await download('https://cubejump.app/style-55f0e50721.css', 'v2_style.css');
  await download('https://cubejump.app/', 'v2_source.html');

  let html = fs.readFileSync('Cubejump.htm', 'utf8');
  let v2Html = fs.readFileSync('v2_source.html', 'utf8');
  let v2Css = fs.readFileSync('v2_style.css', 'utf8');

  // HTML Injections
  const removeAdsMatch = v2Html.match(/<button id="removeAdsBtn"[\s\S]*?<\/button>/);
  if (removeAdsMatch && !html.includes('removeAdsBtn')) {
      html = html.replace('<div class="scene-vignette"></div>', `<div class="scene-vignette"></div>\n            ${removeAdsMatch[0]}`);
  }

  const settingsBtn = v2Html.match(/<button id="settingsBtn"[\s\S]*?<\/button>/);
  const settingsPanelMatch = v2Html.match(/<div id="settingsPanel"[\s\S]*?<\/div>/);
  if (settingsBtn && settingsPanelMatch) {
      const v1LangHelpBlock = html.match(/<button id="langToggleBtn"[\s\S]*?<\/div>/);
      if (v1LangHelpBlock) {
          let v2Block = settingsBtn[0] + '\n            ' + settingsPanelMatch[0];
          v2Block = v2Block.replace(/C\?i \?\?t/g, 'Cài đặt')
                           .replace(/ChuyỒn ngôn ngữ/g, 'Chuyển ngôn ngữ')
                           .replace(/Ti\?ng Vi\?t/g, 'Tiếng Việt')
                           .replace(/C\?ch ch\?i/g, 'Cách chơi')
                           .replace(/Ch\?m tr\?i ho\?c ph\?i \?\? nh\?y \?\?ng h\?\?ng\./g, 'Chạm trái hoặc phải để nhảy đúng hướng.')
                           .replace(/Block \?\? \?i qua s\? r\?i;/g, 'Block đã đi qua sẽ rơi;')
                           .replace(/t\? b\?\?c 5, \?\?ng qu\? l\?u l\?m block hi\?n t\?i s\?p\./g, 'từ bước 5, đứng quá lâu làm block hiện tại sụp.')
                           .replace(/Online b\?t \?\?u r\?i khi t\?t c\? ng\?\?i ch\?i qua b\?\?c 10, timer t\?nh theo ng\?\?i \?i sau c\?ng\./g, 'Online bắt đầu rơi khi tất cả người chơi qua bước 10, timer tính theo người đi sau cùng.');
          html = html.replace(v1LangHelpBlock[0], v2Block);
      }
  }

  const startScreenV1 = html.match(/<section id="startScreen" class="screen home-screen">[\s\S]*?<\/section>/);
  const startScreenV2 = v2Html.match(/<section id="startScreen" class="screen home-screen">[\s\S]*?<\/section>/);
  if (startScreenV1 && startScreenV2) {
      let newStartScreen = startScreenV2[0];
      newStartScreen = newStartScreen.replace(/C\?i \?\?t/g, 'Cài đặt')
                                     .replace(/ChuyỒn ngôn ngữ/g, 'Chuyển ngôn ngữ')
                                     .replace(/Ti\?ng Vi\?t/g, 'Tiếng Việt')
                                     .replace(/C\?ch ch\?i/g, 'Cách chơi')
                                     .replace(/Ch\?m tr\?i ho\?c ph\?i \?\? nh\?y \?\?ng h\?\?ng\./g, 'Chạm trái hoặc phải để nhảy đúng hướng.')
                                     .replace(/Block \?\? \?i qua s\? r\?i;/g, 'Block đã đi qua sẽ rơi;')
                                     .replace(/t\? b\?\?c 5, \?\?ng qu\? l\?u l\?m block hi\?n t\?i s\?p\./g, 'từ bước 5, đứng quá lâu làm block hiện tại sụp.')
                                     .replace(/Online b\?t \?\?u r\?i khi t\?t c\? ng\?\?i ch\?i qua b\?\?c 10, timer t\?nh theo ng\?\?i \?i sau c\?ng\./g, 'Online bắt đầu rơi khi tất cả người chơi qua bước 10, timer tính theo người đi sau cùng.')
                                     .replace(/T\?n hi\?n th\?/g, 'Tên hiển thị')
                                     .replace(/Nh\?p code/g, 'Nhập code')
                                     .replace(/T\?o ph\?ng/g, 'Tạo phòng')
                                     .replace(/Nh\?n v\?t tr\?\?c/g, 'Nhân vật trước')
                                     .replace(/Ch\?i ngay/g, 'Chơi ngay');
      html = html.replace(startScreenV1[0], newStartScreen);
  }

  const gameOverV2 = v2Html.match(/<section id="gameOverScreen"[\s\S]*?<\/section>/);
  const gameOverV1 = html.match(/<section id="gameOverScreen"[\s\S]*?<\/section>/);
  if (gameOverV1 && gameOverV2) {
      let newGameOver = gameOverV2[0];
      newGameOver = newGameOver.replace(/H\?i sinh ch\?i ti\?p/g, 'Hồi sinh chơi tiếp')
                               .replace(/Ch\?i l\?i/g, 'Chơi lại')
                               .replace(/Ti\?p t\?c t\? checkpoint/g, 'Tiếp tục từ checkpoint');
      html = html.replace(gameOverV1[0], newGameOver);
  }

  const bgModalMatch = v2Html.match(/<section id="backgroundModal"[\s\S]*?<\/section>/);
  if (bgModalMatch && !html.includes('backgroundModal')) {
      let bgModal = bgModalMatch[0];
      bgModal = bgModal.replace(/Ch\?n n\?n/g, 'Chọn nền')
                       .replace(/M\?f kh\?a n\?n/g, 'Mở khóa nền')
                       .replace(/M\\u1edf kh\\u00f3a n\\u1ec1n/g, 'Mở khóa nền')
                       .replace(/Xem h\?ft qu\?ng c\?o \?\? nh\?n background/g, 'Xem hết quảng cáo để nhận background')
                       .replace(/Nh\?n/g, 'Nhận');
      html = html.replace('</section>\n        </div>\n    </div>', `</section>\n\n            ${bgModal}\n        </div>\n    </div>`);
  }

  // Inject CSS (only append to avoid replacing all V1 CSS which causes breakage)
  html = html.replace('</style>', `\n/* --- V2 CSS --- */\n${v2Css}\n</style>`);

  // Inject JS Logic INSIDE the IIFE
  const strictJs = `
// --- PORTED V2 UI LOGIC ---

// 1. Settings Panel
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");

if (settingsBtn) {
    settingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (settingsPanel) settingsPanel.classList.toggle("hidden");
    });
}
document.addEventListener("pointerdown", (e) => {
    if (settingsPanel && !settingsPanel.classList.contains("hidden")) {
        if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsPanel.classList.add("hidden");
        }
    }
});

// 2. Sound Toggle
const soundToggleBtn = document.getElementById("soundToggleBtn");
const gameplaySoundToggleBtn = document.getElementById("gameplaySoundToggleBtn");
const gameoverSoundToggleBtn = document.getElementById("gameoverSoundToggleBtn");
let soundEnabled = localStorage.getItem("cubeJumpSoundEnabled") !== "false";

function updateSoundUI() {
    const txt = soundEnabled ? "Sound On" : "Sound Off";
    if (soundToggleBtn) soundToggleBtn.textContent = txt;
}
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("cubeJumpSoundEnabled", soundEnabled.toString());
    updateSoundUI();
}
if (soundToggleBtn) soundToggleBtn.addEventListener("click", toggleSound);
updateSoundUI();

// 3. Remove Ads Fake Logic
const removeAdsBtn = document.getElementById("removeAdsBtn");
let adsRemoved = localStorage.getItem("cubeJumpNoAds") === "true";

function updateAdsUI() {
    if (removeAdsBtn) {
        const price = document.getElementById("removeAdsPrice");
        const lbl = document.getElementById("removeAdsBtnLabel");
        if (adsRemoved) {
            if (price) price.textContent = "Purchased";
            if (lbl) lbl.textContent = "No Ads";
            removeAdsBtn.style.opacity = "0.5";
            removeAdsBtn.style.pointerEvents = "none";
        }
    }
}

if (removeAdsBtn) {
    removeAdsBtn.classList.remove("hidden");
    removeAdsBtn.addEventListener("click", () => {
        if (!adsRemoved) {
            alert("This is a demo. In real version, purchase would be processed.");
            adsRemoved = true;
            localStorage.setItem("cubeJumpNoAds", "true");
            updateAdsUI();
        }
    });
}
updateAdsUI();

// 4. Backgrounds
const homeBackgroundBtn = document.getElementById("homeBackgroundBtn");
const backgroundModal = document.getElementById("backgroundModal");
const backgroundCloseBtn = document.getElementById("backgroundCloseBtn");
const backgroundGrid = document.getElementById("backgroundGrid");
const appShell = document.getElementById("app-shell");

const BG_SKINS = [
    { id: "bg_0", color: "#ffffff", price: 0 },
    { id: "bg_1", color: "#dbeafe", price: 0 },
    { id: "bg_2", color: "#1f2937", price: 1 },
    { id: "bg_3", color: "#fce7f3", price: 1 },
    { id: "bg_4", color: "#dcfce7", price: 1 }
];
let activeBg = localStorage.getItem("cubeJumpBg") || "bg_0";
let unlockedBgs = JSON.parse(localStorage.getItem("cubeJumpUnlockedBgs") || '["bg_0", "bg_1"]');

function updateBgUI() {
    const bg = BG_SKINS.find(b => b.id === activeBg) || BG_SKINS[0];
    if (appShell) appShell.style.backgroundColor = bg.color;
    document.documentElement.style.setProperty("--bg", bg.color);
}
updateBgUI();

if (homeBackgroundBtn) {
    homeBackgroundBtn.addEventListener("click", () => {
        if (backgroundModal) backgroundModal.classList.remove("hidden");
    });
}

if (backgroundCloseBtn) {
    backgroundCloseBtn.addEventListener("click", () => {
        if (backgroundModal) backgroundModal.classList.add("hidden");
    });
}

function renderBackgroundGrid() {
    if (backgroundGrid) {
        backgroundGrid.innerHTML = '';
        backgroundGrid.style.display = 'flex';
        backgroundGrid.style.gap = '10px';
        backgroundGrid.style.justifyContent = 'center';
        backgroundGrid.style.flexWrap = 'wrap';

        BG_SKINS.forEach(bg => {
            const div = document.createElement('div');
            div.style.width = '60px';
            div.style.height = '60px';
            div.style.backgroundColor = bg.color;
            div.style.border = activeBg === bg.id ? '3px solid #ef233c' : '2px solid #ccc';
            div.style.borderRadius = '8px';
            div.style.cursor = 'pointer';

            if (!unlockedBgs.includes(bg.id)) {
                div.style.opacity = '0.5';
                div.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;font-size:24px;">🔒</div>';
            }

            div.addEventListener('click', () => {
                if (unlockedBgs.includes(bg.id)) {
                    activeBg = bg.id;
                    localStorage.setItem("cubeJumpBg", activeBg);
                    updateBgUI();
                    renderBackgroundGrid();
                    if (backgroundModal) backgroundModal.classList.add("hidden");
                } else {
                    if (confirm('Watch ad to unlock this background?')) {
                        alert('Ad watched successfully! Background unlocked.');
                        unlockedBgs.push(bg.id);
                        localStorage.setItem("cubeJumpUnlockedBgs", JSON.stringify(unlockedBgs));

                        activeBg = bg.id;
                        localStorage.setItem("cubeJumpBg", activeBg);
                        updateBgUI();
                        renderBackgroundGrid();

                        if (backgroundModal) backgroundModal.classList.add("hidden");
                    }
                }
            });
            backgroundGrid.appendChild(div);
        });
    }
}
renderBackgroundGrid();

// 5. Pet Picker
const petPrevBtn = document.getElementById("petPrevBtn");
const petNextBtn = document.getElementById("petNextBtn");
const petPreviewViewport = document.getElementById("petPreviewViewport");

window.cubeJumpSelectedPet = parseInt(localStorage.getItem("cubeJumpSelectedPet") || "0", 10);

function updatePetUI() {
    if (petPreviewViewport && typeof SKINS !== 'undefined') {
        const skin = SKINS[window.cubeJumpSelectedPet];
        petPreviewViewport.innerHTML = \`<div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; color: \${skin.bodyDark}; background: \${skin.bodyLight}; border-radius: 8px;">
            <div style="width:20px;height:20px;background:\${skin.body};border:2px solid \${skin.bodyDark};"></div>
            <span style="font-size: 10px; margin-top:4px;">\${skin.name}</span>
        </div>\`;
    }
}
setTimeout(updatePetUI, 500);

if (petPrevBtn) {
    petPrevBtn.addEventListener("click", () => {
        if (typeof SKINS !== 'undefined') {
            window.cubeJumpSelectedPet = (window.cubeJumpSelectedPet - 1 + SKINS.length) % SKINS.length;
            localStorage.setItem("cubeJumpSelectedPet", window.cubeJumpSelectedPet);
            updatePetUI();
        }
    });
}

if (petNextBtn) {
    petNextBtn.addEventListener("click", () => {
        if (typeof SKINS !== 'undefined') {
            window.cubeJumpSelectedPet = (window.cubeJumpSelectedPet + 1) % SKINS.length;
            localStorage.setItem("cubeJumpSelectedPet", window.cubeJumpSelectedPet);
            updatePetUI();
        }
    });
}

const helpPanelV2 = document.getElementById("helpPanel");
if (helpPanelV2) {
    helpPanelV2.classList.remove("hidden");
}

const langToggleBtnV2 = document.getElementById("langToggleBtn");
if (langToggleBtnV2) {
    langToggleBtnV2.addEventListener("click", () => {
        const lbl = document.getElementById("langToggleLabel");
        const frm = document.getElementById("langToggleFrom");
        if (lbl && frm) {
            const isVi = lbl.textContent === "English";
            lbl.textContent = isVi ? "Tiếng Việt" : "English";
            frm.textContent = isVi ? "English" : "Tiếng Việt";
        }
    });
}
`;

  // Inject Logic inside the IIFE scope
  if (!html.includes('PORTED V2 UI LOGIC')) {
      if (html.includes('const DEFAULT_SKIN_INDEX = 0;')) {
          html = html.replace('const DEFAULT_SKIN_INDEX = 0;', 'let DEFAULT_SKIN_INDEX = 0;');
      }

      if (html.includes('SKINS[DEFAULT_SKIN_INDEX]')) {
          html = html.replace(/SKINS\[DEFAULT_SKIN_INDEX\]/g, 'SKINS[typeof window.cubeJumpSelectedPet !== "undefined" ? window.cubeJumpSelectedPet : DEFAULT_SKIN_INDEX]');
      }

      const logicStart = '})();</script>';
      if (html.includes(logicStart)) {
         html = html.replace(logicStart, `${strictJs}\n})();</script>`);
      } else if (html.includes('})();\n</script>')) {
         html = html.replace('})();\n</script>', `${strictJs}\n})();\n</script>`);
      } else if (html.includes('})();\n    </script>')) {
         html = html.replace('})();\n    </script>', `${strictJs}\n})();\n</script>`);
      } else {
         console.log('FAILED TO INJECT IN IIFE');
      }
  }

  fs.writeFileSync('Cubejump.htm', html, 'utf8');
}
run().then(() => console.log('Upgrade completed')).catch(console.error);
