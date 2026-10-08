// Restyle-only build: re-publish the doubts page with the CURRENT viewer-template.html
// WITHOUT touching Discord. It reads the doubts already on the live page and fills the
// template the same way tag-doubts.js does. The weekly workflow (build.yml) is still the
// only thing that pulls new doubts from Discord.
//
//   node restyle-only.js            -> writes public/index.html + public/threads.json
//
// Refuses to write anything if the live data can't be read, so a bad fetch never
// publishes an empty page.
const fs = require('fs');
const path = require('path');

const LIVE_URL = process.env.LIVE_URL || 'https://iteachchem.github.io/iteachchem-doubts/';
const SERVER_NAME = process.env.SERVER_NAME || 'iTeachChem';
const OUTPUT_FILE = process.env.OUTPUT_FILE || 'public/index.html';
const DATA_FILE = process.env.DATA_FILE || 'public/threads.json';
const { loadLive, writeBuild } = require('./live-data.js');

(async () => {
  const { records, html: live } = await loadLive(LIVE_URL);
  const shown = live.match(/id="thread-count">(\d+)</);
  if (!records.length || (shown && Number(shown[1]) !== records.length))
    throw new Error(`data looks wrong: ${records.length} records, page says ${shown && shown[1]}`);
  // keep the date of the last real Discord pull — a restyle doesn't make the data newer
  const updated = (live.match(/Updated ([A-Z][a-z]+ \d{4})/) || [])[1] || 'recently';

  const tmpl = fs.readFileSync(path.join(__dirname, 'viewer-template.html'), 'utf8');
  writeBuild(tmpl, records, { outputFile: OUTPUT_FILE, dataFile: DATA_FILE, serverName: SERVER_NAME, updated });
  console.log(`✓ Restyled ${OUTPUT_FILE} + ${DATA_FILE} with ${records.length} existing doubts (data from ${updated}). Discord not contacted.`);
})().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
