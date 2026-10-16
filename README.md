# Brew Log

A pour-over brew log: enter brews the way they are written on the paper card, then search them, see trends and get ideas for the next brew.

- Single file (`index.html`), no build step, no dependencies.
- Data is saved in the browser's local storage on each device. Use **Export backup** in the footer to keep a copy, and **Import backup** to restore it.

## Self-hosting on a NAS

Put `index.html` and `server.js` in `/volume1/docker/brewlog`, create an empty `data` folder next to them, and run `docker-compose.yml`
(Synology Container Manager > Project). Open `http://<nas>:8085`.

All data is saved to one file, `data/brewlog.json`, with a daily copy in `data/backups/`
(last 30 kept). Every device that opens the page shares it. When the page is served
without the server (for example GitHub Pages) it falls back to browser storage only.

To update, tap **Update app** in the page footer. The NAS downloads the latest `index.html` and
`server.js` from this repo (the container restarts by itself if `server.js` changed).

## Installing your own copy

1. Fork this repo on GitHub (so updates come from you, not from the original author).
2. Copy `index.html`, `server.js` and `docker-compose.yml` into a folder on your NAS or Docker host and create an empty `data` folder next to them.
3. In `docker-compose.yml`, change the folder paths to match, and uncomment `BREWLOG_REPO` and set it to your fork, e.g. `your-name/brew-log`.
4. Start the project and open `http://<host>:8085`.

After that, edit your fork on GitHub and tap **Update app** in the page footer to pull the changes. The Update button downloads
`index.html` and `server.js` from the repo named in `BREWLOG_REPO` and the server runs that code, so only point it at a repo you trust.
Without `BREWLOG_REPO` it follows the original repo, `rb9999/brew-log`.

Your brews, coffees, pour schedules and notes live only in `data/brewlog.json` on your host. They are never stored in the repo.
The server has no login, so keep it on your home network or behind a VPN such as Tailscale and do not expose it to the internet.
