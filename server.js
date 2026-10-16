// Brew Log server: serves index.html and keeps all data in one JSON file.
// No dependencies. Env: PORT (80), APP_DIR (/app), DATA_DIR (/data)
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = +process.env.PORT || 80;
const APP = process.env.APP_DIR || '/app';
const DATA = process.env.DATA_DIR || '/data';
const FILE = path.join(DATA, 'brewlog.json');
const BK = path.join(DATA, 'backups');
fs.mkdirSync(BK, { recursive: true });

let cur;
try { cur = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { cur = { rev: 0, data: null }; }

function save(obj) {
  const today = new Date().toISOString().slice(0, 10);
  const bf = path.join(BK, 'brewlog-' + today + '.json');
  try { if (fs.existsSync(FILE) && !fs.existsSync(bf)) fs.copyFileSync(FILE, bf); } catch (e) {}
  try {
    const old = fs.readdirSync(BK).filter(f => /^brewlog-.*\.json$/.test(f)).sort();
    old.slice(0, Math.max(0, old.length - 30)).forEach(f => fs.unlinkSync(path.join(BK, f)));
  } catch (e) {}
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 1));
  fs.renameSync(tmp, FILE);
}

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json', 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

// Where "Update app" downloads from. Defaults to the original repo; set BREWLOG_REPO (owner/name) to follow your own fork.
const REPO = process.env.BREWLOG_REPO || 'rb9999/brew-log', BRANCH = process.env.BREWLOG_BRANCH || 'main';
async function getFile(name) {
  const base = process.env.UPDATE_BASE; // for testing only
  if (base) { const r = await fetch(base + '/' + name); if (!r.ok) throw new Error(name + ': HTTP ' + r.status); return await r.text(); }
  try {
    const r = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + name + '?ref=' + BRANCH,
      { headers: { Accept: 'application/vnd.github.raw', 'User-Agent': 'brewlog' } });
    if (r.ok) return await r.text();
  } catch (e) {}
  const r = await fetch('https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/' + name + '?t=' + Date.now(), { headers: { 'User-Agent': 'brewlog' } });
  if (!r.ok) throw new Error(name + ': HTTP ' + r.status);
  return await r.text();
}
const CHECKS = { 'index.html': t => t.includes('</html>') && t.includes('Brew Log'), 'server.js': t => t.includes('http.createServer') };
async function updateApp() {
  const changed = [];
  for (const name of Object.keys(CHECKS)) {
    const text = await getFile(name);
    if (!CHECKS[name](text)) throw new Error(name + ' downloaded but did not look right, so nothing was changed');
    const dest = path.join(APP, name);
    let old = ''; try { old = fs.readFileSync(dest, 'utf8'); } catch (e) {}
    if (old === text) continue;
    try { fs.writeFileSync(dest + '.tmp', text); fs.renameSync(dest + '.tmp', dest); }
    catch (e) { throw new Error('The app folder is read-only. Remove ":ro" from the first volume line in the compose file and update the project. (' + e.code + ')'); }
    changed.push(name);
  }
  return changed;
}

http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/api/data' && req.method === 'GET') return send(res, 200, cur);
  if (url === '/api/data' && req.method === 'PUT') {
    let buf = '';
    req.on('data', c => { buf += c; if (buf.length > 20e6) req.destroy(); });
    req.on('end', () => {
      let b;
      try { b = JSON.parse(buf); } catch (e) { return send(res, 400, { error: 'bad json' }); }
      if (!b || typeof b.data !== 'object' || !Array.isArray(b.data.history) || !Array.isArray(b.data.coffees)) return send(res, 400, { error: 'bad data' });
      if (b.baseRev !== cur.rev) return send(res, 409, cur);
      cur = { rev: cur.rev + 1, saved: new Date().toISOString(), data: b.data };
      try { save(cur); } catch (e) { return send(res, 500, { error: 'write failed' }); }
      send(res, 200, { rev: cur.rev });
    });
    return;
  }
  if (url === '/api/update' && req.method === 'POST') {
    updateApp().then(changed => {
      const restart = changed.includes('server.js');
      send(res, 200, { updated: changed, restart });
      if (restart) setTimeout(() => process.exit(0), 500); // Docker restarts the container
    }).catch(e => send(res, 500, { error: String(e.message || e) }));
    return;
  }
  if (url === '/' || url === '/index.html') {
    fs.readFile(path.join(APP, 'index.html'), (e, d) => e ? send(res, 404, 'index.html not found', 'text/plain') : send(res, 200, d, 'text/html; charset=utf-8'));
    return;
  }
  send(res, 404, 'not found', 'text/plain');
}).listen(PORT, () => console.log('Brew Log on :' + PORT + ', data in ' + FILE));
