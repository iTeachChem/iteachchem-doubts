// Shared by tag-doubts.js and restyle-only.js: read the doubts already on the live site,
// and write a build's page + data.
//
// The page keeps its doubts in threads.json beside index.html (a ~2 MB page is too big for
// Telegram's link preview). Older builds inlined them as `const THREADS = [...];`, so reading
// falls back to that.
const fs = require('fs');
const path = require('path');

const HEADERS = { 'User-Agent': 'DoubtIndexBot/1.0' };

// -> { records, html }   html is the live page (for its header count and "Updated" date)
async function loadLive(siteUrl) {
  const bust = '?nocache=' + Date.now();
  const res = await fetch(siteUrl + bust, { headers: HEADERS });
  if (!res.ok) throw new Error(`could not read the live page: HTTP ${res.status}`);
  const html = await res.text();

  const inline = html.match(/(?:const|let) THREADS = (\[[\s\S]*?\]);\s*\r?\n/);
  if (inline) return { records: JSON.parse(inline[1]), html };

  const data = await fetch(new URL('threads.json', siteUrl).href + bust, { headers: HEADERS });
  if (!data.ok) throw new Error(`could not read the live threads.json: HTTP ${data.status}`);
  return { records: await data.json(), html };
}

// Fills the template. With dataFile set, the doubts go to that file and the page fetches it;
// without it they're inlined, so a local build is still one file that opens offline.
function writeBuild(tmpl, records, { outputFile, dataFile, serverName, updated }) {
  if ((tmpl.match(/\/\*__DATA__\*\//g) || []).length !== 1) throw new Error('/*__DATA__*/ must appear exactly once in the template');
  const html = tmpl
    .replace('/*__DATA__*/', dataFile ? 'null' : JSON.stringify(records))
    .replace(/__SERVER_NAME__/g, serverName.replace(/[<>]/g, ''))
    .replace(/__UPDATED__/g, updated)
    .replace(/__COUNT__/g, String(records.length));
  fs.mkdirSync(path.dirname(path.resolve(outputFile)), { recursive: true });
  fs.writeFileSync(outputFile, html, 'utf8');
  if (dataFile) fs.writeFileSync(dataFile, JSON.stringify(records), 'utf8');
}

module.exports = { loadLive, writeBuild };
