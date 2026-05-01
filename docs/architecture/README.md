# Architecture Deck

This folder contains the editable technical architecture deck for LinkedIn Content Studio.

## Files

- `LinkedIn_Content_Studio_Technical_Architecture.pptx` - editable PowerPoint deck.
- `architecture-preview-*.png` - rendered slide previews for quick visual QA.

## Deck Coverage

- Current POC architecture.
- User-facing product workflow.
- Target commercial architecture.
- Security, privacy, and governance model.
- Milestone roadmap from POC to 1M users.
- Near-term architecture decisions.

## Regenerate

```bash
NODE_PATH=/Users/vivek.kumar.singh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
/Users/vivek.kumar.singh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
scripts/create_architecture_deck.mjs
```
