require("dotenv").config({ quiet: true });
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = path.join(__dirname, "public");
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5";
const ANALYTICS_FILE = process.env.ANALYTICS_FILE || path.join(__dirname, "data", "analytics-events.jsonl");
const ANALYTICS_SALT = process.env.ANALYTICS_SALT || "linkedin-content-studio-analytics";
const ANALYTICS_ADMIN_TOKEN = cleanSecret(process.env.ANALYTICS_ADMIN_TOKEN);
const MAX_ANALYTICS_EVENTS = getNumberEnv("MAX_ANALYTICS_EVENTS", 5000);
const LINKEDIN_PROMPT_SKILL_FILE = "LINKEDIN_POST_PROMPTS.md";
const LINKEDIN_PROMPT_SKILL_PATH = path.join(__dirname, LINKEDIN_PROMPT_SKILL_FILE);
const LINKEDIN_PROMPT_SKILL_MAX_LENGTH = 18000;
const CLAUDE_INPUT_COST_PER_MTOK = getNumberEnv("CLAUDE_INPUT_COST_PER_MTOK", 3);
const CLAUDE_OUTPUT_COST_PER_MTOK = getNumberEnv("CLAUDE_OUTPUT_COST_PER_MTOK", 15);
const CLAUDE_CACHE_WRITE_COST_PER_MTOK = getNumberEnv(
  "CLAUDE_CACHE_WRITE_COST_PER_MTOK",
  CLAUDE_INPUT_COST_PER_MTOK * 1.25
);
const CLAUDE_CACHE_READ_COST_PER_MTOK = getNumberEnv(
  "CLAUDE_CACHE_READ_COST_PER_MTOK",
  CLAUDE_INPUT_COST_PER_MTOK * 0.1
);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "content-security-policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; ")
};

const ANTHROPIC_API_KEY_NAMES = ["ANTHROPIC_API_KEY", "ANTHROPIC_KEY", "CLAUDE_API_KEY"];
const ANALYTICS_STRING_KEYS = new Set([
  "action",
  "angle",
  "errorCode",
  "eventSource",
  "fromProfileId",
  "model",
  "pillar",
  "profileId",
  "profileLabel",
  "provider",
  "route",
  "stage",
  "status",
  "styleMode",
  "topicId",
  "topicPillar",
  "viralityMode"
]);
const ANALYTICS_NUMBER_KEYS = new Set([
  "cacheCreationInputTokens",
  "cacheReadInputTokens",
  "currentTriggerLength",
  "draftWordCount",
  "finalWordCount",
  "historyCount",
  "inputTokens",
  "latencyMs",
  "outputTokens",
  "sampleCount",
  "sampleWordCount",
  "totalTokens",
  "userIdeaLength"
]);
const ANALYTICS_DECIMAL_KEYS = new Set([
  "cacheTokenCostUsd",
  "costPerPostUsd",
  "inputTokenCostUsd",
  "outputTokenCostUsd",
  "totalCostUsd"
]);
const ANALYTICS_BOOLEAN_KEYS = new Set(["success", "usedFallback"]);
const analyticsEvents = loadAnalyticsEvents();

function sendJson(res, status, payload) {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, message, extraHeaders = {}) {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
    ...extraHeaders
  });
  res.end(message);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sanitizeText(value, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim();
}

function cleanSecret(value) {
  return String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

function getNumberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function getEnvValueCaseInsensitive(name) {
  if (Object.prototype.hasOwnProperty.call(process.env, name)) {
    return process.env[name];
  }

  const normalizedName = name.toLowerCase();
  const actualName = Object.keys(process.env).find((key) => key.toLowerCase() === normalizedName);
  return actualName ? process.env[actualName] : "";
}

function getAnthropicApiKey() {
  for (const name of ANTHROPIC_API_KEY_NAMES) {
    const value = cleanSecret(getEnvValueCaseInsensitive(name));
    if (value) {
      return { name, value };
    }
  }

  return { name: "", value: "" };
}

function maskSecret(value) {
  const cleanValue = cleanSecret(value);
  if (!cleanValue) {
    return "missing";
  }

  if (cleanValue.length <= 8) {
    return "present";
  }

  return `${cleanValue.slice(0, 6)}...${cleanValue.slice(-4)}`;
}

function getAnthropicEnvStatus() {
  return ANTHROPIC_API_KEY_NAMES.map((name) => {
    const value = cleanSecret(getEnvValueCaseInsensitive(name));
    return `${name}:${value ? "present" : "missing"}`;
  }).join(", ");
}

function getLinkedInPromptSkill() {
  try {
    return sanitizeBlock(
      fs.readFileSync(LINKEDIN_PROMPT_SKILL_PATH, "utf8"),
      "",
      LINKEDIN_PROMPT_SKILL_MAX_LENGTH
    );
  } catch (error) {
    return "";
  }
}

function getLinkedInPromptSkillStatus() {
  const content = getLinkedInPromptSkill();
  return {
    file: LINKEDIN_PROMPT_SKILL_FILE,
    loaded: Boolean(content),
    characterCount: content.length,
    maxCharacters: LINKEDIN_PROMPT_SKILL_MAX_LENGTH
  };
}

function getRelevantEnvNames() {
  return Object.keys(process.env)
    .filter((name) => /anthropic|claude|analytics|railway|port|node_env/i.test(name))
    .sort();
}

function getConfigStatus() {
  const apiKey = getAnthropicApiKey();
  return {
    ok: true,
    generationProvider: apiKey.value ? "claude" : "local",
    anthropicKeyDetected: Boolean(apiKey.value),
    anthropicKeyName: apiKey.name || null,
    anthropicKeyPreview: apiKey.value ? maskSecret(apiKey.value) : "missing",
    anthropicEnvStatus: getAnthropicEnvStatus(),
    model: CLAUDE_MODEL,
    host: HOST,
    port: PORT,
    nodeEnv: process.env.NODE_ENV || null,
    railwayEnvironment: process.env.RAILWAY_ENVIRONMENT || null,
    railwayServiceName: process.env.RAILWAY_SERVICE_NAME || null,
    analyticsEnabled: true,
    analyticsSummaryProtected: Boolean(ANALYTICS_ADMIN_TOKEN),
    analyticsMaxEvents: MAX_ANALYTICS_EVENTS,
    linkedInPromptSkill: getLinkedInPromptSkillStatus(),
    costConfig: getClaudeCostConfig(),
    relevantEnvNames: getRelevantEnvNames()
  };
}

function sanitizeBlock(value, fallback = "", maxLength = 12000) {
  const text = String(value || fallback)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}\n[truncated]` : text;
}

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(6));
}

function getClaudeCostConfig() {
  return {
    currency: "USD",
    unit: "per_million_tokens",
    inputCostPerMillion: CLAUDE_INPUT_COST_PER_MTOK,
    outputCostPerMillion: CLAUDE_OUTPUT_COST_PER_MTOK,
    cacheWriteCostPerMillion: CLAUDE_CACHE_WRITE_COST_PER_MTOK,
    cacheReadCostPerMillion: CLAUDE_CACHE_READ_COST_PER_MTOK
  };
}

function calculateUsageCost(usage = {}) {
  const inputTokens = Math.max(0, Math.round(Number(usage.input_tokens || 0)));
  const outputTokens = Math.max(0, Math.round(Number(usage.output_tokens || 0)));
  const cacheCreationInputTokens = Math.max(0, Math.round(Number(usage.cache_creation_input_tokens || 0)));
  const cacheReadInputTokens = Math.max(0, Math.round(Number(usage.cache_read_input_tokens || 0)));
  const inputTokenCostUsd = (inputTokens / 1_000_000) * CLAUDE_INPUT_COST_PER_MTOK;
  const outputTokenCostUsd = (outputTokens / 1_000_000) * CLAUDE_OUTPUT_COST_PER_MTOK;
  const cacheTokenCostUsd =
    (cacheCreationInputTokens / 1_000_000) * CLAUDE_CACHE_WRITE_COST_PER_MTOK +
    (cacheReadInputTokens / 1_000_000) * CLAUDE_CACHE_READ_COST_PER_MTOK;
  const totalCostUsd = inputTokenCostUsd + outputTokenCostUsd + cacheTokenCostUsd;

  return {
    inputTokens,
    outputTokens,
    cacheCreationInputTokens,
    cacheReadInputTokens,
    totalTokens: inputTokens + outputTokens + cacheCreationInputTokens + cacheReadInputTokens,
    inputTokenCostUsd: roundMoney(inputTokenCostUsd),
    outputTokenCostUsd: roundMoney(outputTokenCostUsd),
    cacheTokenCostUsd: roundMoney(cacheTokenCostUsd),
    totalCostUsd: roundMoney(totalCostUsd)
  };
}

function sanitizeIdentifier(value, fallback = "") {
  return String(value || fallback)
    .replace(/[^a-zA-Z0-9_.:-]/g, "_")
    .slice(0, 96);
}

function sanitizeUrlReference(value) {
  const text = sanitizeText(value);
  if (!text) {
    return "";
  }

  try {
    const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(text);
    const url = new URL(text, "http://local");
    return (isAbsolute ? `${url.origin}${url.pathname}` : url.pathname).slice(0, 180);
  } catch {
    return text.split(/[?#]/)[0].slice(0, 180);
  }
}

function sanitizeAnalyticsProperties(properties = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(properties || {})) {
    if (ANALYTICS_STRING_KEYS.has(key)) {
      clean[key] = sanitizeText(value).slice(0, 160);
    }

    if (ANALYTICS_NUMBER_KEYS.has(key)) {
      const number = Number(value);
      if (Number.isFinite(number)) {
        clean[key] = Math.max(0, Math.round(number));
      }
    }

    if (ANALYTICS_DECIMAL_KEYS.has(key)) {
      const number = Number(value);
      if (Number.isFinite(number)) {
        clean[key] = roundMoney(Math.max(0, number));
      }
    }

    if (ANALYTICS_BOOLEAN_KEYS.has(key)) {
      clean[key] = Boolean(value);
    }
  }
  return clean;
}

function hashValue(value, scope = "analytics") {
  const text = sanitizeText(value);
  if (!text) {
    return "";
  }
  return crypto
    .createHash("sha256")
    .update(`${ANALYTICS_SALT}:${scope}:${text}`)
    .digest("hex")
    .slice(0, 24);
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "";
}

function loadAnalyticsEvents() {
  try {
    if (!fs.existsSync(ANALYTICS_FILE)) {
      return [];
    }

    const lines = fs.readFileSync(ANALYTICS_FILE, "utf8").trim().split("\n").filter(Boolean);
    return lines
      .slice(-MAX_ANALYTICS_EVENTS)
      .map((line) => JSON.parse(line))
      .filter((event) => event && event.event && event.ts);
  } catch (error) {
    console.warn(`Could not load analytics events: ${error.message}`);
    return [];
  }
}

function normalizeAnalyticsEvent(raw = {}, req) {
  const event = sanitizeIdentifier(raw.event || raw.name, "unknown_event").toLowerCase();
  const userAgent = req.headers["user-agent"] || "";
  const requestHash = hashValue(`${getClientIp(req)}|${userAgent}`, new Date().toISOString().slice(0, 10));

  return {
    ts: new Date().toISOString(),
    clientTs: sanitizeText(raw.clientTs).slice(0, 48) || null,
    event,
    anonymousId: sanitizeIdentifier(raw.anonymousId, "").slice(0, 96) || null,
    sessionId: sanitizeIdentifier(raw.sessionId, "").slice(0, 96) || null,
    requestHash,
    page: sanitizeUrlReference(raw.page) || null,
    referrer: sanitizeUrlReference(raw.referrer) || null,
    properties: sanitizeAnalyticsProperties(raw.properties)
  };
}

function recordAnalyticsEvent(raw, req) {
  const event = normalizeAnalyticsEvent(raw, req);
  analyticsEvents.push(event);
  if (analyticsEvents.length > MAX_ANALYTICS_EVENTS) {
    analyticsEvents.splice(0, analyticsEvents.length - MAX_ANALYTICS_EVENTS);
  }

  fs.mkdir(path.dirname(ANALYTICS_FILE), { recursive: true }, (mkdirError) => {
    if (mkdirError) {
      console.warn(`Could not create analytics directory: ${mkdirError.message}`);
      return;
    }

    fs.appendFile(ANALYTICS_FILE, `${JSON.stringify(event)}\n`, (appendError) => {
      if (appendError) {
        console.warn(`Could not append analytics event: ${appendError.message}`);
      }
    });
  });

  return event;
}

function getCount(events, eventName, predicate = () => true) {
  return events.filter((event) => event.event === eventName && predicate(event)).length;
}

function getTopValues(events, propertyName, limit = 8) {
  const counts = new Map();
  events.forEach((event) => {
    const value = event.properties?.[propertyName];
    if (!value) {
      return;
    }
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function averageProperty(events, propertyName) {
  const values = events
    .map((event) => Number(event.properties?.[propertyName]))
    .filter((value) => Number.isFinite(value));
  if (!values.length) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function sumProperty(events, propertyName) {
  return events.reduce((sum, event) => {
    const value = Number(event.properties?.[propertyName]);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
}

function summarizeAiUsage(events, postEvents) {
  const usageEvents = events.filter((event) =>
    ["api_generate_completed", "api_workflow_completed"].includes(event.event)
  );
  const generationEvents = events.filter((event) => event.event === "api_generate_completed");
  const generationCount = postEvents.length || generationEvents.length;
  const generationCostUsd = sumProperty(generationEvents, "totalCostUsd");
  const generationTotalTokens = sumProperty(generationEvents, "totalTokens");
  const totalCostUsd = sumProperty(usageEvents, "totalCostUsd");
  const totalTokens = sumProperty(usageEvents, "totalTokens");

  return {
    pricing: getClaudeCostConfig(),
    generationInputTokens: sumProperty(generationEvents, "inputTokens"),
    generationOutputTokens: sumProperty(generationEvents, "outputTokens"),
    generationCacheCreationInputTokens: sumProperty(generationEvents, "cacheCreationInputTokens"),
    generationCacheReadInputTokens: sumProperty(generationEvents, "cacheReadInputTokens"),
    generationTotalTokens,
    generationCostUsd: roundMoney(generationCostUsd),
    averageTokensPerPost: generationCount ? Math.round(generationTotalTokens / generationCount) : 0,
    averageCostPerPostUsd: roundMoney(generationCount ? generationCostUsd / generationCount : 0),
    workflowTotalTokens: sumProperty(events.filter((event) => event.event === "api_workflow_completed"), "totalTokens"),
    workflowCostUsd: roundMoney(sumProperty(events.filter((event) => event.event === "api_workflow_completed"), "totalCostUsd")),
    totalTokens,
    totalConsumptionUsd: roundMoney(totalCostUsd)
  };
}

function rate(numerator, denominator) {
  if (!denominator) {
    return 0;
  }
  return Number(((numerator / denominator) * 100).toFixed(1));
}

function summarizeAnalyticsWindow(events) {
  const visitors = new Set(events.map((event) => event.anonymousId || event.requestHash).filter(Boolean));
  const sessions = new Set(events.map((event) => event.sessionId).filter(Boolean));
  const sessionUsers = new Map();

  events.forEach((event) => {
    const user = event.anonymousId || event.requestHash;
    if (!user || !event.sessionId) {
      return;
    }
    if (!sessionUsers.has(user)) {
      sessionUsers.set(user, new Set());
    }
    sessionUsers.get(user).add(event.sessionId);
  });

  const returningUsers = [...sessionUsers.values()].filter((userSessions) => userSessions.size > 1).length;
  const appLoaded = getCount(events, "app_loaded");
  const profileSelected = getCount(events, "profile_selected");
  const draftRequested = getCount(events, "draft_requested");
  const apiGenerateCompleted = getCount(events, "api_generate_completed");
  const apiGenerateFailed = getCount(events, "api_generate_failed");
  const clientPostEvents = events.filter((event) => event.event === "draft_generated");
  const serverPostEvents = events.filter((event) => event.event === "api_generate_completed");
  const postEvents = clientPostEvents.length ? clientPostEvents : serverPostEvents;
  const draftGenerated = postEvents.length;
  const draftFailed = getCount(events, "draft_failed") + apiGenerateFailed;
  const critiqueCompleted = getCount(events, "workflow_completed", (event) => event.properties?.stage === "critique");
  const rewriteCompleted = getCount(events, "workflow_completed", (event) => event.properties?.stage === "rewrite");
  const polishCompleted = getCount(events, "workflow_completed", (event) => event.properties?.stage === "polish");
  const copied = getCount(events, "post_copied");
  const saved = getCount(events, "post_saved");
  const apiGenerateEvents = events.filter((event) => event.event === "api_generate_completed");
  const apiWorkflowEvents = events.filter((event) => event.event === "api_workflow_completed");
  const generationAttempts = draftRequested || apiGenerateCompleted + apiGenerateFailed;
  const generationCompletions = draftGenerated;
  const aiUsage = summarizeAiUsage(events, postEvents);

  return {
    events: events.length,
    uniqueVisitors: visitors.size,
    sessions: sessions.size,
    returningUsers,
    returningUserRate: rate(returningUsers, visitors.size),
    funnel: {
      appLoaded,
      profileSelected,
      draftRequested,
      draftGenerated,
      critiqueCompleted,
      rewriteCompleted,
      polishCompleted,
      copied,
      saved
    },
    conversion: {
      draftPerVisit: rate(generationCompletions, appLoaded || visitors.size),
      polishPerDraft: rate(polishCompleted, generationCompletions),
      copyPerDraft: rate(copied, generationCompletions),
      savePerDraft: rate(saved, generationCompletions),
      copyOrSavePerDraft: rate(copied + saved, generationCompletions)
    },
    generation: {
      requested: generationAttempts,
      completed: generationCompletions,
      failed: draftFailed,
      failureRate: rate(draftFailed, generationAttempts),
      claude: postEvents.filter((event) => event.properties?.provider === "claude").length,
      local: postEvents.filter((event) => event.properties?.provider !== "claude").length,
      averageClientLatencyMs: averageProperty(events.filter((event) => event.event === "draft_generated"), "latencyMs"),
      averageServerLatencyMs: averageProperty(apiGenerateEvents, "latencyMs")
    },
    posts: {
      totalGenerated: generationCompletions,
      byProfile: getTopValues(postEvents, "profileId", 20)
    },
    aiUsage,
    workflowLatency: {
      critiqueMs: averageProperty(apiWorkflowEvents.filter((event) => event.properties?.stage === "critique"), "latencyMs"),
      rewriteMs: averageProperty(apiWorkflowEvents.filter((event) => event.properties?.stage === "rewrite"), "latencyMs"),
      polishMs: averageProperty(apiWorkflowEvents.filter((event) => event.properties?.stage === "polish"), "latencyMs")
    },
    topProfiles: getTopValues(events, "profileId"),
    postsByProfile: getTopValues(postEvents, "profileId", 20),
    topTopics: getTopValues(events, "topicId"),
    topPillars: getTopValues(events, "topicPillar"),
    styleModes: getTopValues(events, "styleMode"),
    viralityModes: getTopValues(events, "viralityMode")
  };
}

function buildAnalyticsSummary() {
  const now = Date.now();
  const events = analyticsEvents.slice();
  const last24h = events.filter((event) => now - Date.parse(event.ts) <= 24 * 60 * 60 * 1000);
  const last7d = events.filter((event) => now - Date.parse(event.ts) <= 7 * 24 * 60 * 60 * 1000);
  const last30d = events.filter((event) => now - Date.parse(event.ts) <= 30 * 24 * 60 * 60 * 1000);
  const windows = {
    last24h: summarizeAnalyticsWindow(last24h),
    last7d: summarizeAnalyticsWindow(last7d),
    last30d: summarizeAnalyticsWindow(last30d),
    allTime: summarizeAnalyticsWindow(events)
  };

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    eventStore: {
      inMemoryEvents: analyticsEvents.length,
      maxInMemoryEvents: MAX_ANALYTICS_EVENTS,
      persistence: "jsonl",
      rawContentCaptured: false
    },
    northStar: "completed_publishable_posts",
    mustHaveMetrics: [
      "dau",
      "mau",
      "tau",
      "total_posts_generated",
      "posts_generated_by_profile",
      "tokens_consumed_per_post",
      "dollar_value_per_post",
      "total_token_consumption",
      "total_dollar_consumption",
      "copy_or_save_rate",
      "generation_latency",
      "failure_rate"
    ],
    activeUsers: {
      dau: windows.last24h.uniqueVisitors,
      mau: windows.last30d.uniqueVisitors,
      tau: windows.allTime.uniqueVisitors
    },
    windows,
    costConfig: getClaudeCostConfig(),
    sourceNotes: [
      "DAU is unique active visitors in the last 24 hours.",
      "MAU is unique active visitors in the last 30 days.",
      "TAU is total unique active visitors captured in the event store.",
      "Dollar values are estimates from Anthropic usage metadata and configured per-million-token prices."
    ]
  };
}

function isAnalyticsSummaryAuthorized(req) {
  if (!ANALYTICS_ADMIN_TOKEN) {
    return true;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const headerToken = cleanSecret(req.headers["x-analytics-token"]);
  const queryToken = cleanSecret(url.searchParams.get("token"));
  return headerToken === ANALYTICS_ADMIN_TOKEN || queryToken === ANALYTICS_ADMIN_TOKEN;
}

function payloadContext(payload = {}) {
  return {
    profileId: payload.profile?.id,
    profileLabel: payload.profile?.label,
    topicId: payload.topic?.id,
    topicPillar: payload.topic?.pillar,
    angle: payload.angle,
    styleMode: payload.generationSettings?.styleMode,
    viralityMode: payload.generationSettings?.viralityMode,
    userIdeaLength: sanitizeText(payload.userIdea).length,
    currentTriggerLength: sanitizeText(payload.generationSettings?.currentAffair).length,
    sampleWordCount: sanitizeText(payload.personalStyle?.samples).split(/\s+/).filter(Boolean).length
  };
}

function getStyleModeGuidance(styleMode) {
  const guidance = {
    Balanced:
      "Blend Profile Voice and Tone Samples evenly. Keep positioning clear while preserving the author's sample-driven rhythm.",
    "Profile-led":
      "Prioritize Profile Voice: audience, point of view, credibility, and strategic positioning. Use Tone Samples lightly for cadence and structure.",
    "Tone-led":
      "Prioritize Tone Samples: sample rhythm, openings, tension-building, analogies, and punchy thesis lines. Keep Profile Voice as a factual constraint.",
    "Brand-led":
      "Prioritize Profile Voice: audience, point of view, credibility, and strategic positioning. Use Tone Samples lightly for cadence and structure.",
    "Style-led":
      "Prioritize Tone Samples: sample rhythm, openings, tension-building, analogies, and punchy thesis lines. Keep Profile Voice as a factual constraint."
  };
  return guidance[styleMode] || guidance.Balanced;
}

function getViralityGuidance(viralityMode, currentTrigger) {
  const guidance = {
    "Insight-led":
      "Optimize for durable insight, credibility, and usefulness rather than provocation.",
    "Current affairs":
      "Anchor the post in the supplied current trigger or selected Current Affairs topic. Do not invent news. Challenge the obvious headline and extract the underlying domain, leadership, market, or operating lesson.",
    "Contrarian commentary":
      "Offer a credible contrarian read. Be provocative because the reasoning is sharper, not because the tone is louder.",
    "Anecdote-led":
      "Open from an anecdote, lived experience, or concrete story, then bridge to product, leadership, AI, and system-level implications.",
    "Debate spark":
      "Frame the post around a clear tension or binary question that invites thoughtful disagreement without becoming shallow engagement bait."
  };

  const base = guidance[viralityMode] || guidance["Insight-led"];
  if (currentTrigger) {
    return `${base} Current trigger to use: ${currentTrigger}`;
  }
  return `${base} If no current trigger is supplied, do not fabricate a real current event. Use the selected topic as the trigger.`;
}

const LINKEDIN_POST_QUALITY_RULES = [
  "Start with a strong, specific hook. Avoid generic openings.",
  "Make the post feel like it came from a real person with lived experience, not a content template.",
  "Build around one clear insight instead of a list of shallow tips.",
  "Add a specific example, tradeoff, observation, or operating detail.",
  "Use short paragraphs and natural rhythm for LinkedIn readability.",
  "Avoid corporate jargon, motivational fluff, fake certainty, and over-polished AI-sounding lines.",
  "End with a thoughtful closing line or soft question that invites a real reply."
];

const LINKEDIN_FORBIDDEN_PHRASES = [
  "in today's fast-paced world",
  "game changer",
  "I'm thrilled to announce",
  "unlock your potential",
  "leverage synergy",
  "10x your growth",
  "most people don't know",
  "this changed everything"
];

function formatQualityRules() {
  return LINKEDIN_POST_QUALITY_RULES.map((rule) => `- ${rule}`).join("\n");
}

function formatForbiddenPhrases() {
  return LINKEDIN_FORBIDDEN_PHRASES.map((phrase) => `- "${phrase}"`).join("\n");
}

function buildPrompt(payload) {
  const linkedInPromptSkill = payload.linkedInPromptSkill || getLinkedInPromptSkill();
  const profile = payload.profile || {};
  const profileLabel = sanitizeText(profile.label, "Professional");
  const profileDescription = sanitizeText(profile.description, "A professional building a credible LinkedIn personal brand");
  const topic = sanitizeText(payload.topic?.title, "professional insight");
  const pillar = sanitizeText(payload.topic?.pillar, "Professional Insight");
  const angle = sanitizeText(payload.angle, "Teach");
  const userIdea = sanitizeBlock(payload.userIdea, "", 3500);
  const voice = payload.voice || {};
  const personalStyle = payload.personalStyle || {};
  const generationSettings = payload.generationSettings || {};
  const styleMode = sanitizeText(generationSettings.styleMode, "Balanced");
  const viralityMode = sanitizeText(generationSettings.viralityMode, "Insight-led");
  const currentTrigger = sanitizeBlock(generationSettings.currentAffair, "", 2500);
  const styleInstructions = sanitizeBlock(
    personalStyle.instructions,
    "Use a reflective, strategic, senior professional voice with concrete analogies and original insight."
  );
  const styleSamples = sanitizeBlock(personalStyle.samples, "No sample posts provided.", 18000);
  const history = Array.isArray(payload.history) ? payload.history.slice(0, 8) : [];

  const recentPosts = history.length
    ? history
        .map((item, index) => `${index + 1}. ${sanitizeText(item.topic)} (${sanitizeText(item.angle)})`)
        .join("\n")
    : "No prior posts yet.";

  return {
    system: [
      "You are an expert LinkedIn ghostwriter for founders, operators, engineers, and professionals building distinctive personal brands.",
      `Always apply the prompt skill loaded from ${LINKEDIN_PROMPT_SKILL_FILE}; it is the source of truth for post quality, critique, rewrite, and polish behavior.`,
      "Adapt the depth, examples, vocabulary, and business lens to the selected profile.",
      "Make the writing specific, grounded, useful, and human. The post should feel like it came from a thoughtful person with real judgment.",
      "Use sample posts or articles only to infer style, rhythm, structure, and level of depth. Do not copy distinctive sentences, examples, or wording from the samples.",
      "Return only the post text. Do not add labels, commentary, markdown headings, or hashtags unless the user explicitly asks for them."
    ].join(" "),
    user: [
      `Selected profile: ${profileLabel}`,
      `Profile context: ${profileDescription}`,
      `Topic: ${topic}`,
      `Pillar: ${pillar}`,
      `Angle: ${angle}`,
      `User idea: ${userIdea || "No additional user idea supplied."}`,
      `Audience: ${sanitizeText(voice.audience, "domain peers, operators, clients, and business leaders")}`,
      `Tone: ${sanitizeText(voice.tone, "authoritative but conversational, grounded in real experience")}`,
      `Point of view: ${sanitizeText(voice.pointOfView, "distinctive expertise compounds when professionals turn domain judgment into clear decisions and useful stories")}`,
      `Credibility signals: ${sanitizeText(voice.credentials, "domain experience, operating judgment, market awareness, and practical execution")}`,
      `Avoid: ${sanitizeText(voice.avoid, "jargon, breathless hype, em dashes, generic thought leadership")}`,
      `Style Mode: ${styleMode}`,
      `Style Mode guidance: ${getStyleModeGuidance(styleMode)}`,
      `Virality Lens: ${viralityMode}`,
      `Virality guidance: ${getViralityGuidance(viralityMode, currentTrigger)}`,
      "",
      `${LINKEDIN_PROMPT_SKILL_FILE} skill instructions:`,
      linkedInPromptSkill || "Prompt skill file could not be loaded. Fall back to the quality bar below.",
      "",
      "Personal writing instructions:",
      styleInstructions,
      "",
      "Reference sample posts or articles for tone calibration:",
      styleSamples,
      "",
      "Quality bar:",
      formatQualityRules(),
      "",
      "Avoid these phrases and patterns:",
      formatForbiddenPhrases(),
      "",
      "Style calibration notes:",
      "- Preserve the author's strategic, reflective, system-level reasoning while fitting the selected profile.",
      "- Prefer concrete analogies, named tensions, domain context, and crisp thesis lines.",
      "- For viral/current affairs posts, use a timely trigger to reveal a deeper domain truth, not as shallow trend-chasing.",
      "- Let paragraphs breathe with LinkedIn-friendly line breaks.",
      "- Create a new original post. Do not reuse the sample analogies unless the selected topic directly calls for them.",
      "",
      "Recent topics to avoid repeating:",
      recentPosts,
      "",
      "Write one publish-ready LinkedIn post with:",
      "- A strong, specific opening hook.",
      "- If a user idea is supplied, make it the core input rather than treating it as a side note.",
      "- One clear insight, a concrete example or tradeoff, and a useful implication.",
      "- A closing question or final line that invites thoughtful replies.",
      "- 130-220 words.",
      "- Natural line breaks for LinkedIn readability."
    ].join("\n")
  };
}

function fallbackPost(payload) {
  const profile = payload.profile || {};
  const profileLabel = sanitizeText(profile.label, "professional");
  const topic = payload.topic || {};
  const title = sanitizeText(topic.title, "How this shift changes work");
  const topicPhrase = title ? title.charAt(0).toLowerCase() + title.slice(1) : title;
  const pillar = sanitizeText(topic.pillar, "Professional Insight");
  const angle = sanitizeText(payload.angle, "Teach");
  const userIdea = sanitizeText(payload.userIdea);
  const voice = payload.voice || {};
  const personalStyle = payload.personalStyle || {};
  const generationSettings = payload.generationSettings || {};
  const styleMode = sanitizeText(generationSettings.styleMode, "Balanced");
  const viralityMode = sanitizeText(generationSettings.viralityMode, "Insight-led");
  const currentTrigger = sanitizeText(generationSettings.currentAffair);
  const hasStyleSamples = sanitizeText(personalStyle.samples).length > 0;
  const triggerPhrase = currentTrigger ? currentTrigger.split(/[.!?\n]/)[0].trim() : topicPhrase;
  const ideaLine = userIdea
    ? `The starting point is simple: ${userIdea}`
    : `The useful conversation starts with ${topicPhrase}.`;
  const audience = sanitizeText(voice.audience, "domain peers and business leaders");
  const pointOfView = sanitizeText(
    voice.pointOfView,
    "distinctive expertise compounds when professionals turn domain judgment into clear decisions and useful stories"
  );

  const hooks = {
    Teach: [
      `Most teams are asking the wrong first question about ${topicPhrase}.`,
      `${title}: the useful conversation is one layer deeper than tools.`,
      hasStyleSamples
        ? `The visible story is ${topicPhrase}. The real story is the system around it.`
        : `The useful lesson in ${topicPhrase} is less about tools and more about operating design.`,
      `A simple test for ${pillar.toLowerCase()}: does it improve the decision, or just decorate the workflow?`
    ],
    Challenge: [
      `The comfortable take on ${topicPhrase} misses the point.`,
      `I do not think ${topicPhrase} is mainly a technology problem.`,
      hasStyleSamples
        ? `We have to be careful with the easy story about ${topicPhrase}.`
        : `The strategic question behind ${topicPhrase} is harder than it looks.`,
      `A lot of ${pillar.toLowerCase()} work sounds strategic until you inspect the operating model.`
    ],
    "Personal story": [
      `A pattern I keep seeing in serious work: ${topicPhrase} only becomes real when the team changes its habits.`,
      `The first time ${topicPhrase} clicked for me, it was not because the tool got better.`,
      `One lesson I keep relearning: the decision matters more than the demo.`
    ],
    "Hot take": [
      `Hot take: ${topicPhrase} will reward disciplined operators more than flashy experimenters.`,
      `The biggest unlock in ${topicPhrase} is not speed. It is judgment at scale.`,
      `I suspect the winners in ${pillar.toLowerCase()} will look less like commentators and more like disciplined operators.`
    ]
  };

  if (viralityMode === "Current affairs") {
    hooks[angle] = [
      currentTrigger
        ? `The headline is about ${triggerPhrase}. The real story is what it reveals underneath.`
        : "The easiest take on this week's narrative is probably the least useful one.",
      "A current headline is useful only if it helps us see the system behind the noise.",
      "The news cycle moves fast. Operating reality moves slower. That gap is where the lesson sits."
    ];
  }

  if (viralityMode === "Contrarian commentary") {
    hooks[angle] = [
      `The popular take on ${topicPhrase} is too neat.`,
      `I think the obvious lesson from ${topicPhrase} is the wrong one.`,
      "We may be overestimating the headline shift and underestimating the operating shift."
    ];
  }

  if (viralityMode === "Anecdote-led") {
    hooks[angle] = [
      `A small moment changed how I think about ${topicPhrase}.`,
      "This sounds like a tools story. It is really a human behavior story.",
      "I keep coming back to one pattern: people do not adopt systems. They adopt relief from friction."
    ];
  }

  if (viralityMode === "Debate spark") {
    hooks[angle] = [
      `What if the way we talk about ${topicPhrase} is making teams less prepared?`,
      "There are two kinds of leaders in any major shift. Only one is building for what comes next.",
      "A question worth debating: are we automating work, or just moving the bottleneck somewhere else?"
    ];
  }

  const angleHooks = hooks[angle] || hooks.Teach;
  const hook = angleHooks[Math.floor(Math.random() * angleHooks.length)];

  const middleByAngle = {
    Teach:
      `A strong ${profileLabel.toLowerCase()} post has three parts: a real decision, a concrete example, and a lesson that helps the audience see their own work differently. If any one of those is missing, the post usually becomes a polished opinion instead of a useful signal.`,
    Challenge:
      "The trap is treating a new capability as a layer you add after the strategy is set. The better move is to ask where judgment, context, and repetition already live in the journey, then redesign that moment around a better decision.",
    "Personal story":
      "In practice, the useful breakthroughs tend to be quiet. A team notices the hidden constraint earlier. A leader makes a sharper trade-off. A customer or stakeholder gets a next step that feels obvious instead of abstract. None of this looks dramatic in a demo, but it compounds.",
    "Hot take":
      `The ${profileLabel.toLowerCase()} voices that stand out will not be the ones with the broadest takes. They will be the ones who can turn one high-value pattern into a repeatable insight, then keep sharpening it with real evidence.`
  };

  const styleModeLine = {
    Balanced: `For ${audience}, the implication is pretty direct: ${pointOfView}.`,
    "Profile-led": `For ${audience}, the strategic implication is direct: ${pointOfView}.`,
    "Tone-led": `But here is the part I keep returning to: ${pointOfView}.`,
    "Brand-led": `For ${audience}, the strategic implication is direct: ${pointOfView}.`,
    "Style-led": `But here is the part I keep returning to: ${pointOfView}.`
  };

  const viralityBridge = {
    "Insight-led": hasStyleSamples
      ? "It is not enough to make one part of the machine faster. The surrounding constraints, incentives, handoffs, and judgment loops have to change with it."
      : "That changes the brief. Instead of asking \"where can we use this?\", the sharper question is: \"which decision would become meaningfully better if the system had more context, memory, and iteration?\"",
    "Current affairs": currentTrigger
      ? "The point is not to react to the headline. The point is to ask what the headline exposes about incentives, power, adoption, and timing."
      : "The point is not to chase the news cycle. The point is to use it as a diagnostic for what is changing underneath.",
    "Contrarian commentary":
      "The contrarian move is not to be provocative for its own sake. It is to name the hidden bottleneck everyone feels but few teams redesign around.",
    "Anecdote-led":
      "Anecdotes matter because they reveal where the system breaks when real people, real incentives, and real constraints enter the room.",
    "Debate spark":
      "This is why the question is not merely technical. It is a leadership question about what we choose to optimize, protect, and redesign."
  };

  return [
    hook,
    "",
    ideaLine,
    "",
    middleByAngle[angle] || middleByAngle.Teach,
    "",
    styleModeLine[styleMode] || styleModeLine.Balanced,
    "",
    viralityBridge[viralityMode] || viralityBridge["Insight-led"],
    "",
    viralityMode === "Debate spark"
      ? "Which side of this debate are you on?"
      : "Where are you seeing this actually change the way work gets done, not just the language around it?"
  ].join("\n");
}

function buildWorkflowPrompt(payload) {
  const linkedInPromptSkill = payload.linkedInPromptSkill || getLinkedInPromptSkill();
  const stage = sanitizeText(payload.stage, "critique");
  const profile = payload.profile || {};
  const profileLabel = sanitizeText(profile.label, "Professional");
  const profileDescription = sanitizeText(profile.description, "A professional building a credible LinkedIn personal brand");
  const topic = sanitizeText(payload.topic?.title, "professional insight");
  const pillar = sanitizeText(payload.topic?.pillar, "Professional Insight");
  const angle = sanitizeText(payload.angle, "Teach");
  const userIdea = sanitizeBlock(payload.userIdea, "", 3500);
  const draft = sanitizeBlock(payload.draft, "", 9000);
  const critique = sanitizeBlock(payload.critique, "", 5000);
  const rewrite = sanitizeBlock(payload.rewrite, "", 9000);
  const voice = payload.voice || {};
  const personalStyle = payload.personalStyle || {};
  const generationSettings = payload.generationSettings || {};
  const styleMode = sanitizeText(generationSettings.styleMode, "Balanced");
  const viralityMode = sanitizeText(generationSettings.viralityMode, "Insight-led");
  const currentTrigger = sanitizeBlock(generationSettings.currentAffair, "", 2500);
  const styleInstructions = sanitizeBlock(
    personalStyle.instructions,
    "Use a reflective, strategic, senior professional voice with concrete analogies and original insight."
  );
  const styleSamples = sanitizeBlock(personalStyle.samples, "No sample posts provided.", 12000);

  const stageInstructions = {
    critique: [
      "Act as a strict LinkedIn content editor.",
      "Score the draft from 1 to 10 on hook strength, originality, clarity, specificity, usefulness, human voice, and LinkedIn readability.",
      "Identify what feels generic, weak, repetitive, artificial, or under-supported.",
      "Give one clear rewrite direction that would make the post stronger.",
      "Do not rewrite the full post in this step."
    ].join(" "),
    rewrite: [
      "Rewrite the draft using the critique and the quality bar.",
      "Preserve the author's point of view and personal style, but make the argument sharper, more specific, and more original.",
      "Use short paragraphs, one clear insight, a concrete example or tradeoff, and a thoughtful closing line or soft question.",
      "Return only the rewritten LinkedIn post, with natural line breaks."
    ].join(" "),
    polish: [
      "Final polish the rewritten post for publishing without changing the core message.",
      "Improve the opening hook, flow, sentence rhythm, clarity, specificity, and ending.",
      "Remove fluff, repetition, buzzwords, corporate jargon, and overly polished AI-sounding lines.",
      "Return only the final LinkedIn post."
    ].join(" ")
  };

  return {
    system: [
      "You are an expert LinkedIn editor for professionals building distinctive personal brands.",
      `Always apply the prompt skill loaded from ${LINKEDIN_PROMPT_SKILL_FILE}; it is the source of truth for post quality, critique, rewrite, and polish behavior.`,
      "Adapt edits to the selected profile's domain, audience, credibility signals, and business lens.",
      "Use sample posts or articles only to infer style, rhythm, structure, and level of depth. Do not copy distinctive sentences, examples, or wording from the samples.",
      "Keep the author's voice original, strategic, grounded, and senior."
    ].join(" "),
    user: [
      `Workflow stage: ${stage}`,
      `Stage instruction: ${stageInstructions[stage] || stageInstructions.critique}`,
      `Selected profile: ${profileLabel}`,
      `Profile context: ${profileDescription}`,
      `Topic: ${topic}`,
      `Pillar: ${pillar}`,
      `Angle: ${angle}`,
      `User idea: ${userIdea || "No additional user idea supplied."}`,
      `Style Mode: ${styleMode}`,
      `Virality Lens: ${viralityMode}`,
      `Current trigger: ${currentTrigger || "None supplied."}`,
      `Audience: ${sanitizeText(voice.audience, "domain peers, operators, clients, and business leaders")}`,
      `Tone: ${sanitizeText(voice.tone, "authoritative but conversational, grounded in real experience")}`,
      `Point of view: ${sanitizeText(voice.pointOfView, "distinctive expertise compounds when professionals turn domain judgment into clear decisions and useful stories")}`,
      `Credibility signals: ${sanitizeText(voice.credentials, "domain experience, operating judgment, market awareness, and practical execution")}`,
      `Avoid: ${sanitizeText(voice.avoid, "jargon, breathless hype, em dashes, generic thought leadership")}`,
      "",
      `${LINKEDIN_PROMPT_SKILL_FILE} skill instructions:`,
      linkedInPromptSkill || "Prompt skill file could not be loaded. Fall back to the quality bar below.",
      "",
      "Personal writing instructions:",
      styleInstructions,
      "",
      "Reference sample posts or articles for tone calibration:",
      styleSamples,
      "",
      "Quality bar:",
      formatQualityRules(),
      "",
      "Avoid these phrases and patterns:",
      formatForbiddenPhrases(),
      "",
      "Current draft:",
      draft || "No draft supplied.",
      "",
      "Critique notes:",
      critique || "No critique supplied.",
      "",
      "Rewrite version:",
      rewrite || "No rewrite supplied."
    ].join("\n")
  };
}

function fallbackWorkflowText(payload) {
  const stage = sanitizeText(payload.stage, "critique");
  if (stage === "critique") {
    return fallbackCritique(payload);
  }

  if (stage === "rewrite") {
    return fallbackRewrite(payload);
  }

  if (stage === "polish") {
    return fallbackPolish(payload);
  }

  return "";
}

function fallbackCritique(payload) {
  const draft = sanitizeText(payload.draft);
  const words = draft ? draft.split(/\s+/).length : 0;
  const hasIdea = Boolean(sanitizeText(payload.userIdea));
  const hasQuestion = draft.includes("?");

  return [
    "Scores: Hook 6/10, Originality 6/10, Clarity 7/10, Specificity 5/10, Usefulness 7/10, Human voice 6/10, LinkedIn readability 7/10.",
    "Hook: Make the first line sharper, more specific, and less explanatory. It should create tension before it explains.",
    `Core idea: ${hasIdea ? "The draft has a user idea to build from; make that idea the spine of the post." : "Add a concrete user idea, lived trigger, or personal observation to make the post more ownable."}`,
    "Specificity: Add one concrete example, tradeoff, operating detail, or observation that proves the claim.",
    "Originality: Name the hidden bottleneck, tradeoff, or human behavior underneath the topic.",
    `Engagement: ${hasQuestion ? "The closing question is present; make it softer and more debatable." : "Add a thoughtful closing line or soft question that invites a real point of view."}`,
    `Length: ${words} words. Aim for 130-220 words unless the story needs more room.`,
    "Rewrite direction: Lead with the strongest tension, build around one clear insight, add one concrete example or analogy, then land the leadership or domain implication."
  ].join("\n");
}

function fallbackRewrite(payload) {
  const profileLabel = sanitizeText(payload.profile?.label, "professional");
  const idea = sanitizeText(payload.userIdea, payload.topic?.title || "this shift");
  const voice = payload.voice || {};
  const audience = sanitizeText(voice.audience, "domain peers and business leaders");
  const pointOfView = sanitizeText(
    voice.pointOfView,
    "distinctive expertise compounds when professionals turn domain judgment into clear decisions and useful stories"
  );

  return [
    `The obvious story is ${idea}.`,
    "",
    "The useful story sits one layer lower.",
    "",
    "Most teams look at change through the lens of capability: what can the tool do, how fast can it do it, and where can we plug it into the workflow?",
    "",
    "But capability is rarely the real bottleneck.",
    "",
    "The harder question is whether the surrounding system is ready for the change: incentives, handoffs, governance, trust, and the human judgment that still has to sit between the tool and the outcome.",
    "",
    "That is where the tradeoff appears. A faster tool can create slower decisions if the operating model around it is still unclear.",
    "",
    `For ${audience}, the implication is direct: ${pointOfView}.`,
    "",
    `For a ${profileLabel.toLowerCase()}, the stronger question is not just what changed. It is which decision, behavior, or operating rhythm now needs to be redesigned.`,
    "",
    "Where do you think teams are still confusing new capability with real readiness?"
  ].join("\n");
}

function fallbackPolish(payload) {
  const source = sanitizeBlock(payload.rewrite || payload.draft, "", 9000);
  return source
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+$/gm, "")
    .replace(/very /gi, "")
    .replace(/really /gi, "")
    .trim();
}

async function runWorkflowStage(payload) {
  const linkedInPromptSkill = getLinkedInPromptSkill();
  const promptPayload = { ...payload, linkedInPromptSkill };
  const apiKey = getAnthropicApiKey();
  if (!apiKey.value) {
    return {
      text: fallbackWorkflowText(promptPayload),
      provider: "local",
      model: "local-brand-engine",
      usage: calculateUsageCost()
    };
  }

  const prompt = buildWorkflowPrompt(promptPayload);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey.value,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1100,
      temperature: 0.72,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Claude workflow request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const text = (data.content || [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Claude returned an empty workflow result");
  }

  return {
    text,
    provider: "claude",
    model: data.model || CLAUDE_MODEL,
    usage: calculateUsageCost(data.usage)
  };
}

async function generatePost(payload) {
  const linkedInPromptSkill = getLinkedInPromptSkill();
  const promptPayload = { ...payload, linkedInPromptSkill };
  const apiKey = getAnthropicApiKey();
  if (!apiKey.value) {
    return {
      post: fallbackPost(promptPayload),
      provider: "local",
      model: "local-brand-engine",
      usage: calculateUsageCost()
    };
  }

  const prompt = buildPrompt(promptPayload);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey.value,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 900,
      temperature: 0.78,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Claude request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const post = (data.content || [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  if (!post) {
    throw new Error("Claude returned an empty draft");
  }

  return {
    post,
    provider: "claude",
    model: data.model || CLAUDE_MODEL,
    usage: calculateUsageCost(data.usage)
  };
}

function isInsideRoot(filePath) {
  return filePath === ROOT || filePath.startsWith(`${ROOT}${path.sep}`);
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let requestedPath = "/";

  try {
    requestedPath = decodeURIComponent(url.pathname);
  } catch {
    sendText(res, 400, "Bad request");
    return;
  }

  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(ROOT, relativePath));

  if (!isInsideRoot(filePath)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      sendText(res, 404, "Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      "content-type": MIME_TYPES[ext] || "application/octet-stream",
      "cache-control": ext === ".html" || ext === ".js" || ext === ".css" || ext === ".webmanifest"
        ? "no-cache"
        : "public, max-age=86400"
    });
    res.end(req.method === "HEAD" ? undefined : contents);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/health") {
    sendJson(res, 200, getConfigStatus());
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/api/analytics/summary")) {
    if (!isAnalyticsSummaryAuthorized(req)) {
      sendJson(res, 401, { error: "Analytics summary requires a valid token." });
      return;
    }

    sendJson(res, 200, buildAnalyticsSummary());
    return;
  }

  if (req.method === "POST" && req.url === "/api/analytics/event") {
    try {
      const payload = JSON.parse(await readBody(req));
      recordAnalyticsEvent(payload, req);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/api/generate") {
    const startedAt = Date.now();
    try {
      const payload = JSON.parse(await readBody(req));
      try {
        const result = await generatePost(payload);
        recordAnalyticsEvent({
          event: "api_generate_completed",
          properties: {
            ...payloadContext(payload),
            route: "/api/generate",
            provider: result.provider,
            model: result.model,
            latencyMs: Date.now() - startedAt,
            success: true,
            ...result.usage,
            costPerPostUsd: result.usage?.totalCostUsd || 0
          }
        }, req);
        sendJson(res, 200, result);
      } catch (error) {
        const fallback = {
          post: fallbackPost(payload),
          provider: "local",
          model: "local-brand-engine",
          usage: calculateUsageCost(),
          warning: error.message
        };
        recordAnalyticsEvent({
          event: "api_generate_completed",
          properties: {
            ...payloadContext(payload),
            route: "/api/generate",
            provider: fallback.provider,
            model: fallback.model,
            latencyMs: Date.now() - startedAt,
            success: true,
            ...fallback.usage,
            costPerPostUsd: 0,
            usedFallback: true,
            errorCode: "claude_generate_failed"
          }
        }, req);
        sendJson(res, 200, fallback);
      }
    } catch (error) {
      recordAnalyticsEvent({
        event: "api_generate_failed",
        properties: {
          route: "/api/generate",
          latencyMs: Date.now() - startedAt,
          success: false,
          errorCode: "bad_request"
        }
      }, req);
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/api/workflow") {
    const startedAt = Date.now();
    try {
      const payload = JSON.parse(await readBody(req));
      try {
        const result = await runWorkflowStage(payload);
        recordAnalyticsEvent({
          event: "api_workflow_completed",
          properties: {
            ...payloadContext(payload),
            route: "/api/workflow",
            stage: payload.stage,
            provider: result.provider,
            model: result.model,
            latencyMs: Date.now() - startedAt,
            success: true,
            ...result.usage
          }
        }, req);
        sendJson(res, 200, result);
      } catch (error) {
        const fallback = {
          text: fallbackWorkflowText(payload),
          provider: "local",
          model: "local-brand-engine",
          usage: calculateUsageCost(),
          warning: error.message
        };
        recordAnalyticsEvent({
          event: "api_workflow_completed",
          properties: {
            ...payloadContext(payload),
            route: "/api/workflow",
            stage: payload.stage,
            provider: fallback.provider,
            model: fallback.model,
            latencyMs: Date.now() - startedAt,
            success: true,
            ...fallback.usage,
            usedFallback: true,
            errorCode: "claude_workflow_failed"
          }
        }, req);
        sendJson(res, 200, fallback);
      }
    } catch (error) {
      recordAnalyticsEvent({
        event: "api_workflow_failed",
        properties: {
          route: "/api/workflow",
          latencyMs: Date.now() - startedAt,
          success: false,
          errorCode: "bad_request"
        }
      }, req);
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  sendText(res, 405, "Method not allowed", { "allow": "GET, HEAD, POST" });
});

function shutdown(signal) {
  console.log(`${signal} received; closing HTTP server.`);
  server.close(() => {
    process.exit(0);
  });
}

server.on("error", (error) => {
  console.error(`HTTP server failed to start: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`LinkedIn Content Studio running at http://${HOST}:${PORT}`);
  const configStatus = getConfigStatus();
  console.log(`Anthropic env status: ${configStatus.anthropicEnvStatus}`);
  console.log(`Relevant env names visible: ${configStatus.relevantEnvNames.join(", ") || "none"}`);
  if (configStatus.anthropicKeyDetected) {
    console.log(`Claude generation enabled via ${configStatus.anthropicKeyName}.`);
  } else {
    console.log("No Anthropic API key detected; using local draft generation.");
    if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_NAME) {
      console.log("Railway fix: add ANTHROPIC_API_KEY to this service's Variables tab, then redeploy this service.");
    }
  }
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
