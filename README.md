# Brew Log

A pour-over brew log. Enter each brew the way you would write it on a paper index card, then search your brews, see trends (including the grind, water temperature and drawdown that have worked best) and get ideas for the next cup.

Features: brew log with pour schedules (including Switch valve timing), coffees and bags, a dose calculator, tare weights, notes and trends. It is one HTML file with no build step and no dependencies, made for phones and tablets.

> **Read this first: security and trust**
> - **The server has no login.** Anyone who can reach its address can read and change your data. Keep it on your home network or behind a VPN such as Tailscale. Do not expose it to the internet.
> - **"Update app" downloads and runs code.** The button makes the server fetch `index.html` and `server.js` from GitHub and run them. By default it follows this repo (`rb9999/brew-log`), so you would be running whatever is pushed here. To stay in control, fork this repo and set `BREWLOG_REPO` to your fork (step 3 below). Only point it at a repo you trust.

## Where your data lives

- **With the server (recommended):** everything is saved in one file, `data/brewlog.json`, plus a daily copy in `data/backups/` (the last 30 are kept). Every phone, tablet and computer that opens the page shares it.
- **Without the server** (opening `index.html` directly, or hosting it on a static site): data is kept in that browser only.
- **Backups:** the **...** menu at the bottom of the page has **Export backup** and **Import backup** (a JSON file you can keep anywhere).
- Your data is never stored in this repo.

## Install with Docker (Synology, Linux, anything that runs Docker Compose)

1. **Fork this repo** on GitHub (so updates come from you, not from the original author), then download it or `git clone` your fork.
2. **Pick a folder** on your NAS or server and put `index.html`, `server.js` and `docker-compose.yml` in it. Create an empty folder named `data` next to them.
   The example uses `/volume1/docker/brewlog` (Synology). On Linux something like `/opt/brewlog` works.
3. **Edit `docker-compose.yml`.**
   - Change the two folder paths under `volumes:` (the part before the `:`) to your folder and its `data` folder.
   - Uncomment `BREWLOG_REPO` and set it to your fork, for example `your-name/brew-log`.
4. **Start it.** On a Docker host run `docker compose up -d` in that folder. On Synology use Container Manager > Project > Create, pick the folder and its `docker-compose.yml`.
5. **Open** `http://<your-server>:8085` in a browser. On a phone, use "Add to Home screen" for an app-like icon.

## Install without Docker

You need Node.js 18 or newer. In a folder holding `index.html` and `server.js`:

```
PORT=8085 APP_DIR=. DATA_DIR=./data node server.js
```

Then open `http://localhost:8085`. Keep it running with your usual tool (systemd, pm2 and so on).

## Updating

Tap **Update app** at the bottom of the page. The server downloads the latest `index.html` and `server.js` from the repo named in `BREWLOG_REPO` and reloads (the container restarts by itself if `server.js` changed). To change the app, edit your fork on GitHub and tap the button.

## Notes

- **Water calculator link (optional):** the **...** menu in the tab bar has "Water calculator". The first time you tap it, it asks for the web address of your own brewing-water calculator, remembers it (saved with your data, so every device gets it) and opens it inside Brew Log with a Back button. Change the address, or hide or show the menu entry, under **...** at the bottom of the page > Water calculator settings. If a calculator page stays blank inside Brew Log (some sites refuse to be shown inside another page), use "Open directly".
- The page loads its fonts from Google Fonts. If that is blocked it falls back to system fonts and everything still works.
- On Linux the container runs as root, so the files in `data/` are owned by root.
- Licensed under the MIT license (see `LICENSE`).
