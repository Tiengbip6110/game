const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mediaMap = JSON.parse(fs.readFileSync('media_map.json', 'utf8'));
const base64Map = {};
let totalSize = 0;

for (const [url, filepath] of Object.entries(mediaMap)) {
  const ext = filepath.split('.').pop();
  let finalFilepath = filepath;

  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
    // Compress and convert to webp
    const webpPath = filepath.replace(/\.[^.]+$/, '.webp');
    console.log(`Converting ${filepath} to ${webpPath}...`);
    try {
      execSync(`ffmpeg -i ${filepath} -qscale 30 -s 400x400 -y ${webpPath} >/dev/null 2>&1`);
      if (fs.existsSync(webpPath)) {
        finalFilepath = webpPath;
      }
    } catch(e) {
      console.log('ffmpeg failed, using original', e.message);
    }
  } else if (ext === 'mp3') {
     // Compress audio
     const compressedAudio = filepath.replace(/\.mp3$/, '_compressed.mp3');
     console.log(`Compressing ${filepath}...`);
     try {
       execSync(`ffmpeg -i ${filepath} -b:a 32k -y ${compressedAudio} >/dev/null 2>&1`);
       if (fs.existsSync(compressedAudio)) {
         finalFilepath = compressedAudio;
       }
     } catch (e) {
        console.log('ffmpeg audio compress failed', e.message);
     }
  }

  const buffer = fs.readFileSync(finalFilepath);
  const size = buffer.length;
  totalSize += size;

  let mimeType = 'image/jpeg';
  if (finalFilepath.endsWith('.webp')) mimeType = 'image/webp';
  if (finalFilepath.endsWith('.mp3')) mimeType = 'audio/mpeg';

  base64Map[url] = `data:${mimeType};base64,${buffer.toString('base64')}`;
}

console.log(`Total media size: ${totalSize / 1024 / 1024} MB`);
fs.writeFileSync('media_base64.json', JSON.stringify(base64Map, null, 2));
