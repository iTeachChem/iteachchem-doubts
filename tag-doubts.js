#!/usr/bin/env node
/* ============================================================================
 * tag-doubts.js  —  Doubt Index builder for any Discord forum-channel "doubts" section
 * ----------------------------------------------------------------------------
 * What it does:
 *   1. Reads every thread (post) in your doubts FORUM channel via the Discord API.
 *   2. Figures out the subject from the forum's own tags (or the title as a fallback).
 *   3. Tags each doubt by NCERT/JEE chapter + sub-type using classify.js.
 *   4. Writes a single self-contained, offline HTML page: doubts_index.html
 *
 * SETUP — you only need TWO things (see README.md for the click-by-click):
 *   • BOT_TOKEN         your Discord bot token
 *   • FORUM_CHANNEL_ID  the ID of the forum channel that holds your doubts
 * The server (guild) ID is detected automatically. The bot must be in the
 * server with "View Channel" + "Read Message History" permission.
 *
 * RUN:  node tag-doubts.js
 * Needs Node 18+ (uses built-in fetch). No npm install required.
 * ==========================================================================*/

// ----------------------------- CONFIG --------------------------------------
const BOT_TOKEN        = process.env.DISCORD_TOKEN      || 'PASTE_YOUR_BOT_TOKEN_HERE';
const FORUM_CHANNEL_ID = process.env.FORUM_CHANNEL_ID   || 'PASTE_YOUR_FORUM_CHANNEL_ID_HERE';
const OUTPUT_FILE      = process.env.OUTPUT_FILE        || 'iteachchem_doubts_index_v5.html';
const SERVER_NAME      = process.env.SERVER_NAME        || 'iTeachChem';   // shown in the page header
// Optional: add an "AO" (Answer Overflow) button to every card. Only turn on
// if your server uses the Answer Overflow bot AND indexes this channel.
const ENABLE_AO_LINKS  = (process.env.ENABLE_AO_LINKS === 'true') || false;
// Fetch each doubt's opening message (text + whether it has an image). Slow: one API call per doubt.
// Set FETCH_CONTENT=false to skip and tag on titles only (fast, like before).
const FETCH_CONTENT    = (process.env.FETCH_CONTENT === 'false') ? false : true;
const PREVIEW_LEN      = Number(process.env.PREVIEW_LEN || 300);
// ---------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const { classify } = require('./classify.js');

const API = 'https://discord.com/api/v10';
const HEADERS = { Authorization: `Bot ${BOT_TOKEN}`, 'User-Agent': 'DoubtIndexBot/1.0' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(pathname) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(API + pathname, { headers: HEADERS });
    if (res.status === 429) {                    // rate limited — wait and retry
      const retry = Number(res.headers.get('retry-after') || 1);
      console.log(`  …rate limited, waiting ${retry}s`);
      await sleep((retry + 0.5) * 1000);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${pathname}\n${await res.text()}`);
    return res.json();
  }
  throw new Error('Too many rate-limit retries on ' + pathname);
}


// Fetch the opening message of a forum thread (its id == the thread id).
async function fetchStarter(threadId) {
  try {
    const msg = await api(`/channels/${threadId}/messages/${threadId}`);
    const content = (msg.content || '').replace(/\s+/g, ' ').trim();
    const atts = msg.attachments || [];
    const embeds = msg.embeds || [];
    const hasImage =
      atts.some(a => (a.content_type || '').startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(a.filename || a.url || '')) ||
      embeds.some(e => e.type === 'image' || e.image || e.thumbnail);
    return { content, hasImage };
  } catch (e) { return { content: '', hasImage: false }; }
}

// --- Subject detection -----------------------------------------------------
// Maps your forum's tag NAMES to subjects. Edit/extend if your tags differ.
function subjectFromTags(appliedTagIds, tagNameById) {
  for (const id of appliedTagIds || []) {
    const name = (tagNameById[id] || '').toLowerCase();
    if (/physic/.test(name))            return 'physics';
    if (/chem/.test(name))              return 'chemistry';
    if (/math|maths/.test(name))        return 'maths';
    if (/bio|biology/.test(name))       return 'biology';
  }
  return null;
}
// Fallback when no subject tag matches — scores keywords in the title.
function subjectFromTitle(title) {
  const t = (title || '').toLowerCase();
  const score = re => (t.match(re) || []).length;
  const phys = score(/physic|newton|optic|wave|electric|magnetic|capacitor|current|nlm|shm|projectile|friction/g);
  const math = score(/math|calculus|integrat|differenti|algebra|vector|trigono|probabilit|matrix|binomial|pnc|limit/g);
  const bio  = score(/\bbio|cell|genetic|plant|physiology|reproduction|ecology|enzyme|chromosome/g);
  const chem = score(/chem|organ|reaction|bond|equilibri|acid|mole|kinetic|isomer|oxidat|periodic|element|salt/g);
  const max = Math.max(phys, math, bio, chem);
  if (max === 0) return null;                    // truly unknown -> leave for default
  if (phys === max) return 'physics';
  if (math === max) return 'maths';
  if (bio  === max) return 'biology';
  return 'chemistry';
}
const DEFAULT_SUBJECT = 'chemistry';             // used only when title gives zero signal

// --- Fetch every thread in the forum --------------------------------------
async function fetchAllThreads(guildId) {
  const byId = new Map();

  // 1) Active (non-archived) threads in the whole guild, filtered to our forum.
  try {
    const active = await api(`/guilds/${guildId}/threads/active`);
    (active.threads || []).forEach(th => { if (th.parent_id === FORUM_CHANNEL_ID) byId.set(th.id, th); });
    console.log(`  active threads in forum: ${byId.size}`);
  } catch (e) { console.log('  (could not fetch active threads:', e.message, ')'); }

  // 2) Archived public threads — paginated.
  let before = null, page = 0;
  while (true) {
    const q = `?limit=100` + (before ? `&before=${encodeURIComponent(before)}` : '');
    const data = await api(`/channels/${FORUM_CHANNEL_ID}/threads/archived/public${q}`);
    const threads = data.threads || [];
    threads.forEach(th => byId.set(th.id, th));
    page++;
    console.log(`  archived page ${page}: +${threads.length} (total ${byId.size})`);
    if (!data.has_more || threads.length === 0) break;
    const last = threads[threads.length - 1];
    before = last?.thread_metadata?.archive_timestamp;
    if (!before) break;
    await sleep(400);                            // be gentle with the API
  }
  return [...byId.values()];
}

// --- Branch grouping for the sidebar (chapter key -> branch label) ----------
function branchOf(s, ch) {
  if (ch === 'uncat') return 'Uncategorized';
  if (s === 'chemistry') return ch.startsWith('org_') ? 'Organic' : ch.startsWith('inorg_') ? 'Inorganic' : 'Physical';
  if (s === 'physics') {
    const m = { units:'Mechanics',kinematics:'Mechanics',nlm:'Mechanics',wep:'Mechanics',com:'Mechanics',rotation:'Mechanics',gravitation:'Mechanics',elasticity:'Mechanics',fluids:'Mechanics',heat:'Heat & Thermo',shm:'Waves & Oscillations',waves:'Waves & Oscillations',electrostatics:'Electromagnetism',capacitance:'Electromagnetism',current:'Electromagnetism',magnetism:'Electromagnetism',emi:'Electromagnetism',ac:'Electromagnetism',emwaves:'Electromagnetism',rayoptics:'Optics',waveoptics:'Optics',modern:'Modern & Electronics',semiconductor:'Modern & Electronics',communication:'Modern & Electronics',phy_exp:'Other',phys_gen:'Other' };
    return m[ch] || 'Other';
  }
  if (s === 'maths') {
    const m = { sets:'Algebra',complex:'Algebra',quadratic:'Algebra',sequence:'Algebra',pnc:'Algebra',binomial:'Algebra',matrices:'Algebra',determinants:'Algebra',mathreasoning:'Algebra',statistics:'Probability & Stats',probability:'Probability & Stats',trig:'Trigonometry',itf:'Trigonometry',triangle:'Trigonometry',straightlines:'Coordinate Geometry',psl:'Coordinate Geometry',circle:'Coordinate Geometry',conics:'Coordinate Geometry',threed:'Vectors & 3D',vectors:'Vectors & 3D',lcd:'Calculus',differentiation:'Calculus',aod:'Calculus',indefinite:'Calculus',definite:'Calculus',integration:'Calculus',de:'Calculus',maths_gen:'Other' };
    return m[ch] || 'Other';
  }
  if (s === 'biology') return 'Biology';
  return 'Other';
}

// --- Build the HTML --------------------------------------------------------
function buildHtml(records, guildId) {
  const tmplPath = path.join(__dirname, 'viewer-template.html');
  const tmpl = fs.readFileSync(tmplPath, 'utf8');
  const updated = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  return tmpl
    .replace('/*__DATA__*/', JSON.stringify(records))
    .replace(/__SERVER_NAME__/g, SERVER_NAME.replace(/[<>]/g, ''))
    .replace(/__UPDATED__/g, updated)
    .replace(/__COUNT__/g, String(records.length));
}

// --- Main ------------------------------------------------------------------
(async () => {
  if (BOT_TOKEN.startsWith('PASTE') || FORUM_CHANNEL_ID.startsWith('PASTE')) {
    console.error('\n❌ Set BOT_TOKEN and FORUM_CHANNEL_ID at the top of this file (or as env vars). See README.md.\n');
    process.exit(1);
  }
  let AO_IDS = null;
  try { AO_IDS = new Set(fs.readFileSync(path.join(__dirname, 'ao_ids.txt'), 'utf8').split(/\s+/).filter(Boolean)); console.log(`Loaded ao_ids.txt: ${AO_IDS.size} curated AO links.`); } catch (e) {}
  console.log('Fetching channel info…');
  const channel = await api(`/channels/${FORUM_CHANNEL_ID}`);
  const guildId = channel.guild_id;
  const tagNameById = {};
  (channel.available_tags || []).forEach(t => { tagNameById[t.id] = t.name; });
  console.log(`  server (guild) id: ${guildId}`);
  console.log(`  forum tags found: ${Object.values(tagNameById).join(', ') || '(none)'}`);

  console.log('Fetching all doubt threads (this can take a minute)…');
  const threads = await fetchAllThreads(guildId);
  console.log(`Total doubts fetched: ${threads.length}`);

  if (FETCH_CONTENT) console.log('Fetching question text + image info for each doubt (slow: one call per doubt)…');
  const records = [];
  for (let i = 0; i < threads.length; i++) {
    const th = threads[i];
    const title = th.name || '';
    const subject = subjectFromTags(th.applied_tags, tagNameById) || subjectFromTitle(title) || DEFAULT_SUBJECT;
    let preview = '', hasImage = false;
    if (FETCH_CONTENT) {
      const st = await fetchStarter(th.id);
      preview = st.content; hasImage = st.hasImage;
      if ((i + 1) % 200 === 0) console.log(`  …${i + 1}/${threads.length}`);
      await sleep(120);
    }
    const r = classify(subject, title, preview);
    const ao = AO_IDS ? AO_IDS.has(th.id) : ENABLE_AO_LINKS;
    records.push({
      s: subject, b: branchOf(subject, r.ch), ch: r.ch, cl: r.chLabel, sl: r.subLabel,
      cf: r.conf, t: title, p: preview.slice(0, PREVIEW_LEN), im: hasImage ? 1 : 0,
      u: `https://discord.com/channels/${guildId}/${th.id}`,
      a: ao ? `https://www.answeroverflow.com/m/${th.id}` : null,
    });
  }

  // quick console summary
  const bySub = {}, uncat = {};
  records.forEach(r => { bySub[r.s] = (bySub[r.s]||0)+1; if (r.ch==='uncat') uncat[r.s]=(uncat[r.s]||0)+1; });
  console.log('By subject:', bySub);
  console.log('Uncategorized:', uncat);

  fs.writeFileSync(OUTPUT_FILE, buildHtml(records, guildId), 'utf8');
  console.log(`\n✓ Wrote ${OUTPUT_FILE}  (${records.length} doubts). Open it in any browser.\n`);
})().catch(e => { console.error('\n❌ Error:', e.message, '\n'); process.exit(1); });
