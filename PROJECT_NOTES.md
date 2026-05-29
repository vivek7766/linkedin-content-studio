# LinkedIn Content Studio - Project Notes

## Local Path

`/Users/vivek.kumar.singh/Documents/Codex/linkedin-content-studio`

## Purpose

This is a local LinkedIn content studio for building profile-specific personal brands. It helps move from topic idea to publish-ready LinkedIn draft, using a selected professional profile, saved voice, reference samples/articles, style controls, and post history.

## How To Run

From the project folder:

```bash
npm start
```

Then open:

```text
http://127.0.0.1:4173
```

The app also works directly as a static file:

```text
file:///Users/vivek.kumar.singh/Documents/Codex/linkedin-content-studio/public/index.html
```

For Claude-backed generation, run with:

```bash
ANTHROPIC_API_KEY=your_key npm start
```

Without `ANTHROPIC_API_KEY`, the app uses a local fallback draft generator.

## Railway Deployment Notes

Railway must expose an Anthropic key to the running service. The preferred variable is:

```text
ANTHROPIC_API_KEY
```

The server also accepts these aliases in case the Railway variable was named differently:

```text
ANTHROPIC_KEY
CLAUDE_API_KEY
```

Variable names are usually case-sensitive on Linux, but the server now also checks these names case-insensitively and trims accidental quotes/spaces around the value.

Expected healthy deploy log:

```text
Anthropic env status: ANTHROPIC_API_KEY:present, ANTHROPIC_KEY:missing, CLAUDE_API_KEY:missing
Relevant env names visible: ANTHROPIC_API_KEY, PORT, RAILWAY_ENVIRONMENT, ...
Claude generation enabled via ANTHROPIC_API_KEY.
```

If the log says all three are missing, Railway has not attached the variable to this service/deployment. Add it under the service Variables tab and redeploy.

Safe runtime diagnostic endpoint:

```text
https://YOUR_RAILWAY_DOMAIN/api/health
```

This endpoint returns whether Claude generation is active, which supported key name was detected, and which relevant environment variable names are visible. It never returns the full API key.

## Files

- `package.json` - npm metadata and `npm start` script.
- `server.js` - local Node server, Claude API integration, prompt building, local fallback generation.
- `LINKEDIN_POST_PROMPTS.md` - reusable LinkedIn prompt pack and recommended generation workflow.
- `public/index.html` - app markup.
- `public/app.js` - topic bank, state, browser interactions, local storage, generation request, fallback generation.
- `public/analytics.html` - lightweight usage analytics dashboard.
- `public/analytics.js` - analytics dashboard rendering logic.
- `public/styles.css` - app styling.
- `public/manifest.webmanifest` - PWA install metadata.
- `public/sw.js` - service worker for app-shell caching and offline fallback.
- `public/offline.html` - offline fallback page.
- `public/app-icon.svg` - app icon used by the PWA manifest.
- `PROJECT_NOTES.md` - this handoff file.
- `ROADMAP_TO_1M_USERS.md` - milestone roadmap from POC to scaled web application.
- `ARCHITECTURE_REVIEW_AND_SCALE_PLAN.md` - architecture review, hardening plan, and 1M-user scale path.
- `docs/architecture/LinkedIn_Content_Studio_Technical_Architecture.pptx` - editable technical architecture deck.
- `docs/architecture/architecture-preview-*.png` - rendered slide previews for visual QA.
- `scripts/create_architecture_deck.mjs` - script to regenerate the architecture deck and previews.

## Current Features

- Topic Generator with topic cards across:
  - AI at Work
  - Product Thinking
  - Enterprise Transformation
  - Consumer AI
  - Leadership in the Age of AI
  - Current Affairs
  - Founder Operating Systems
  - Consulting and Advisory
  - Market Analysis
  - Engineering and AI Systems
  - Design and Experience
  - Architecture and Platforms
  - Supply Chain Leadership
  - Leadership Systems
- Profile selector:
  - Product x AI Leader
  - Entrepreneur / Founder
  - Consultant / Analyst
  - UI/UX Designer
  - GenAI Engineer
  - Technical Architect
  - Supply Chain Leader
  - Enterprise Leader
- Pillar filter and "Surprise me" topic/angle picker.
- Post Composer with angle options:
  - Teach
  - Challenge
  - Personal story
  - Hot take
- Profile Voice panel:
  - Tone
  - Audience
  - Point of view
  - Credibility
  - Avoid
- Tone Samples panel:
  - Writing rules
  - Sample posts or articles
  - Reset button
  - Sample and word count
- Style Mode control:
  - Balanced
  - Profile-led
  - Tone-led
- Virality Lens control:
  - Insight-led
  - Current affairs
  - Contrarian commentary
  - Anecdote-led
  - Debate spark
- Current trigger field for a headline, current event, or live observation.
- Writing workflow:
  - Idea + structured content brief
  - Generate draft
  - Critique draft
  - Rewrite draft
  - Final polish
- Prompt quality controls:
  - Strong, specific hooks instead of generic openings.
  - One clear insight per post.
  - Concrete examples, tradeoffs, observations, or operating details.
  - Server-side Style DNA extraction from tone samples: observed openings, signature moves, argument shape, rhythm, and anti-copying constraints.
  - Structured content brief fields: real point of view, belief to challenge, anecdote/lived trigger, proof/concrete detail, and reader takeaway.
  - Critique now prioritizes editorial diagnosis over generic scoring: core problem, weak lines, voice mismatch, missing specificity, argument gap, LinkedIn risk, rewrite strategy, and one overall quality verdict.
  - Final polish rules to remove fluff, repetition, buzzwords, and AI-sounding lines.
  - Visible fallback warnings when Claude is unavailable or a request falls back to local template generation.
- Draft word/character count.
- Copy draft button.
- Save to tracker button.
- Post history/tracker stored in browser local storage.
- Responsive PWA shell:
  - Installable app manifest.
  - Service worker app-shell caching.
  - Offline fallback page.
  - Responsive layout for laptop, tablet, and mobile.
- First-party usage analytics:
  - DAU, MAU, and TAU
  - Total posts generated
  - Posts generated by profile
  - Tokens consumed per post
  - Estimated dollar value per post
  - Total estimated dollar consumption
  - App, profile, topic, draft, workflow, copy, and save events
  - Provider, latency, fallback, token, and cost metadata
  - Aggregate dashboard at `/analytics.html`
  - Optional production protection with `ANALYTICS_ADMIN_TOKEN`; open `/analytics.html?token=YOUR_TOKEN` when enabled.

## Important Behavior

The generator combines:

```text
Selected Profile + Topic + Angle + Profile Voice + Tone Samples + Style Mode + Virality Lens + Current trigger + Post History
```

The upgraded quality path adds:

```text
Content Brief + Extracted Style DNA + Visible Claude/local provider status
```

Every server-side generation and workflow request also loads:

```text
LINKEDIN_POST_PROMPTS.md
```

Treat this file as the shared prompt skill for draft generation, critique, rewrite, and final polish behavior. Editing it changes future server-side prompt calls without requiring changes in `server.js`.

Profile Voice handles strategic positioning for the selected user type. Tone Samples handle writing fingerprint and rhythm. Style Mode controls which one gets more weight. The server now extracts Style DNA from the samples and injects it into draft, critique, rewrite, and polish prompts so the model has enforceable style rules instead of passive sample context.

The workflow path is:

```text
Idea + brief -> Generate draft -> Editorial critique + Grader Eval -> Rewrite draft -> Final polish
```

The Critique draft button now runs two quality checks: an editorial critique and a model-grader evaluation inspired by the Anthropic Prompt Evals notebooks under Desktop/Claude Certification. The grader returns structured JSON with score, strengths, weaknesses, and reasoning; rewrite receives that grader output as a hard quality bar. The browser stores the selected profile, profile-specific voice/sample overrides, user idea, structured content brief, and latest grader result locally. `Copy` and `Save to tracker` prefer the final polished post, then the rewrite, then the original draft.

Server endpoints:

```text
POST /api/generate
POST /api/workflow
POST /api/analytics/event
GET /api/analytics/summary
GET /api/health
```

The Current Affairs and Virality controls do not fetch or invent news. The user should paste a current trigger/headline if they want topical commentary.

Analytics is intentionally metadata-only. The app does not store user ideas, pasted samples, generated posts, or final drafts in analytics events. Token and cost metrics come from the Claude API `usage` object when Claude is used. Cost estimates default to Sonnet pricing of $3 per million input tokens and $15 per million output tokens, with overrides available through `CLAUDE_INPUT_COST_PER_MTOK`, `CLAUDE_OUTPUT_COST_PER_MTOK`, `CLAUDE_CACHE_WRITE_COST_PER_MTOK`, and `CLAUDE_CACHE_READ_COST_PER_MTOK`. Local JSONL analytics can be replaced with Postgres, Segment, Mixpanel, GA, OpenTelemetry, or a warehouse once the product moves beyond POC. To protect the aggregate dashboard in production, set `ANALYTICS_ADMIN_TOKEN` in Railway and open `/analytics.html?token=YOUR_TOKEN`.

Grader metrics are also metadata-only. The server records `graderScore` on critique workflow events and exposes aggregate grader count, average score, and pass rate in `/api/analytics/summary`.

## Tone Samples Already Seeded

The Product x AI Leader tone sample bank currently includes six sample posts:

1. Vande Bharat / AI Paradox / enterprise ROI and structural process debt.
2. AI post-scarcity / democratizes intelligence but not prosperity.
3. Barrier to entry collapsed / simulation compressed but judgment remains scarce.
4. Qualia / patience / why AI cannot replace human managerial ambiguity.
5. HYROX / imperfect conditions / execution, discipline, and grit.
6. Full stack developer / stack of stacks / system-level decision flow.

The style guidance currently emphasizes:

- Concrete analogy, sharp claim, deceptively simple question, or reflective observation as openings.
- Bridges from culture, economics, product, lived experience, or human behavior into AI.
- System-level reasoning and category reframing.
- Strategic clarity with philosophical or human texture.
- Short thesis lines.
- Thoughtful debate, not generic engagement bait.
- Original wording, avoiding direct reuse of sample phrases.

## GitHub Setup Reminder

Local repo folder:

```bash
cd /Users/vivek.kumar.singh/Documents/Codex/linkedin-content-studio
```

Typical first commit:

```bash
git init
git add .
git commit -m "Initial LinkedIn content studio"
git branch -M main
git remote add origin https://github.com/vivek7766singh/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_REPO_NAME` with the chosen GitHub repository name.

## Suggested Next Improvements

- Add explicit prompt preview/debug panel for generated Claude prompt.
- Add export/import for Profile Voice, Tone Samples, selected profile, and history.
- Add delete/edit controls for tracker entries.
- Add optional topic bank editor.
- Add a README for GitHub with screenshots and setup instructions.
- Add a safe "clear local storage" control.
