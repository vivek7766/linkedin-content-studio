# LinkedIn Content Studio - Project Notes

## Local Path

`/Users/vivek.kumar.singh/Documents/Codex/linkedin-content-studio`

## Purpose

This is a local LinkedIn content studio for building a Product x AI personal brand. It helps move from topic idea to publish-ready LinkedIn draft, using saved brand voice, personal writing samples, style controls, and post history.

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
- `public/index.html` - app markup.
- `public/app.js` - topic bank, state, browser interactions, local storage, generation request, fallback generation.
- `public/styles.css` - app styling.
- `PROJECT_NOTES.md` - this handoff file.

## Current Features

- Topic Generator with topic cards across:
  - AI at Work
  - Product Thinking
  - Enterprise Transformation
  - Consumer AI
  - Leadership in the Age of AI
  - Current Affairs
- Pillar filter and "Surprise me" topic/angle picker.
- Post Composer with angle options:
  - Teach
  - Challenge
  - Personal story
  - Hot take
- Brand Voice panel:
  - Tone
  - Audience
  - Point of view
  - Credibility
  - Avoid
- Personal Style panel:
  - Writing rules
  - Sample posts
  - Reset button
  - Sample and word count
- Style Mode control:
  - Balanced
  - Brand-led
  - Style-led
- Virality Lens control:
  - Insight-led
  - Current affairs
  - Contrarian commentary
  - Anecdote-led
  - Debate spark
- Current trigger field for a headline, current event, or live observation.
- Writing workflow:
  - User idea
  - Generate draft
  - Critique draft
  - Rewrite draft
  - Final polish
- Draft word/character count.
- Copy draft button.
- Save to tracker button.
- Post history/tracker stored in browser local storage.

## Important Behavior

The generator combines:

```text
Topic + Angle + Brand Voice + Personal Style + Style Mode + Virality Lens + Current trigger + Post History
```

Brand Voice handles strategic positioning. Personal Style handles writing fingerprint and rhythm. Style Mode controls which one gets more weight.

The workflow path is:

```text
User idea -> Generate draft -> Critique draft -> Rewrite draft -> Final polish
```

The browser stores the user idea locally. `Copy` and `Save to tracker` prefer the final polished post, then the rewrite, then the original draft.

Server endpoints:

```text
POST /api/generate
POST /api/workflow
GET /api/health
```

The Current Affairs and Virality controls do not fetch or invent news. The user should paste a current trigger/headline if they want topical commentary.

## Personal Writing Samples Already Seeded

The Personal Style sample bank currently includes six sample posts:

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
- Add export/import for Brand Voice, Personal Style, and history.
- Add delete/edit controls for tracker entries.
- Add optional topic bank editor.
- Add a README for GitHub with screenshots and setup instructions.
- Add a safe "clear local storage" control.
