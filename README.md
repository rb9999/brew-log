# Brew Log

A pour-over brew log: enter brews the way they are written on the paper card, then search them, see trends and get ideas for the next brew.

Live: https://rb9999.github.io/brew-log/

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
