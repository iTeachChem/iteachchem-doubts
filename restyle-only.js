// Restyle-only build: re-publish the doubts page with the CURRENT viewer-template.html
// WITHOUT touching Discord. It reads the doubts already on the live page and fills the
// template the same way tag-doubts.js does. The weekly workflow (build.yml) is still the
// only thing that pulls new doubts from Discord.
//
//   node restyle-only.js            -> writes public/index.html
//
// Refuses to write anything if the live data can't be read, so a bad fetch never
// publishes an empty page.
const fs = require('fs');
const path = require('path');

const LIVE_URL = process.env.LIVE_URL || 'https://iteachchem.github.io/iteachchem-doubts/';
const SERVER_NAME = process.env.SERVER_NAME || 'iTeachChem';
const OUTPUT_FILE = process.env.OUTPUT_FILE || 'public/index.html';

(async () => {
  const res = await fetch(LIVE_URL + '?nocache=' + Date.now());
  if (!res.ok) throw new Error(`could not read the live page: HTTP ${res.status}`);
  const live = await res.text();

  // the data line looks like:  const THREADS = [ ...one line of JSON... ];
  const m = live.match(/const THREADS = (\[[\s\S]*?\]);\s*\n/);
  if (!m) throw new Error('no THREADS data found on the live page');
  const records = JSON.parse(m[1]);
  const shown = live.match(/id="thread-count">(\d+)</);
  if (!records.length || (shown && Number(shown[1]) !== records.length))
    throw new Error(`data looks wrong: ${records.length} records, page says ${shown && shown[1]}`);
  // keep the date of the last real Discord pull — a restyle doesn't make the data newer
  const updated = (live.match(/Updated ([A-Z][a-z]+ \d{4})/) || [])[1] || 'recently';

  const tmpl = fs.readFileSync(path.join(__dirname, 'viewer-template.html'), 'utf8');
  if ((tmpl.match(/\/\*__DATA__\*\//g) || []).length !== 1) throw new Error('/*__DATA__*/ must appear exactly once in the template');
  const html = tmpl
    .replace('/*__DATA__*/', JSON.stringify(records))
    .replace(/__SERVER_NAME__/g, SERVER_NAME.replace(/[<>]/g, ''))
    .replace(/__UPDATED__/g, updated)
    .replace(/__COUNT__/g, String(records.length));

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, html);
  console.log(`✓ Restyled ${OUTPUT_FILE} with ${records.length} existing doubts (data from ${updated}). Discord not contacted.`);
})().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
