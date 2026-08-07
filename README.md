# Intellistar Emulator (prototype)

This repository contains a prototype Intellistar-style weather emulator built with Flask and Pillow. It renders a 1280×720 "Intellistar-like" card with background image support, optional logo, and an optional OpenWeather integration for current conditions.

This branch includes PWA support and Chromebook-friendly packaging so the app can be installed on Chrome OS as a Progressive Web App (PWA) and run fullscreen like a kiosk.

## What's included

- app.py — Flask server + renderer, Chromebook-only heuristic enforcement, PWA support (manifest + service worker)
- requirements.txt — Python dependencies
- static/manifest.json — Web App Manifest for PWA install
- static/sw.js — Service Worker providing basic offline caching
- static/icon.svg — Placeholder app icon (used by the manifest)
- static/icons/* — placeholder PNG maskable icons (192 and 512)

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

## HTTPS via Cloudflare Tunnel (no public IP required)

This repository includes a docker-compose setup that runs the emulator and a Cloudflare Tunnel (cloudflared) so you can serve the app over HTTPS without opening firewall ports or owning a public IP.

There are two modes:

A) Quick test (ephemeral, no DNS configuration)
- This creates a temporary https://*.trycloudflare.com URL that forwards to your local app. Not suitable for production but great for quick testing.

B) Persistent / Production (recommended)
- Create a Cloudflare Tunnel via the Cloudflare Zero Trust dashboard, create a persistent Tunnel name, and map a DNS CNAME in your domain to the tunnel. Run cloudflared with the tunnel credentials for a stable hostname under your domain.

### Setup using docker-compose (supports both modes)

1. Make sure you have Docker & Docker Compose installed.
2. Create a `.env` file in the repo root with any of the following variables you need:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
# Optional: if you have a tunnel token (for quick authenticated run)
TUNNEL_TOKEN=
# Optional: the tunnel name/credentials file approach will be described below
```

3. Start the services:

```bash
docker-compose up -d --build
```

- Quick ephemeral test (no Cloudflare account required): leave `TUNNEL_TOKEN` empty — cloudflared will create a temporary public URL on trycloudflare.com and print it in the container logs.
- Persistent/production: create a Tunnel in Cloudflare Zero Trust > Tunnels, generate credentials and follow the Cloudflare docs to attach a DNS name to the tunnel. You can mount the tunnel credentials into the cloudflared container (see examples below) or use a tunnel token.

4. View logs to get the public URL (ephemeral) or verify tunnel is running:

```bash
docker-compose logs -f cloudflared
```

### Example: run a persistent tunnel with a credentials file

1. Create a tunnel in Cloudflare and download the credentials JSON for the tunnel.
2. Place the credentials JSON on your host, e.g. `/opt/cloudflared/<TUNNEL_NAME>.json`.
3. Update `docker-compose.yml` to mount the credentials and run `cloudflared tunnel run <TUNNEL_NAME>` (see commented example in the repository).

### Notes and security

- The Cloudflare Tunnel approach allows HTTPS termination via Cloudflare and avoids exposing your host to the public internet directly.
- If you use the ephemeral trycloudflare URL, be aware the URL may change each run and is not suitable for production or long-term use.
- For production, create a named tunnel, map DNS from your domain to the tunnel, and use the downloaded tunnel credentials for long-running tunnels.

## Files to customize

- `static/manifest.json` — customize the name, icons, and start_url as needed.
- `static/sw.js` — the service worker contains a basic cache list and fetch handler — expand it for more robust offline behavior.
- `app.py` — the renderer and layout; change fonts, sizes, and artwork as desired.

## Security / Production notes

- The Chromebook-only restriction is heuristic (user-agent / client hints). It can be spoofed. For stronger protection, add authentication (OAuth) or device enrollment.
- Consider running the app behind HTTPS using the Cloudflare Tunnel as documented above.

## TODO

- Add Dockerfile and systemd service
- Replace placeholder artwork with licensed assets
- Add scheduling/caching for periodic updates
- Add radar tile overlay option
