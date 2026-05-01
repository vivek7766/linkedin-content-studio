# LinkedIn Content Studio Architecture Review And Scale Plan

## Current Architecture

The current application is a lean POC:

- Static frontend served from `public/`.
- Node HTTP server in `server.js`.
- Claude API integration for draft and workflow generation.
- Browser local storage for profile overrides, post history, and user workspace state.
- JSONL-based first-party analytics stored under `data/`.
- Railway hosting with GitHub-triggered deployments.
- PWA app shell with manifest, service worker, offline page, and responsive UI.

## What Is Good

- Small operational surface area and low deployment complexity.
- Clear product loop: profile -> topic -> idea -> draft -> critique -> rewrite -> polish.
- Metadata-only analytics that avoids storing user content.
- Local fallback when Claude is not configured or fails.
- Strong separation between user content and usage metrics.

## Current Limits

- No user accounts, multi-user data model, or cross-device persistence.
- Analytics is file-backed and will not scale beyond early POC usage.
- No rate limiting, abuse prevention, or per-user quota controls.
- No durable prompt/version tracking beyond code history.
- No job queue for long-running or retryable AI work.
- No tenant isolation, roles, billing, or organization-level governance.

## Near-Term Hardening

Before expanding beyond a controlled beta:

- Add authentication with a managed provider such as Clerk, Auth0, WorkOS, or Supabase Auth.
- Move profile workspaces, post history, and analytics events to Postgres.
- Add request rate limits and per-user generation quotas.
- Add structured logs, request IDs, and error monitoring.
- Add prompt versioning and model usage tracking.
- Add feature flags for beta rollouts.
- Add explicit privacy controls for saved samples and generated posts.

## Recommended Commercial Architecture

For the first serious commercial version:

```text
PWA / Web Client
  -> CDN / Edge
  -> API Gateway
  -> AuthN/AuthZ
  -> App API
  -> AI Orchestration Service
  -> Model Gateway
  -> Claude / future models

App API
  -> Postgres for users, profiles, posts, prompts, teams
  -> Redis for sessions, rate limits, queues, cached context
  -> Object storage for exports and assets

Events
  -> Event collector
  -> Analytics warehouse
  -> Product dashboards
  -> Cost and quality dashboards

Observability
  -> Logs
  -> Metrics
  -> Traces
  -> Errors
  -> Alerts
```

## Framework Direction

The current vanilla frontend and Node server are appropriate for POC speed. For a commercial web application, migrate deliberately rather than rewriting everything at once.

Recommended path:

1. Keep the current PWA stable while validating usage.
2. Move backend routes into a typed API framework such as Fastify or Express with Zod validation.
3. Move frontend into Next.js or Remix when auth, routing, SSR, billing, and team workspaces become necessary.
4. Move AI operations into a separate service once generation volume, retries, and model routing become meaningful.
5. Add Postgres, Redis, and an event pipeline before public beta.

## Scale Milestones

### POC

- Static PWA.
- Node API.
- Claude API.
- JSONL analytics.
- Railway deployment.

### Private Beta

- Auth.
- Postgres.
- Server-side saved workspaces.
- Rate limits.
- Error monitoring.
- Analytics events in Postgres.

### Public Beta

- CDN.
- API gateway.
- Redis queue.
- Background workers.
- Segment/Mixpanel/warehouse-ready event pipeline.
- Feature flags.

### Commercial SaaS

- Multi-tenant organizations.
- Role-based access control.
- Billing.
- Usage quotas.
- Audit logs.
- Prompt/model evaluation harness.

### 1M Users

- Multi-region edge delivery.
- Autoscaled APIs and worker fleets.
- Dedicated model gateway.
- Analytics warehouse.
- Experimentation platform.
- Incident response and SLOs.

## Privacy And Governance Principles

- Store user content only when the user explicitly saves it.
- Keep analytics metadata-only unless consent and product value justify deeper data.
- Keep generated content, samples, and prompts separated from aggregate usage events.
- Encrypt secrets and use managed secret stores.
- Add role-based access before team accounts.
- Add deletion/export controls before commercial launch.

## Next Architecture Decisions

- Auth provider.
- Database provider.
- Whether post history should sync across devices.
- Whether tone samples should be stored server-side.
- Event pipeline choice.
- Billing and quota model.
- Model routing and cost control policy.
