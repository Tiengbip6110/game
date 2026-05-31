const fs = require('fs');
const https = require('https');
const http = require('http');

const data = JSON.parse(fs.readFileSync('firebase_data.json', 'utf8'));
const urlsToDownload = new Set();

data.book.pages.forEach(p => { if (p.image) urlsToDownload.add(p.image); });
data.galaxy.plates.forEach(p => { if (p.src) urlsToDownload.add(p.src); });
if (data.audio && data.audio.src) urlsToDownload.add(data.audio.src);

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

(async () => {
  if (!fs.existsSync('media')) {
    fs.mkdirSync('media');
  }

  const map = {};
  let i = 0;
  for (const url of urlsToDownload) {
    const ext = url.split('.').pop().split('?')[0].toLowerCase() || 'bin';
    let fileExt = ext;
    if (!['jpg', 'jpeg', 'png', 'webp', 'mp3', 'mp4', 'ogg', 'wav'].includes(ext)) {
       fileExt = url.includes('video') ? 'mp3' : 'jpg'; // Basic fallback
    }
    const filename = `media/file_${i++}.${fileExt}`;
    console.log(`Downloading ${url} to ${filename}`);
    try {
      await downloadFile(url, filename);
      map[url] = filename;
    } catch(e) {
      console.error(`Failed to download ${url}: ${e}`);
    }
  }

  fs.writeFileSync('media_map.json', JSON.stringify(map, null, 2));
  console.log('Done downloading media.');
})();
