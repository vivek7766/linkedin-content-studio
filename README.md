# LinkedIn Content Studio

A local web app for generating LinkedIn posts tailored to a Product × AI personal brand. Built with plain Node.js — no framework, no build step.

## Features

- **Topic Generator** — curated topic grid organized by content pillars (AI at Work, Product Strategy, Leadership, etc.)
- **Post Composer** — choose angle (Teach / Challenge / Personal story / Hot take), Style Mode (Balanced / Brand-led / Style-led), and Virality Lens (Insight-led / Current affairs / Contrarian / Anecdote-led / Debate spark)
- **Brand Voice** — configure tone, audience, point of view, credibility signals, and words to avoid
- **Personal Style** — paste your own sample posts so the model learns your rhythm and structure
- **Post Tracker** — saves generated posts locally to avoid repeating topics
- **Offline fallback** — works without an API key using a local brand-voice engine

## Requirements

- Node.js 18 or later
- An [Anthropic API key](https://console.anthropic.com/) (optional — app runs in local mode without one)

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/vivek7766singh/linkedin-content-studio.git
cd linkedin-content-studio

# 2. Copy the example env file and fill in your API key
cp .env.example .env

# 3. Start the server
node server.js
# → http://127.0.0.1:4173
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | _(unset)_ | Anthropic API key. If omitted the app uses the local draft engine. |
| `CLAUDE_MODEL` | `claude-sonnet-4-5` | Claude model ID to use for generation. |
| `PORT` | `4173` | Port the server listens on. |
| `HOST` | `127.0.0.1` | Host the server binds to. |

## Usage

1. Open `http://127.0.0.1:4173` in your browser.
2. Fill in **Brand Voice** and **Personal Style** in the left sidebar (saved automatically in localStorage).
3. Click a topic card or hit **Surprise me** to pick a topic.
4. Choose an angle, style mode, and virality lens, then click **Generate post**.
5. Edit the draft in the text area, then **Copy** or **Save to tracker**.

## Project structure

```
linkedin-content-studio/
├── server.js          # HTTP server + Claude API integration
├── package.json
└── public/
    ├── index.html
    ├── app.js         # All client-side logic
    └── styles.css
```

## License

MIT
