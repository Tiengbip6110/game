import urllib.request
import re
import base64
import os
import json

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=10).read()

# 1. Fetch main html to find latest script and css versions dynamically
html = fetch("https://cubejump.app/").decode('utf-8')
rp_file = re.search(r'src="([^"]*resource-pack[^"]*)"', html).group(1)
engine_file = re.search(r'src="([^"]*engine[^"]*)"', html).group(1)
game_file = re.search(r'src="([^"]*game[^"]*)"', html).group(1)
online_file = re.search(r'src="([^"]*online[^"]*)"', html).group(1)
music_file = re.search(r'src="([^"]*cubejump-music[^"]*)"', html).group(1)
css_file = re.search(r'href="([^"]*style[^"]*\.css)"', html).group(1)

rp = fetch(f"https://cubejump.app/{rp_file}").decode('utf-8')
engine = fetch(f"https://cubejump.app/{engine_file}").decode('utf-8')
game = fetch(f"https://cubejump.app/{game_file}").decode('utf-8')
online = fetch(f"https://cubejump.app/{online_file}").decode('utf-8')
music = fetch(f"https://cubejump.app/{music_file}").decode('utf-8')
css = fetch(f"https://cubejump.app/{css_file}").decode('utf-8')

all_text = rp + engine + game + online + music + css
asset_urls = set(re.findall(r'(assets/[a-zA-Z0-9_/-]+\.(?:webp|png|jpg|jpeg|json|mp3|ogg|ttf|woff2))', all_text))
asset_urls.update([u.strip(' "\'') for u in re.findall(r'url\(([^)]+)\)', css) if not u.startswith('data:')])

# Add hardcoded dynamic asset paths that regex can't find but are known from typical game structures
dynamic_assets = [
    "assets/ui/play_button.png", "assets/ui/loading.png", "assets/ui/home.webp",
    "assets/backgrounds/stellar.webp", "assets/obstacles/bush.webp",
    "assets/cube/default.webp", "assets/cube/skin_1.webp"
]
for p in dynamic_assets: asset_urls.add(p)

base_url = "https://cubejump.app/"
b64_map = {}
for asset in asset_urls:
    try:
        data = fetch(base_url + asset)
        b64 = base64.b64encode(data).decode('utf-8')
        mime = "application/octet-stream"
        if asset.endswith('.webp'): mime = "image/webp"
        elif asset.endswith('.png'): mime = "image/png"
        elif asset.endswith('.jpg') or asset.endswith('.jpeg'): mime = "image/jpeg"
        elif asset.endswith('.mp3'): mime = "audio/mpeg"
        elif asset.endswith('.ogg'): mime = "audio/ogg"
        elif asset.endswith('.ttf'): mime = "font/ttf"
        b64_map[asset] = f"data:{mime};base64,{b64}"
    except:
        pass

for k, v in b64_map.items():
    rp = rp.replace(k, v)
    engine = engine.replace(k, v)
    game = game.replace(k, v)
    online = online.replace(k, v)
    music = music.replace(k, v)
    css = css.replace(k, v)
    css = css.replace(f"/{k}", v)

# 3. Custom Pet and intercepts
pet_img = "/tmp/file_attachments/IMG_20260607_121047.jpg"
b64_pet = ""
PET_IMAGE_BASE64_DECLARATION = ""
if os.path.exists(pet_img):
    with open(pet_img, "rb") as f:
        b64_pet = base64.b64encode(f.read()).decode('utf-8')
        PET_IMAGE_BASE64_DECLARATION = f'const PET_IMAGE_BASE64 = "data:image/jpeg;base64,{b64_pet}";'

script_interceptor = f"""
<script>
{PET_IMAGE_BASE64_DECLARATION}

const originalFetch = window.fetch;
window.fetch = async function() {{
    const url = arguments[0];
    if (typeof url === 'string') {{
        // Bỏ qua nếu url là base64 để tránh đệ quy vô hạn
        if (url.startsWith('data:')) {{
            return await originalFetch.apply(this, arguments);
        }}

        if (url.includes('/api/bot/session')) {{
            return new Response(JSON.stringify({{enabled: true, expiresAt: Date.now() + 86400000, maxAgeMs: 86400000}}), {{ status: 200 }});
        }}
        if (url.includes('/api/leaderboard')) {{
            let fakeData = [];
            for(let i=1; i<=100; i++) {{
                fakeData.push({{
                    rank: i,
                    name: "Bot Player " + i,
                    score: Math.floor(Math.random() * 1000) + (100-i)*10,
                    cubeSkinId: "default",
                    avatarUrl: ""
                }});
            }}
            return new Response(JSON.stringify({{ success: true, data: fakeData }}), {{ status: 200, headers: {{ 'Content-Type': 'application/json' }} }});
        }}

        if (typeof PET_IMAGE_BASE64 !== 'undefined' && url.toLowerCase().includes('pet') && !url.toLowerCase().includes('cube')) {{
            return fetch(PET_IMAGE_BASE64);
        }}
    }}
    try {{
        return await originalFetch.apply(this, arguments);
    }} catch(e) {{
        return new Response('{{}}', {{ status: 200 }});
    }}
}};

const oldImage = window.Image;
window.Image = function() {{
    const img = new oldImage();
    const oldSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    Object.defineProperty(img, 'src', {{
        set: function(val) {{
            if (typeof PET_IMAGE_BASE64 !== 'undefined' && val && typeof val === 'string' && !val.startsWith('data:') && val.toLowerCase().includes('pet') && !val.toLowerCase().includes('cube')) {{
                oldSrc.set.call(this, PET_IMAGE_BASE64);
            }} else {{
                oldSrc.set.call(this, val);
            }}
        }},
        get: function() {{ return oldSrc.get.call(this); }}
    }});
    return img;
}};

document.addEventListener("DOMContentLoaded", function() {{
    var onlineBtns = [
        document.getElementById("btnOnlineMode"),
        document.getElementById("playOnlineBtn"),
        document.getElementById("playOnlineDeathBtn"),
        document.getElementById("onlineJoinRoomChoiceBtn"),
        document.getElementById("onlineCreateRoomChoiceBtn"),
        document.getElementById("onlineQuickMatchChoiceBtn")
    ];
    onlineBtns.forEach(function(btn) {{
        if (btn) {{
            var newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener("click", function(e) {{
                e.preventDefault();
                e.stopPropagation();
                alert("Game offline");
            }}, true);
        }}
    }});
}});
</script>
"""

css_tag = re.search(r'<link rel="stylesheet"[^>]+>', html).group(0)
html = html.replace(css_tag, f"<style>\n{css}\n</style>")

script_tags = {
    rp_file: rp,
    engine_file: engine,
    game_file: game,
    online_file: online,
    music_file: music
}

for name, content in script_tags.items():
    tag_match = re.search(r'<script src=".*?' + re.escape(name) + r'[^"]*"></script>', html)
    if tag_match:
        html = html.replace(tag_match.group(0), f"<script>\n{content}\n</script>")

html = html.replace('<head>', '<head>\n' + script_interceptor)

with open("Cubejump_1.html", "w", encoding="utf-8") as f:
    f.write(html)
