# Intellistar Emulator (prototype)

This repository contains a prototype Intellistar-style weather emulator built with Flask and Pillow. It renders a 1280×720 "Intellistar-like" card with background image support, optional logo, and an optional OpenWeather integration for current conditions.

This branch includes PWA support and Chromebook-friendly packaging so the app can be installed on Chrome OS as a Progressive Web App (PWA) and run fullscreen like a kiosk.

## What's included

- app.py — Flask server + renderer, Chromebook-only heuristic enforcement, PWA support (manifest + service worker)
- requirements.txt — Python dependencies
- static/manifest.json — Web App Manifest for PWA install
- static/sw.js — Service Worker providing basic offline caching
- static/icon.svg — Placeholder app icon (used by the manifest)

## Run locally

1. Install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. (Optional) Set OpenWeather API key

```bash
export OPENWEATHER_API_KEY=your_openweather_api_key
```

3. Run the app

```bash
python app.py
```

4. Open the site on a Chromebook

Point your Chromebook browser to `http://<host>:5000/`. The page will detect Chrome OS and show the live image. From the Chrome menu, choose "Install app" or "Install Intellistar Emulator" to add it to the shelf. You can then open it fullscreen.

## PWA / Kiosk installation notes (Chromebook)

- To install the app on Chrome for Chrome OS:
  1. Open the site in Chrome on your Chromebook.
  2. Click the Chrome menu (three dots) and choose "Install app" or the install icon in the address bar.
  3. After install, open the app from the shelf and use Chrome's window controls to go fullscreen.

- For an enterprise-managed Chromebook fleet consider using kiosk mode via Google Admin Console for automatic app deployment.

## Files to customize

- `static/manifest.json` — customize the name, icons, and start_url as needed.
- `static/sw.js` — the service worker contains a basic cache list and fetch handler — expand it for more robust offline behavior.
- `app.py` — the renderer and layout; change fonts, sizes, and artwork as desired.

## Security / Production notes

- The Chromebook-only restriction is heuristic (user-agent / client hints). It can be spoofed. For stronger protection, add authentication (OAuth) or device enrollment.
- Consider building a Docker image for deployment and running behind HTTPS.

## TODO

- Add Dockerfile and systemd service
- Replace placeholder artwork with licensed assets
- Add scheduling/caching for periodic updates
- Add radar tile overlay option
