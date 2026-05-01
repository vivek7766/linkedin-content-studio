# LinkedIn Content Studio

A responsive LinkedIn content studio for generating profile-specific thought leadership posts. It supports Product x AI leaders, founders, consultants, analysts, GenAI engineers, UI/UX designers, technical architects, supply chain leaders, and enterprise leaders.

## Features

- **Profile-first generation** — choose the audience profile before drafting so the strategy, examples, and vocabulary fit the writer.
- **Topic Generator** — curated topic grid organized by content pillars including AI at Work, Product Strategy, Design and Experience, Architecture and Platforms, Supply Chain, Consulting, and Leadership.
- **Post Composer** — choose angle (Teach / Challenge / Personal story / Hot take), Style Mode (Balanced / Brand-led / Style-led), and Virality Lens (Insight-led / Current affairs / Contrarian / Anecdote-led / Debate spark)
- **Brand Voice** — configure tone, audience, point of view, credibility signals, and words to avoid
- **Personal Style** — paste your own sample posts so the model learns your rhythm and structure
- **Guided workflow** — move through User idea → Generate draft → Critique draft → Rewrite draft → Final polish
- **Quality prompt skill** — every server-side draft, critique, rewrite, and polish request loads `LINKEDIN_POST_PROMPTS.md` as the reusable prompt-skill source of truth
- **Post Tracker** — saves generated posts locally to avoid repeating topics
- **Usage analytics** — tracks DAU, MAU, TAU, posts generated, profile mix, token usage, and estimated generation cost
- **PWA shell** — installable app manifest, service worker, responsive layout, and offline fallback

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
| `ANALYTICS_ADMIN_TOKEN` | _(unset)_ | Optional token to protect `/analytics.html` in production. |

## Usage

1. Open `http://127.0.0.1:4173` in your browser.
2. Fill in **Brand Voice** and **Personal Style** in the left sidebar (saved automatically in localStorage).
3. Click a topic card or hit **Surprise me** to pick a topic.
4. Choose an angle, style mode, and virality lens, then click **Generate post**.
5. Use the guided workflow to critique, rewrite, and polish the draft.
6. Edit the final post, then **Copy** or **Save to tracker**.

## Prompt skill

The generation engine reads `LINKEDIN_POST_PROMPTS.md` during every server-side generation and workflow request. Update that Markdown file to change the shared prompt rules used for drafts, critiques, rewrites, and final polish.

## Project structure

```
linkedin-content-studio/
├── server.js          # HTTP server, Claude API integration, analytics endpoints
├── LINKEDIN_POST_PROMPTS.md
├── ARCHITECTURE_REVIEW_AND_SCALE_PLAN.md
├── ROADMAP_TO_1M_USERS.md
├── package.json
├── docs/
│   └── architecture/
│       ├── LinkedIn_Content_Studio_Technical_Architecture.pptx
│       └── architecture-preview-*.png
└── public/
    ├── index.html
    ├── analytics.html
    ├── analytics.js
    ├── app.js         # All client-side logic
    ├── manifest.webmanifest
    ├── offline.html
    ├── sw.js
    └── styles.css
```

## License

MIT
