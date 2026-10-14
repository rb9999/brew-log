# Brew Log

A pour-over brew log: enter brews the way they are written on the paper card, then search them, see trends and get ideas for the next brew.

Live: https://rb9999.github.io/brew-log/

- Single file (`index.html`), no build step, no dependencies.
- Data is saved in the browser's local storage on each device. Use **Export backup** in the footer to keep a copy, and **Import backup** to restore it.

## Self-hosting on a NAS

Copy `index.html` to `/volume1/docker/brewlog` on the NAS and run `docker-compose.yml`
(Synology Container Manager > Project). Open `http://<nas>:8085`. To update, replace
`index.html` and refresh. Brews are stored per browser and per address, so always use the
same URL; move data between addresses with Export backup / Import backup.
