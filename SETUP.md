# iTeachChem Doubts Index — live site on GitHub Pages

This folder is a ready-to-push repo. GitHub rebuilds the doubts index **every week**
by scraping Discord, and publishes it as a live web page — free, no server to run.

**Data flow:** Discord (your bot) → GitHub Action (weekly) → `public/index.html` → GitHub Pages URL.
Answer Overflow isn't a data source here; it's only the per-thread links on the cards.

---

## One-time prerequisites
- A **GitHub account**.
- Your Discord **bot** with **MESSAGE CONTENT INTENT = ON** (Developer Portal → Bot →
  Privileged Gateway Intents) and *View Channels* + *Read Message History* on the doubts forum.
  (Without the intent, previews come back blank — see the project log.)

---

## Setup (~10 minutes, once)

### 1. Create the repo
On GitHub: **New repository** → name it e.g. `iteachchem-doubts` → **Public** → Create.

### 2. Add these files to the repo
Push everything in this folder **keeping the structure** (the workflow must stay at
`.github/workflows/build.yml`).

**With git:**
```bash
cd "<this folder>"
git init
git add .
git commit -m "iTeachChem doubts index"
git branch -M main
git remote add origin https://github.com/<you>/iteachchem-doubts.git
git push -u origin main
```
**Or without git (web):** upload `classify.js`, `tag-doubts.js`, `viewer-template.html`,
`ao_ids.txt`, `.gitignore` via *Add file → Upload files*. Then create the workflow with
*Add file → Create new file*, name it exactly `.github/workflows/build.yml`, and paste the
contents of that file.

### 3. Add your two secrets
Repo **Settings → Secrets and variables → Actions → New repository secret**. Add two:
| Name | Value |
|------|-------|
| `DISCORD_TOKEN` | your bot token |
| `FORUM_CHANNEL_ID` | the doubts **forum channel** id (not the guild id) |

Secrets are encrypted and never visible in logs or the repo. **Don't put the token in any file.**

### 4. Turn on Pages
Repo **Settings → Pages → Build and deployment → Source = GitHub Actions**.

### 5. Run it once to test
**Actions** tab → **Build & Deploy Doubts Index** → **Run workflow**. Watch it (a few
minutes — it fetches every doubt). When green, your site is live at:
```
https://<you>.github.io/iteachchem-doubts/
```

---

## After setup — it's automatic
- Rebuilds **every Monday 06:00 UTC**. Change the cadence by editing the `cron:` line in
  `.github/workflows/build.yml` (e.g. `0 6 * * *` = daily). You can also hit **Run workflow**
  any time for an instant refresh.
- Each run overwrites `index.html` — that's intended for a live site (always shows the latest).

## Updating the tags or AO links
- Chapters/sub-types: edit the `TAX` object in `classify.js`, commit, re-run.
- Answer Overflow links: edit `ao_ids.txt` (one thread id per line), commit, re-run.

## Troubleshooting (check the Actions log)
| Symptom | Cause / fix |
|---------|-------------|
| `401 Unauthorized` | `DISCORD_TOKEN` secret wrong/expired. |
| `Unknown Channel` / 0 doubts | `FORUM_CHANNEL_ID` wrong, or it's not a forum channel. |
| Previews all blank | Message Content Intent is OFF (turn it on in the Developer Portal). |
| Pages 404 | Source isn't set to "GitHub Actions" (step 4), or the first run hasn't finished. |

## Is it safe to be public?
Yes — the generated page has no token, emails, or usernames (only doubt titles, ~300-char
previews, guild/thread IDs in links, and AO links which are already public). The bot token
lives only in the encrypted secret, never in the repo or the output.
