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
  await download('https://cubejump.app/', 'v2_source.html');
  await download('https://cubejump.app/style-f350dd02eb.css', 'v2_style.css');
  await download('https://cubejump.app/engine-15dc71f900.js', 'v2_engine.js');
  await download('https://cubejump.app/online-d150751214.js', 'v2_online.js');
  await download('https://cubejump.app/game-3baa65df43.js', 'v2_game.js');

  const html = fs.readFileSync('v2_source.html', 'utf8');
  const css = fs.readFileSync('v2_style.css', 'utf8');
  const engineJs = fs.readFileSync('v2_engine.js', 'utf8');
  const onlineJs = fs.readFileSync('v2_online.js', 'utf8');
  const gameJs = fs.readFileSync('v2_game.js', 'utf8');

  let newHtml = html.replace(/<link rel="stylesheet"[^>]+style[^>]+>/, `<style>\n${css}\n</style>`);
  newHtml = newHtml.replace(/<script src="engine[^>]+><\/script>\s*<script src="online[^>]+><\/script>\s*<script src="game[^>]+><\/script>/, `<script>\n${engineJs}\n${onlineJs}\n${gameJs}\n</script>`);

  const replacements = {
    "Ti?ng Vi?t": "Tiếng Việt",
    "C?i ??t": "Cài đặt",
    "ChuyỒn ngôn ngữ": "Chuyển ngôn ngữ",
    "C?ch ch?i": "Cách chơi",
    "Ch?m tr?i ho?c ph?i ?? nh?y ??ng h??ng": "Chạm trái hoặc phải để nhảy đúng hướng",
    "Block ?? ?i qua s? r?i": "Block đã đi qua sẽ rơi",
    "t? b??c 5, ??ng qu? l?u l?m block hi?n t?i s?p": "từ bước 5, đứng quá lâu làm block hiện tại sụp",
    "Online b?t ??u r?i khi t?t c? ng??i ch?i qua b??c 10": "Online bắt đầu rơi khi tất cả người chơi qua bước 10",
    "timer t?nh theo ng??i ?i sau c?ng": "timer tính theo người đi sau cùng",
    "T?n hi?n th?": "Tên hiển thị",
    "Nh?p code": "Nhập code",
    "T?o ph?ng": "Tạo phòng",
    "V?o": "Vào",
    "B?t ??u": "Bắt đầu",
    "K? l?c m?i!": "Kỷ lục mới!",
    "H?i sinh ch?i ti?p": "Hồi sinh chơi tiếp",
    "\\u1ecdn n\\u1ec1n": "ọn nền",
    "M\\u1edf kh\\u00f3a n\\u1ec1n": "Mở khóa nền",
    "Xem h\\u1ebft qu\\u1ea3ng c\\u00e1o \\u0111\\u1ec3 nh\\u1eadn background": "Xem hết quảng cáo để nhận background",
    "Nh\\u1eadn": "Nhận",
    "Nh?n v?t tr??c": "Nhân vật trước"
  };

  for (const [bad, good] of Object.entries(replacements)) {
    newHtml = newHtml.split(bad).join(good);
  }

  // Now we need to REPLACE whatever rendering logic V2 uses with V1's drawCharacter.
  // Wait, let's look at V1's original drawing functions. I will extract them from V1 (Cubejump.htm).
  const v1Html = fs.readFileSync('Cubejump.htm', 'utf8');

  // We need to inject V1's drawing code if it's missing, but V2 might already have a drawCharacter function if it's not actually using WebGL!
  // Wait, what did the reviewer mean by "The patch completely removes the drawCharacter function... and replaces it with a WebGL/Three.js layer (gameplayPetLayer)"?
  // They said: "Because this file is neither provided nor inlined in the single HTML file, the import will fail..."
  // Oh, wait! The user said: "V2 KHÔNG hề sử dụng WebGL / Three.js / blockpet-models.js ... Có thể cậu đã vô tình lấy nhầm bản V2 thử nghiệm ... Hoặc reviewer đang dùng một phiên bản cache khác của website."
  // So V2 REALLY DOES NOT use blockpet-models!
  // But wait, when I curl V2, I don't see blockpet-models either.
  // Let me just save it to a new file and inspect it.

  fs.writeFileSync('bundled.html', newHtml, 'utf8');
  console.log('Done bundling to bundled.html!');
}

run();
