const fs = require('fs');

let html = fs.readFileSync('cubejump-v2-final.html', 'utf8');

// 6. Delete duplicate CSS
// Find <style> and /* --- V2 CSS --- */
const cssStart = html.indexOf('<style>');
const v2CssStart = html.indexOf('/* --- V2 CSS --- */');
if (cssStart !== -1 && v2CssStart !== -1) {
    html = html.substring(0, cssStart + 7) + '\n' + html.substring(v2CssStart);
}

// 1. Pet Picker not changing pet
// Replace SKINS[DEFAULT_SKIN_INDEX] with SKINS[window.cubeJumpSelectedPet || 0]
html = html.replace(/SKINS\[DEFAULT_SKIN_INDEX\]/g, 'SKINS[window.cubeJumpSelectedPet || 0]');
// Ensure render() is called after pet change
html = html.replace(/updatePetUI\(\);\s*\}/g, 'updatePetUI();\n            if(typeof render==="function") render();\n        }');

// 2. Missing Background Modal
// Ensure it's there
const bgModalHtml = `
            <section id="backgroundModal" class="screen room-modal hidden" aria-hidden="true">
                <div class="room-modal-card">
                    <button id="backgroundCloseBtn" class="room-head-btn room-exit-btn" type="button" aria-label="Đóng" style="align-self: flex-start; position: absolute; right: 18px; top: 18px;">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
                    </button>
                    <h2 style="text-align:center; margin-top:0px; font-size: 24px;">Chọn nền</h2>
                    <div id="backgroundGrid" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top:20px;"></div>
                </div>
            </section>
`;
if (!html.includes('id="backgroundModal"')) {
    html = html.replace('</section>\n        </div>\n    </div>', `</section>\n${bgModalHtml}\n        </div>\n    </div>`);
}

// 3. No Ads appears during gameplay
// Find setScreen function and inject logic to hide removeAdsBtn
const setScreenInject = `
    function setScreen(next) {
        screenState = next;
        const removeAdsBtn = document.getElementById("removeAdsBtn");
        if (removeAdsBtn) {
            if (next === "playing" || gameplayMode === "room") {
                removeAdsBtn.style.display = "none";
            } else {
                removeAdsBtn.style.display = "";
            }
        }
`;
html = html.replace(/function setScreen\(next\) \{[\s\S]*?screenState = next;/, setScreenInject);

// 4. Settings Panel
// Remove duplicate Language button, add Sound toggle button, keep one Privacy Policy link
// Let's rewrite the settings panel HTML
const settingsPanelHtml = `
            <div id="settingsPanel" class="settings-panel hidden" role="dialog" aria-modal="false" aria-labelledby="settingsPanelTitle" aria-hidden="true">
                <h2 id="settingsPanelTitle" class="settings-title">Cài đặt</h2>
                <button id="langToggleBtn" class="settings-action-btn" type="button" aria-label="Chuyển ngôn ngữ">
                    <span id="langToggleFrom">Tiếng Việt</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 7h9.2l-2.8-2.8L14.8 3 20 8.2l-5.2 5.1-1.4-1.4L16.2 9H7Zm10 8H7.8l2.8 2.8-1.4 1.4L4 14.8l5.2-5.1 1.4 1.4L7.8 13H17Z"></path>
                    </svg>
                    <span id="langToggleLabel">English</span>
                </button>
                <button id="soundToggleBtn" class="settings-action-btn" type="button" aria-pressed="true">Sound On</button>
                <div id="helpPanel" class="help-panel" aria-labelledby="helpPanelTitle">
                    <h2 id="helpPanelTitle">Cách chơi</h2>
                    <p id="helpPanelText">Chạm trái hoặc phải để nhảy đúng hướng. Block đã đi qua sẽ rơi; từ bước 5, đứng quá lâu làm block hiện tại sụp. Online bắt đầu rơi khi tất cả người chơi qua bước 10, timer tính theo người đi sau cùng.</p>
                </div>
                <a class="settings-privacy-link" href="https://cubejump.app/privacy.html" target="_blank" rel="noopener">Privacy Policy</a>
            </div>
`;
html = html.replace(/<div id="settingsPanel"[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, settingsPanelHtml + '\n            </div>\n        </section>'); // Wait, settingsPanel is inside startScreen.
// Let's just find <div id="settingsPanel" ... to the matching </div> and a bit after
html = html.replace(/<div id="settingsPanel"[\s\S]*?<a class="settings-privacy-link"[\s\S]*?<\/a>\s*<\/div>/, settingsPanelHtml);

// 5. Game Over popup
// The popup is `gameoverMenuPopup`. Let's ensure it has `gameoverLeaveRoomBtn`
html = html.replace('if (gameoverMenuBtn && gameoverMenuPopup) {', `
if (gameoverMenuBtn && gameoverMenuPopup) {
    document.addEventListener("pointerdown", (e) => {
        if (!gameoverMenuPopup.classList.contains("hidden")) {
            if (!gameoverMenuPopup.contains(e.target) && !gameoverMenuBtn.contains(e.target)) {
                gameoverMenuPopup.classList.add("hidden");
            }
        }
    });
`);

// 7. Fix JS errors
// Remove duplicate fallbackCopyText
// Actually, let's just check if it's duplicated.
const parts = html.split('function fallbackCopyText(');
if (parts.length > 2) {
    // It's duplicated. Let's remove the second one.
    html = html.replace(/function fallbackCopyText\(text\) \{[\s\S]*?temp\.remove\(\);\n\}/g, '');
    // Put it back once
    html = html.replace('// --- PORTED V2 UI LOGIC ---', `// --- PORTED V2 UI LOGIC ---\nfunction fallbackCopyText(text) {\n    const temp = document.createElement("textarea");\n    temp.value = text;\n    temp.setAttribute("readonly", "");\n    temp.style.position = "fixed";\n    temp.style.top = "0";\n    temp.style.left = "-9999px";\n    temp.style.opacity = "0";\n    document.body.append(temp);\n    temp.focus({ preventScroll: true });\n    temp.select();\n    temp.setSelectionRange(0, temp.value.length);\n    document.execCommand("copy");\n    temp.remove();\n}\n`);
}

// Remove unused roomDemoTickAt
html = html.replace(/let roomDemoTickAt = 0;/g, '');

// Language toggle calls setLocale() -> already does `if (typeof setLocale === 'function') setLocale();`
// But let's change it to call setLocale directly if it exists, otherwise just toggle text.
html = html.replace(/if \(typeof toggleLocale === 'function'\) toggleLocale\(\);/g, `
        if (typeof toggleLocale === 'function') {
            toggleLocale();
        } else if (typeof setLocale === 'function') {
            const current = localStorage.getItem("cubeJumpLanguage") === "en" ? "en" : "vi";
            setLocale(current === "en" ? "vi" : "en");
        }
`);

fs.writeFileSync('cubejump-v2-final.html', html, 'utf8');
console.log('Fixed requested issues.');
