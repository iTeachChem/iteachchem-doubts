# Discord Doubt-Index Builder (v2)

Turn any Discord **forum-channel "doubts" section** into a single, searchable, offline webpage — every doubt auto-sorted by **NCERT/JEE chapter and sub-type**, now with the **question text and an image indicator** on every card.

**New in v2**
- Reads each doubt's **opening message** → shows a ~300-char **preview** on the card.
- Flags doubts that contain an image with a **📎 image** badge (click through to Discord to view it — images aren't embedded, which keeps the file small and avoids Discord's ~24h image-link expiry).
- **Much better tagging:** vague titles like "please help" or "doubt" now get classified from their body text, so far fewer land in *Uncategorized*.
- Optional **`ao_ids.txt`** to control which doubts get an Answer Overflow link.

---

## Files
| File | What it is |
|------|-----------|
| `tag-doubts.js` | Main script. Fetches doubts (+ text/image), tags them, writes `doubts_index.html`. |
| `classify.js` | Chapter/sub-type classifier. `classify(subject, title, body)`. |
| `viewer-template.html` | The webpage shell the script fills with your data. |
| `README.md` | This file. |
| `ao_ids.txt` | *(optional, you create it)* one thread ID per line → only those get an AO link. |

---

## Requirements
- **Node.js 18+** (built-in `fetch`, no `npm install`). Check: `node -v`.
- A **Discord bot** in your server with **View Channels** + **Read Message History**.
- Doubts must live in a **Forum channel** (each doubt is its own post).

---

## Setup — two things

**1. Bot token** — <https://discord.com/developers/applications> → New Application → **Bot** tab → Reset/Copy Token. Invite via **OAuth2 → URL Generator** → scope `bot` → perms *View Channels* + *Read Message History*.

**2. Forum channel ID** — Discord → Settings → Advanced → Developer Mode ON → right-click your doubts forum → **Copy Channel ID**. (Server/guild ID is auto-detected.)

Put them at the top of `tag-doubts.js`:
```js
const BOT_TOKEN        = 'your-bot-token-here';
const FORUM_CHANNEL_ID = 'your-forum-channel-id-here';
```
…or as env vars (keeps the token out of the file):
```bash
# macOS / Linux
export DISCORD_TOKEN="..."; export FORUM_CHANNEL_ID="..."
# Windows PowerShell
$env:DISCORD_TOKEN="..."; $env:FORUM_CHANNEL_ID="..."
```

---

## Run
```bash
node tag-doubts.js
```
Writes **`doubts_index.html`**. Open it in any browser. Re-run any time to refresh.

⏱️ **Heads-up on time:** v2 makes **one extra API call per doubt** to read its text/image, so a big forum (a few thousand doubts) takes **several minutes** and prints progress as it goes. Want it fast? Set `FETCH_CONTENT=false` to skip content and tag on titles only (like v1).

### Optional settings (env vars)
| Variable | Default | Purpose |
|----------|---------|---------|
| `FETCH_CONTENT` | `true` | `false` = skip text/image fetch (fast, titles only). |
| `PREVIEW_LEN` | `300` | Max characters of preview text stored per doubt. |
| `SERVER_NAME` | `Doubts Index` | Name in the page header. |
| `OUTPUT_FILE` | `doubts_index.html` | Output filename. |
| `ENABLE_AO_LINKS` | `false` | Add an "AO" button to **every** card (only if you run Answer Overflow on the channel). |

### Curated Answer Overflow links (optional)
If only *some* threads are indexed on Answer Overflow, create **`ao_ids.txt`** next to the script — one thread ID per line. When present, only those doubts get an AO button (and `ENABLE_AO_LINKS` is ignored).

---

## How tagging works
1. **Subject** from the forum's own tags (any tag containing *physics/chem/math/bio*); falls back to title keywords.
2. **Chapter + sub-type** from `classify.js` — a strong title match wins; otherwise the body text is used for more signal.
3. Titles+bodies too vague to place go to an honest **Uncategorized** bucket. Low-confidence guesses show a **"? guess"** badge.

**Customise:** edit `subjectFromTags()` in `tag-doubts.js` for different subjects, or the `TAX` object in `classify.js` for a different syllabus.

---

## Why images aren't shown inline
Discord's image URLs now expire (~24 hours) and embedding the actual image data would bloat the file to hundreds of MB — both break the "one small file you can share" design. So v2 shows a **📎 image** badge instead, and the Discord link opens the doubt to view the image live.

---

## Troubleshooting
| Symptom | Fix |
|---------|-----|
| `401 Unauthorized` | Wrong/old token. Copy a fresh one. |
| `403` / `Missing Access` | Bot not in server or lacks View Channel / Read Message History. |
| `Unknown Channel` / 0 doubts | Channel ID is wrong or not a Forum channel. |
| Too slow | Set `FETCH_CONTENT=false`, or just let it run (it's one-time per refresh). |
| `fetch is not defined` | Node older than v18 — update Node. |
