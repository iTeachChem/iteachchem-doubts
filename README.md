# iTeachChem Doubts Index

**Live site → https://iteachchem.github.io/iteachchem-doubts/**

Every doubt ever posted in the [iTeachChem Discord](https://discord.gg/iteachchem-1226379612238385242)
— 4,300+ chemistry, physics, biology and maths questions students have asked and solved over two
years — turned into a single, searchable webpage, sorted by **NCERT/JEE chapter and sub-type**.
It rebuilds itself automatically every week.

## What it does

- **Browse by subject → chapter → type** — e.g. Organic → Haloalkanes → Substitution/Elimination.
- **Search** any keyword (title, preview text, chapter) and jump straight to the thread.
- **Newest first**, with the pinned welcome post on top, just like Discord.
- **✅ Solved** badges, an **ask-date** on every card, and a 📎 flag on image doubts.
- **"All" tab** — one global feed of every doubt.
- Each card links to the original **Discord** thread and its **Answer Overflow** page.
- One self-contained HTML file: fast, works offline, no login, safe to share.

## How it works

A GitHub Actions workflow (`.github/workflows/build.yml`) runs weekly (and on demand):
it reads the doubts forum via the Discord API, tags every thread with `classify.js`
(an NCERT/JEE chapter keyword map), and deploys the generated page to GitHub Pages.
No server to run.

| File | Purpose |
|------|---------|
| `tag-doubts.js` | Scraper + page builder (Node 18+, no dependencies) |
| `classify.js` | Chapter / sub-type classifier |
| `viewer-template.html` | The page shell the data is injected into |
| `ao_ids.txt` | Optional curated Answer Overflow list (AO now links all by default) |
| `.github/workflows/build.yml` | Weekly build + deploy to Pages |

## Run / deploy it yourself

See **[SETUP.md](SETUP.md)**. In short: add a Discord bot token + forum channel ID as
GitHub Actions secrets, set Pages source to "GitHub Actions", and run the workflow.
It also works locally: `DISCORD_TOKEN=… FORUM_CHANNEL_ID=… node tag-doubts.js`.

> **Note:** the bot needs the **Message Content Intent** enabled (Discord Developer Portal →
> Bot → Privileged Gateway Intents) or the question previews come back blank.

## Privacy

The generated page contains no tokens, emails, or usernames — only doubt titles, short
previews, and links. The bot token lives only in the encrypted GitHub secret. Safe to host publicly.

## Reuse it for your own server

Any Discord server with a forum-based doubts channel can build the same thing — the
generic, server-agnostic version lives in `doubt-tagger-generic-v2/` in the project repo.
