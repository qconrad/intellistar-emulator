#!/usr/bin/env python3
"""
Intellistar-style emulator (Chromebook-only access check) with PWA support
- Only allows requests that look like they're coming from Chrome OS / Chromebooks.
- Adds a web app manifest and service worker for PWA install on Chromebooks.

Usage:
- pip install -r requirements.txt
- export OPENWEATHER_API_KEY=your_key_here (optional)
- python app.py
- Open http://<host>:5000/ on a Chromebook and install the app via the Chrome menu -> Install app

Note: UA/client-hint checks are heuristic and can be spoofed. For production, use stronger auth/enrollment.
"""
from io import BytesIO
import os
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from flask import Flask, request, send_file, abort, render_template_string, send_from_directory

app = Flask(__name__, static_folder="static")

# --- config ---
WIDTH, HEIGHT = 1280, 720
LEFT_PANEL_W = 240
CARD_W, CARD_H = 720, 260

# fonts
def load_font(path_list, size):
    for p in path_list:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()

FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/Library/Fonts/Arial.ttf",
]
FONT_LARGE = load_font(FONT_PATHS, 72)
FONT_MED = load_font(FONT_PATHS, 36)
FONT_SMALL = load_font(FONT_PATHS, 20)
FONT_TINY = load_font(FONT_PATHS, 14)

# --- helper: detect Chromebook ---
def is_chromebook_request(req):
    """
    Heuristic detection for Chrome OS:
     - Prefer Sec-CH-UA-Platform (client hints) if present and equals "Chrome OS" or "Chromium OS"
     - Fallback to User-Agent containing 'CrOS' or 'Chrome OS' or 'Chromebook'
    This is a heuristic and can be spoofed.
    """
    # Client Hints (may be present if the browser sends them)
    ch_platform = req.headers.get("Sec-CH-UA-Platform") or req.headers.get("Sec-CH-UA-Platform".lower())
    if ch_platform:
        # client hints often include quotes, e.g. '"Chrome OS"'
        ch = ch_platform.replace('"', '').strip().lower()
        if "chrome os" in ch or "cros" in ch or "chromium os" in ch:
            return True

    ua = req.headers.get("User-Agent", "").lower()
    # Chrome OS user agents include "CrOS" (case sensitive typically), check lowercased
    if "cros" in ua or "chrome os" in ua or "chromebook" in ua:
        return True

    return False

# --- image helpers (unchanged from prototype, trimmed) ---
def fetch_image(url_or_path, max_size=None):
    if not url_or_path:
        return None
    if os.path.exists(url_or_path):
        try:
            img = Image.open(url_or_path).convert("RGBA")
            if max_size:
                img.thumbnail(max_size, Image.LANCZOS)
            return img
        except Exception:
            return None
    try:
        r = requests.get(url_or_path, timeout=6, stream=True)
        r.raise_for_status()
        img = Image.open(r.raw).convert("RGBA")
        if max_size:
            img.thumbnail(max_size, Image.LANCZOS)
        return img
    except Exception:
        return None

def fetch_weather_simple(lat, lon, key):
    if not (lat and lon and key):
        return None
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"lat": lat, "lon": lon, "units": "imperial", "appid": key}
        r = requests.get(url, params=params, timeout=6)
        r.raise_for_status()
        j = r.json()
        return {
            "temp": int(round(j.get("main", {}).get("temp", 0))),
            "desc": j.get("weather", [{}])[0].get("description", "").title()
        }
    except Exception:
        return None


def make_layout(background_img, logo_img, city="LOCAL", left_text="LOCAL ON 18s", weather=None):
    # Prepare base
    if background_img:
        bg = background_img.convert("RGB").resize((WIDTH, HEIGHT), Image.LANCZOS)
    else:
        bg = Image.new("RGB", (WIDTH, HEIGHT), (120, 160, 200))
        draw = ImageDraw.Draw(bg)
        for i in range(HEIGHT):
            c = int(200 - (i / HEIGHT) * 80)
            draw.line([(0, i), (WIDTH, i)], fill=(c+20, c+40, c+80))
    canvas = Image.new("RGBA", (WIDTH, HEIGHT))
    canvas.paste(bg, (0, 0))
    draw = ImageDraw.Draw(canvas)

    # logo
    if logo_img:
        logo_max = (120, 60)
        l = logo_img.copy()
        l.thumbnail(logo_max, Image.LANCZOS)
        canvas.paste(l, (12, 12), l)
    else:
        draw.rectangle((12, 12, 12+120, 12+28), fill=(30, 40, 60, 220))
        draw.text((20, 14), "CHANNEL", font=FONT_TINY, fill=(230, 230, 230))

    # left panel
    left_x = 24
    left_y = 100
    panel_h = 360
    rounded_box = Image.new("RGBA", (LEFT_PANEL_W, panel_h), (18, 28, 44, 220))
    canvas.paste(rounded_box, (left_x, left_y), rounded_box)
    bx = left_x + 18
    by = left_y + 28
    draw.text((bx, by), left_text.upper(), font=FONT_MED, fill=(240, 245, 250))
    draw.rectangle((left_x + 18, by + 72, left_x + LEFT_PANEL_W - 18, by + 72 + 120), fill=(28, 40, 60, 180))
    draw.text((left_x + 40, by + 86), "8", font=FONT_LARGE, fill=(200, 220, 230, 240))

    # center card
    card_x = int((WIDTH - CARD_W) / 2) + 80
    card_y = left_y + 36
    card = Image.new("RGBA", (CARD_W, CARD_H), (20, 30, 50, 180))
    card_blur = card.filter(ImageFilter.GaussianBlur(radius=0.5))
    canvas.paste(card_blur, (card_x, card_y), card_blur)
    cd = ImageDraw.Draw(canvas)
    cd.rectangle((card_x, card_y, card_x + CARD_W, card_y + CARD_H), outline=(255,255,255,30))

    greeting = "HELLO"
    city_text = city.upper()
    g_x = card_x + 28
    g_y = card_y + 28
    draw.text((g_x, g_y), greeting, font=FONT_SMALL, fill=(210,230,240))
    draw.text((g_x, g_y + 32), city_text + ",", font=FONT_LARGE, fill=(255,255,255))
    if weather:
        wline = f"{weather.get('desc', '')}  ·  {weather.get('temp', '')}°F"
        draw.text((g_x, g_y + 120), wline, font=FONT_MED, fill=(200,220,230))
    draw.text((card_x + CARD_W - 220, card_y + CARD_H - 42), "LOCAL ON 18s", font=FONT_SMALL, fill=(180,200,220))
    return canvas.convert("RGB")

# --- routes with Chromebook-only enforcement and PWA support ---

def require_chromebook_or_block():
    if not is_chromebook_request(request):
        # respond with friendly HTML explaining restriction
        return render_template_string("""
          <html><body style="font-family:sans-serif;background:#111;color:#eee;padding:28px">
            <h2>Access restricted</h2>
            <p>This emulator is only accessible from a Chromebook device.</p>
            <p>Please open this URL on a Chromebook. If you are on a Chromebook and still see this, your browser may be blocking client hints or altering the user agent.</p>
            <p><strong>Tip:</strong> open this link on your Chromebook's browser or scan it with your Chromebook camera to open directly.</p>
            <p><a href="/">Back</a></p>
          </body></html>
        """), 403
    return None

@app.route('/sw.js')
def service_worker():
    # Serve the service worker from the static folder so its scope is '/'
    return send_from_directory(app.static_folder, 'sw.js')

@app.route("/star.png")
def star_png():
    block = require_chromebook_or_block()
    if block:
        return block

    city = request.args.get("city", "GREENVILLE")
    bg = request.args.get("bg")
    logo = request.args.get("logo")
    left_text = request.args.get("left_text", "Local on 18s")
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    key = request.args.get("key") or os.getenv("OPENWEATHER_API_KEY")

    bg_img = fetch_image(bg, max_size=(WIDTH, HEIGHT)) if bg else None
    logo_img = fetch_image(logo, max_size=(160,80)) if logo else None
    weather = fetch_weather_simple(lat, lon, key) if (lat and lon and key) else None

    img = make_layout(bg_img, logo_img, city=city, left_text=left_text, weather=weather)
    bio = BytesIO()
    img.save(bio, "PNG", optimize=True)
    bio.seek(0)
    return send_file(bio, mimetype="image/png", as_attachment=False, attachment_filename="star.png")

@app.route("/")
def index():
    # client-side JS will also check for Chromebook and show a message if not
    return render_template_string("""
      <!doctype html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <link rel="manifest" href="/static/manifest.json">
          <title>Intellistar Emulator (Chromebook only)</title>
          <style>body{font-family:sans-serif;background:#000;color:#fff;margin:0;padding:18px}</style>
        </head>
        <body>
          <h2>Intellistar Emulator</h2>
          <p>This demo is restricted to Chromebook devices. If you are on a Chromebook, you'll see the live image below and can install the app as a PWA.</p>
          <div id="blocked" style="display:none;background:#220;color:#fff;padding:16px;border-radius:8px;">
            <h3>Access restricted</h3>
            <p>This app only runs on Chromebooks. Please open this URL in your Chromebook's Chrome browser.</p>
          </div>
          <div id="viewer" style="display:none">
            <p>Example: <code>/star.png?city=Greenville</code></p>
            <img id="star" src="/star.png?city=Greenville" style="max-width:100%;border:3px solid #222">
          </div>
          <script>
            function isChromebookClient() {
              try {
                // Prefer userAgentData when available
                if (navigator.userAgentData && navigator.userAgentData.platform) {
                  var p = navigator.userAgentData.platform.toLowerCase();
                  if (p.indexOf('chrome os') !== -1 || p.indexOf('cros') !== -1 || p.indexOf('chromeos') !== -1) return true;
                }
              } catch(e){}
              var ua = navigator.userAgent.toLowerCase();
              if (ua.indexOf('cros') !== -1 || ua.indexOf('chrome os') !== -1 || ua.indexOf('chromebook') !== -1) return true;
              return false;
            }
            if (isChromebookClient()) {
              document.getElementById('viewer').style.display = 'block';
              // register service worker for PWA features
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').then(function(reg){
                  console.log('Service worker registered.', reg);
                }).catch(function(err){
                  console.warn('Service worker registration failed:', err);
                });
              }
            } else {
              document.getElementById('blocked').style.display = 'block';
            }
          </script>
        </body>
      </html>
    """)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
