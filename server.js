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
  "graderScore",
  "historyCount",
  "inputTokens",
  "latencyMs",
  "outputTokens",
  "briefFilledCount",
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

const DRAFT_GRADER_CRITERIA = [
  "The post has an author-owned point of view, not a generic explanation of the topic.",
  "The hook creates tension, surprise, or a sharp reframing within the first two lines.",
  "The argument uses the selected profile, user idea, and content brief instead of drifting into broad thought leadership.",
  "The post uses at least one concrete anchor: anecdote, operating detail, data point, named example, tradeoff, or lived observation.",
  "The writing reflects the supplied tone samples or Style DNA without copying sample wording or fabricating personal details.",
  "The reasoning progresses cleanly from hook to insight to implication to ending.",
  "The post avoids generic AI/content cliches, vague hype, filler, and overly polished corporate language.",
  "The ending invites a meaningful point of view, debate, or reflection from the intended audience."
];

const DRAFT_GRADER_MANDATORY_CRITERIA = [
  "It must be a complete LinkedIn post, not notes, an outline, or a critique.",
  "It must be grounded in the user's supplied idea, profile, topic, or content brief.",
  "It must not copy distinctive sentences or examples from the tone samples.",
  "It must not include prompt, process, or meta commentary.",
  "It must not invent personal facts, client names, metrics, or experiences that were not supplied."
];

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

function combineUsageCost(...usageItems) {
  return usageItems.reduce((combined, usage) => ({
    inputTokens: combined.inputTokens + Number(usage?.inputTokens || 0),
    outputTokens: combined.outputTokens + Number(usage?.outputTokens || 0),
    cacheCreationInputTokens: combined.cacheCreationInputTokens + Number(usage?.cacheCreationInputTokens || 0),
    cacheReadInputTokens: combined.cacheReadInputTokens + Number(usage?.cacheReadInputTokens || 0),
    totalTokens: combined.totalTokens + Number(usage?.totalTokens || 0),
    inputTokenCostUsd: roundMoney(combined.inputTokenCostUsd + Number(usage?.inputTokenCostUsd || 0)),
    outputTokenCostUsd: roundMoney(combined.outputTokenCostUsd + Number(usage?.outputTokenCostUsd || 0)),
    cacheTokenCostUsd: roundMoney(combined.cacheTokenCostUsd + Number(usage?.cacheTokenCostUsd || 0)),
    totalCostUsd: roundMoney(combined.totalCostUsd + Number(usage?.totalCostUsd || 0))
  }), calculateUsageCost());
}

function getClaudeText(data = {}) {
  return (data.content || [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function extractJsonObject(text) {
  const cleanText = sanitizeBlock(text, "", 12000)
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleanText);
  } catch {
    const start = cleanText.indexOf("{");
    const end = cleanText.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No JSON object found in grader response");
    }
    return JSON.parse(cleanText.slice(start, end + 1));
  }
}

function toStringList(value, fallback = []) {
  const items = Array.isArray(value) ? value : fallback;
  return items
    .map((item) => sanitizeText(item))
    .filter(Boolean)
    .slice(0, 5);
}

function normalizeGraderEvaluation(evaluation = {}) {
  const scoreValue = Number(evaluation.score);
  const score = Math.max(1, Math.min(10, Number.isFinite(scoreValue) ? Math.round(scoreValue) : 5));
  const verdict = score >= 9
    ? "Excellent"
    : score >= 8
      ? "Strong"
      : score >= 7
        ? "Publishable with edits"
        : score >= 4
          ? "Needs rewrite"
          : "Not publishable";

  return {
    score,
    maxScore: 10,
    pass: score >= 7,
    verdict,
    strengths: toStringList(evaluation.strengths, ["The draft has a recognizable topic and enough structure to evaluate."]).slice(0, 3),
    weaknesses: toStringList(evaluation.weaknesses, ["The draft needs sharper specificity, stronger voice fit, and a more original tension."]).slice(0, 3),
    reasoning: sanitizeBlock(
      evaluation.reasoning,
      "The grader could not return detailed reasoning, so treat the score as directional.",
      1200
    ),
    criteria: DRAFT_GRADER_CRITERIA,
    mandatoryCriteria: DRAFT_GRADER_MANDATORY_CRITERIA
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
  const gradedWorkflowEvents = apiWorkflowEvents.filter((event) => Number(event.properties?.graderScore) > 0);
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
    grader: {
      evaluatedDrafts: gradedWorkflowEvents.length,
      averageScore: averageProperty(gradedWorkflowEvents, "graderScore"),
      passRate: rate(
        gradedWorkflowEvents.filter((event) => Number(event.properties?.graderScore) >= 7).length,
        gradedWorkflowEvents.length
      )
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
      "average_grader_score",
      "grader_pass_rate",
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
      "Dollar values are estimates from Anthropic usage metadata and configured per-million-token prices.",
      "Grader scores are aggregate-only; raw drafts and critique text are not stored in analytics."
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
  const contentBrief = getContentBrief(payload);
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
    briefFilledCount: getBriefFilledCount(contentBrief),
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

function splitStyleSamples(samples) {
  const text = sanitizeBlock(samples, "", 22000);
  if (!text) {
    return [];
  }

  const numberedSamples = text
    .split(/\n\s*\n(?=\s*\d+\.\s)/)
    .map((sample) => sample.trim())
    .filter(Boolean);

  return numberedSamples.length > 1 ? numberedSamples : [text];
}

function getFirstMeaningfulLine(sample) {
  return sample
    .split(/\n+/)
    .map((line) => sanitizeText(line.replace(/^\d+\.\s*/, "")))
    .find(Boolean) || "";
}

function summarizeOpeningPatterns(samples) {
  const openings = samples
    .map(getFirstMeaningfulLine)
    .filter(Boolean)
    .slice(0, 6)
    .map((line) => `- "${line.slice(0, 170)}${line.length > 170 ? "..." : ""}"`);

  return openings.length ? openings.join("\n") : "- No sample openings available.";
}

function detectStyleMoves(sampleText) {
  const text = sanitizeText(sampleText).toLowerCase();
  const moves = [];

  if (/vande bharat|hyrox|stack|qualia|patience|red|doctor|post-scarcity|simulation/.test(text)) {
    moves.push("Uses concrete analogies or cultural/lived references to make an abstract idea visible.");
  }

  if (/paradox|dilemma|trap|illusion|contrarian|obvious|careful|wrong one|quietly changed/.test(text)) {
    moves.push("Names a tension, paradox, trap, or category shift before offering the point of view.");
  }

  if (/system|workflow|silo|downstream|operating|decision|incentive|bottleneck|process/.test(text)) {
    moves.push("Moves from individual behavior to system-level consequences and operating constraints.");
  }

  if (/but here's|here's what|the useful|it is not|it's not enough|the floor|the ceiling|only one/.test(text)) {
    moves.push("Uses short thesis lines to reframe the argument after the setup.");
  }

  if (/\?/.test(sampleText)) {
    moves.push("Ends or pivots with questions that invite real disagreement rather than easy applause.");
  }

  if (/i almost|i keep|lately|first time|i didn't|my/.test(text)) {
    moves.push("Allows personal experience when it sharpens the business or leadership lesson.");
  }

  return moves.length ? moves : [
    "Builds from a specific observation into a broader professional implication.",
    "Keeps the argument reflective, strategic, and grounded."
  ];
}

function buildStyleDna(personalStyle = {}) {
  const samples = splitStyleSamples(personalStyle.samples);
  const sampleText = sanitizeBlock(personalStyle.samples, "", 22000);
  const moves = [...new Set(detectStyleMoves(sampleText))];
  const wordCount = sampleText ? sampleText.split(/\s+/).filter(Boolean).length : 0;

  return [
    `Sample bank: ${samples.length} sample${samples.length === 1 ? "" : "s"}, ${wordCount} words.`,
    "Observed openings:",
    summarizeOpeningPatterns(samples),
    "",
    "Author style DNA to enforce:",
    ...moves.map((move) => `- ${move}`),
    "- Prefer one sharp central claim over a list of tips.",
    "- Build the post as: concrete trigger -> tension/paradox -> system insight -> practical implication -> memorable closing question or line.",
    "- Use plain, senior, reflective language. The post should feel argued, not generated.",
    "- If an anecdote is used, make it specific enough to feel real but do not invent biographical facts not supplied by the user.",
    "- Do not copy sample examples, named analogies, or distinctive phrasing unless the user supplied them for this post."
  ].join("\n");
}

function getContentBrief(payload = {}) {
  const brief = payload.contentBrief || payload.brief || {};
  return {
    thesis: sanitizeBlock(brief.thesis, "", 1200),
    commonBelief: sanitizeBlock(brief.commonBelief, "", 1200),
    anecdote: sanitizeBlock(brief.anecdote, "", 1600),
    evidence: sanitizeBlock(brief.evidence, "", 1600),
    takeaway: sanitizeBlock(brief.takeaway, "", 1200)
  };
}

function getBriefFilledCount(brief = {}) {
  return Object.values(brief).filter((value) => sanitizeText(value).length > 0).length;
}

function formatContentBrief(brief = {}) {
  const rows = [
    ["Author thesis", brief.thesis],
    ["Common belief to challenge", brief.commonBelief],
    ["Anecdote or lived trigger", brief.anecdote],
    ["Evidence, example, or operating detail", brief.evidence],
    ["Reader takeaway", brief.takeaway]
  ].filter(([, value]) => sanitizeText(value));

  if (!rows.length) {
    return "No structured brief supplied. Infer a brief from the user idea and selected topic, but do not invent personal facts.";
  }

  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
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
  const styleDna = buildStyleDna(personalStyle);
  const contentBrief = getContentBrief(payload);
  const history = Array.isArray(payload.history) ? payload.history.slice(0, 8) : [];

  const recentPosts = history.length
    ? history
        .map((item, index) => `${index + 1}. ${sanitizeText(item.topic)} (${sanitizeText(item.angle)})`)
        .join("\n")
    : "No prior posts yet.";

  return {
    system: [
      "You are a senior LinkedIn ghostwriter and editorial strategist for distinctive professional voices.",
      "Your job is style transfer with judgment: the output must sound like the author, not like a generic content assistant.",
      `Always apply the prompt skill loaded from ${LINKEDIN_PROMPT_SKILL_FILE}; it is the source of truth for post quality, critique, rewrite, and polish behavior.`,
      "Adapt the depth, examples, vocabulary, and business lens to the selected profile.",
      "Make the writing specific, grounded, useful, and human. The post should feel like it came from a thoughtful person with real judgment.",
      "Use sample posts or articles to infer style DNA, rhythm, structure, argument shape, and level of depth. Do not copy distinctive sentences, examples, or wording from the samples.",
      "Before returning the post, silently reject any draft that could be produced without the supplied samples or brief.",
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
      "Content brief:",
      formatContentBrief(contentBrief),
      "",
      `${LINKEDIN_PROMPT_SKILL_FILE} skill instructions:`,
      linkedInPromptSkill || "Prompt skill file could not be loaded. Fall back to the quality bar below.",
      "",
      "Personal writing instructions:",
      styleInstructions,
      "",
      "Extracted author Style DNA:",
      styleDna,
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
      "- Use at least three Style DNA moves in the final post.",
      "- If the structured brief contains a thesis, assumption, anecdote, evidence, or takeaway, make those the spine of the post.",
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
      "- A visible author point of view, not neutral commentary.",
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
  const contentBrief = getContentBrief(payload);
  const triggerPhrase = currentTrigger ? currentTrigger.split(/[.!?\n]/)[0].trim() : topicPhrase;
  const ideaLine = userIdea
    ? `The starting point is simple: ${userIdea}`
    : contentBrief.thesis
    ? `The thesis is simple: ${contentBrief.thesis}`
    : `The useful conversation starts with ${topicPhrase}.`;
  const briefLine = contentBrief.commonBelief
    ? `The common belief is that ${contentBrief.commonBelief}. But that is only the surface layer.`
    : contentBrief.anecdote
    ? `The anchor is concrete: ${contentBrief.anecdote}`
    : contentBrief.evidence
    ? `The proof point matters: ${contentBrief.evidence}`
    : "";
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
    briefLine,
    briefLine ? "" : null,
    middleByAngle[angle] || middleByAngle.Teach,
    "",
    styleModeLine[styleMode] || styleModeLine.Balanced,
    "",
    viralityBridge[viralityMode] || viralityBridge["Insight-led"],
    "",
    viralityMode === "Debate spark"
      ? "Which side of this debate are you on?"
      : "Where are you seeing this actually change the way work gets done, not just the language around it?"
  ].filter((line) => line !== null).join("\n");
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
  const graderEvaluation = payload.graderEvaluation
    ? sanitizeBlock(JSON.stringify(payload.graderEvaluation, null, 2), "", 3000)
    : "";
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
  const styleDna = buildStyleDna(personalStyle);
  const contentBrief = getContentBrief(payload);

  const stageInstructions = {
    critique: [
      "Act as a demanding editorial director, not a scoring bot.",
      "Diagnose whether the draft uses the author's Style DNA, content brief, selected profile, and topic with enough specificity.",
      "Do not begin with category scores. Start with the single biggest editorial problem.",
      "Identify generic lines, weak reasoning, missing proof, missed sample-style patterns, and places where the draft sounds like AI.",
      "Return actionable rewrite instructions, not encouragement.",
      "Do not rewrite the full post in this step."
    ].join(" "),
    rewrite: [
      "Rewrite the draft using the critique as the edit brief.",
      "Use the grader evaluation as a hard quality bar; directly address low-scoring criteria instead of cosmetically editing sentences.",
      "Preserve the author's point of view and personal style, but make the argument sharper, more specific, and more original.",
      "Use at least three Style DNA moves. Use the content brief as the spine if any brief fields are supplied.",
      "Use short paragraphs, one clear insight, a concrete example or tradeoff, and a thoughtful closing line or soft question.",
      "Delete generic framing instead of polishing it.",
      "Return only the rewritten LinkedIn post, with natural line breaks."
    ].join(" "),
    polish: [
      "Final polish the rewritten post for publishing without changing the core message.",
      "Improve the opening hook, flow, sentence rhythm, clarity, specificity, and ending.",
      "Remove fluff, repetition, buzzwords, corporate jargon, and overly polished AI-sounding lines.",
      "Keep the author's sample-driven rhythm and do not flatten distinctive phrasing into generic professional writing.",
      "Return only the final LinkedIn post."
    ].join(" ")
  };

  const critiqueOutputFormat = [
    "For critique stage, use this exact format:",
    "EDITORIAL DIAGNOSIS",
    "- Core problem: one blunt sentence.",
    "- Generic or weak lines: quote or identify up to three lines that should be cut or rewritten.",
    "- Voice mismatch: explain where it fails the author's Style DNA.",
    "- Missing specificity: name the example, detail, evidence, or anecdote needed.",
    "- Argument gap: explain what reasoning step is missing.",
    "- LinkedIn risk: say whether it feels skippable, derivative, too polished, or too abstract.",
    "",
    "REWRITE STRATEGY",
    "- New hook direction:",
    "- Concrete anchor to add:",
    "- Thesis line to sharpen:",
    "- Ending move:",
    "",
    "QUALITY VERDICT",
    "- Publishable: Yes / Almost / No",
    "- Overall score: X/10"
  ].join("\n");

  return {
    system: [
      "You are a senior LinkedIn editorial director for professionals building distinctive personal brands.",
      "Be specific, unsentimental, and practical. Your job is to protect the author's voice from generic content.",
      `Always apply the prompt skill loaded from ${LINKEDIN_PROMPT_SKILL_FILE}; it is the source of truth for post quality, critique, rewrite, and polish behavior.`,
      "Adapt edits to the selected profile's domain, audience, credibility signals, and business lens.",
      "Use sample posts or articles to infer style DNA, rhythm, structure, argument shape, and level of depth. Do not copy distinctive sentences, examples, or wording from the samples.",
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
      "Content brief:",
      formatContentBrief(contentBrief),
      "",
      `${LINKEDIN_PROMPT_SKILL_FILE} skill instructions:`,
      linkedInPromptSkill || "Prompt skill file could not be loaded. Fall back to the quality bar below.",
      "",
      "Personal writing instructions:",
      styleInstructions,
      "",
      "Extracted author Style DNA:",
      styleDna,
      "",
      stage === "critique" ? critiqueOutputFormat : "",
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
      "Grader evaluation:",
      graderEvaluation || "No grader evaluation supplied.",
      "",
      "Rewrite version:",
      rewrite || "No rewrite supplied."
    ].join("\n")
  };
}

function buildDraftGraderPrompt(payload, critiqueText = "") {
  const profile = payload.profile || {};
  const voice = payload.voice || {};
  const personalStyle = payload.personalStyle || {};
  const generationSettings = payload.generationSettings || {};
  const contentBrief = getContentBrief(payload);
  const taskInputs = {
    profile: {
      label: sanitizeText(profile.label, "Professional"),
      description: sanitizeText(profile.description, "")
    },
    topic: {
      title: sanitizeText(payload.topic?.title, "professional insight"),
      pillar: sanitizeText(payload.topic?.pillar, "Professional Insight")
    },
    angle: sanitizeText(payload.angle, "Teach"),
    userIdea: sanitizeBlock(payload.userIdea, "", 2500),
    contentBrief,
    styleMode: sanitizeText(generationSettings.styleMode, "Balanced"),
    viralityMode: sanitizeText(generationSettings.viralityMode, "Insight-led"),
    currentTrigger: sanitizeBlock(generationSettings.currentAffair, "", 1600),
    voice: {
      tone: sanitizeText(voice.tone, ""),
      audience: sanitizeText(voice.audience, ""),
      pointOfView: sanitizeText(voice.pointOfView, ""),
      credibility: sanitizeText(voice.credentials, ""),
      avoid: sanitizeText(voice.avoid, "")
    },
    styleInstructions: sanitizeBlock(personalStyle.instructions, "", 2500),
    styleSamples: sanitizeBlock(personalStyle.samples, "", 6000)
  };

  return {
    system: [
      "You are a rigorous model grader for LinkedIn post quality.",
      "Use the evaluation method from prompt evals: grade only against the listed criteria, use the full 1-10 scale, and be willing to give low scores.",
      "You are not the editor in this step. Do not rewrite the post. Do not add new criteria beyond the supplied rubric."
    ].join(" "),
    user: [
      "Your task is to evaluate the following AI-generated LinkedIn post with EXTREME RIGOR.",
      "",
      "Original task description:",
      "<task_description>",
      "Write a distinctive LinkedIn post for the selected professional profile, using the user idea, content brief, voice settings, and tone samples. The post should be publish-ready, specific, original, and aligned to the author's style.",
      "</task_description>",
      "",
      "Original task inputs:",
      "<task_inputs>",
      JSON.stringify(taskInputs, null, 2),
      "</task_inputs>",
      "",
      "Solution to Evaluate:",
      "<solution>",
      sanitizeBlock(payload.draft, "", 9000) || "No draft supplied.",
      "</solution>",
      "",
      critiqueText
        ? [
            "Editorial critique context:",
            "<critique>",
            sanitizeBlock(critiqueText, "", 3000),
            "</critique>",
            "Use the critique only as supporting context. Grade the solution itself against the criteria below."
          ].join("\n")
        : "",
      "",
      "Criteria you should use to evaluate the solution:",
      "<criteria>",
      DRAFT_GRADER_CRITERIA.map((criterion) => `- ${criterion}`).join("\n"),
      "</criteria>",
      "",
      "Mandatory Requirements - ANY VIOLATION MEANS AUTOMATIC FAILURE (score of 3 or lower):",
      "<extra_important_criteria>",
      DRAFT_GRADER_MANDATORY_CRITERIA.map((criterion) => `- ${criterion}`).join("\n"),
      "</extra_important_criteria>",
      "",
      "Scoring Guidelines:",
      "* Score 1-3: Solution fails to meet one or more mandatory requirements.",
      "* Score 4-6: Solution meets all mandatory requirements but has significant deficiencies in secondary criteria.",
      "* Score 7-8: Solution meets all mandatory requirements and most secondary criteria, with minor issues.",
      "* Score 9-10: Solution meets all mandatory and secondary criteria.",
      "",
      "Important scoring instructions:",
      "* Grade the output based ONLY on the listed criteria.",
      "* If the post meets all mandatory and secondary criteria, give it a 10.",
      "* Do not reward generic polish. Reward specificity, author voice, reasoning quality, and fit to the supplied samples.",
      "* Any mandatory violation must result in a score of 3 or lower.",
      "* Use the full scale.",
      "",
      "Output Format",
      "Respond with JSON only, in this exact shape:",
      "{",
      '  "strengths": ["string"],',
      '  "weaknesses": ["string"],',
      '  "reasoning": "string",',
      '  "score": number',
      "}"
    ].filter(Boolean).join("\n")
  };
}

function fallbackGraderEvaluation(payload) {
  const draft = sanitizeBlock(payload.draft, "", 9000);
  const contentBrief = getContentBrief(payload);
  const words = draft ? draft.split(/\s+/).filter(Boolean).length : 0;
  const hasBrief = getBriefFilledCount(contentBrief) > 0;
  const hasConcreteAnchor = /\b\d+[%x]?\b|HYROX|Vande Bharat|Solow|client|customer|meeting|team|workflow|budget|legal|infosec/i.test(draft);
  const hasQuestion = draft.includes("?");
  const hasGenericPattern = /in today's fast-paced|game[- ]changer|unlock|leverage|transformative|revolutionize|delve|navigate the complexities/i.test(draft);
  const hasPointOfView = /not enough|not just|the real|the useful|the obvious|what if|because|but/i.test(draft);
  const hasSamples = sanitizeText(payload.personalStyle?.samples).split(/\s+/).filter(Boolean).length >= 80;
  let score = 5;

  if (words >= 130 && words <= 420) score += 1;
  if (words < 90) score -= 1;
  if (hasBrief) score += 1;
  if (hasConcreteAnchor) score += 1;
  if (hasQuestion) score += 0.5;
  if (hasPointOfView) score += 1;
  if (hasSamples) score += 0.5;
  if (hasGenericPattern) score -= 2;

  const normalized = normalizeGraderEvaluation({
    score,
    strengths: [
      hasPointOfView ? "The draft contains a visible point of view or tension." : "The draft has a recognizable topic and structure.",
      hasConcreteAnchor ? "It uses at least one concrete anchor or operating detail." : "It can be improved with a more specific anchor.",
      hasBrief ? "It has some connection to the supplied content brief." : "It is ready for a more explicit content brief."
    ],
    weaknesses: [
      hasGenericPattern ? "Some language still reads like generic AI thought leadership." : "The grader should still push for sharper originality before publishing.",
      hasConcreteAnchor ? "The concrete anchor can be made more consequential." : "It needs a named anecdote, example, data point, or lived observation.",
      hasSamples ? "Style-sample fit should be checked against actual rhythm and argument shape." : "Add more tone samples to make the style evaluation more reliable."
    ],
    reasoning: "This local grader uses deterministic quality signals because Claude grading is unavailable. Treat it as directional; the Claude grader is stricter and more sample-aware."
  });

  return {
    ...normalized,
    provider: "local",
    model: "local-grader"
  };
}

async function evaluateDraftWithGrader(payload, critiqueText = "") {
  const apiKey = getAnthropicApiKey();
  if (!apiKey.value) {
    return {
      evaluation: fallbackGraderEvaluation(payload),
      provider: "local",
      model: "local-grader",
      usage: calculateUsageCost(),
      warning: "Claude grader is not configured. This is a local directional evaluation."
    };
  }

  const prompt = buildDraftGraderPrompt(payload, critiqueText);
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
      temperature: 0,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Claude grader request failed: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const evaluation = normalizeGraderEvaluation(extractJsonObject(getClaudeText(data)));

  return {
    evaluation: {
      ...evaluation,
      provider: "claude",
      model: data.model || CLAUDE_MODEL
    },
    provider: "claude",
    model: data.model || CLAUDE_MODEL,
    usage: calculateUsageCost(data.usage)
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
  const contentBrief = getContentBrief(payload);
  const hasBrief = getBriefFilledCount(contentBrief) > 0;

  return [
    "EDITORIAL DIAGNOSIS",
    "- Core problem: The draft is structurally serviceable, but it needs a sharper author-owned tension and a more concrete proof point.",
    "- Generic or weak lines: Cut any line that says the topic is important without showing the specific operating consequence.",
    "- Voice mismatch: Push closer to the sample pattern: concrete trigger, named tension, system-level implication, crisp thesis line.",
    `- Missing specificity: ${hasBrief ? "Use the structured brief as the spine and make one brief detail visible in the body." : hasIdea ? "Turn the user idea into an example, tradeoff, or lived observation instead of leaving it as a theme." : "Add a concrete user idea, lived trigger, or professional observation before rewriting."}`,
    "- Argument gap: Explain why the obvious interpretation is incomplete, then name the hidden bottleneck underneath it.",
    `- LinkedIn risk: ${words < 120 ? "Too thin to feel earned." : "Likely skippable if it stays abstract."}`,
    "",
    "REWRITE STRATEGY",
    "- New hook direction: Open with the strongest contradiction, not a summary.",
    "- Concrete anchor to add: One specific example, analogy, operational detail, or moment of friction.",
    "- Thesis line to sharpen: Make the central claim short enough to be remembered.",
    `- Ending move: ${hasQuestion ? "Make the closing question more debatable and less obvious." : "End with a soft question that invites a real point of view."}`,
    "",
    "QUALITY VERDICT",
    "- Publishable: Almost",
    "- Overall score: 6/10"
  ].join("\n");
}

function fallbackRewrite(payload) {
  const profileLabel = sanitizeText(payload.profile?.label, "professional");
  const idea = sanitizeText(payload.userIdea, payload.topic?.title || "this shift");
  const contentBrief = getContentBrief(payload);
  const voice = payload.voice || {};
  const audience = sanitizeText(voice.audience, "domain peers and business leaders");
  const pointOfView = sanitizeText(
    voice.pointOfView,
    "distinctive expertise compounds when professionals turn domain judgment into clear decisions and useful stories"
  );
  const thesis = contentBrief.thesis || idea;
  const anchor = contentBrief.anecdote || contentBrief.evidence || "a team improves one visible part of the workflow while the real constraint remains somewhere else";
  const challengedBelief = contentBrief.commonBelief || "new capability automatically creates better outcomes";

  return [
    `The obvious story is ${thesis}.`,
    "",
    "The useful story sits one layer lower.",
    "",
    `Most teams look at change through the lens of capability: ${challengedBelief}.`,
    "",
    "But capability is rarely the real bottleneck.",
    "",
    `The harder question is what the surrounding system does with it. Consider ${anchor}.`,
    "",
    "The useful lesson is not that the tool is weak. It is that the decision loop around the tool is often unprepared: incentives, handoffs, governance, trust, and the human judgment that still sits between the tool and the outcome.",
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
  const stage = sanitizeText(promptPayload.stage, "critique");
  const apiKey = getAnthropicApiKey();
  if (!apiKey.value) {
    const text = fallbackWorkflowText(promptPayload);
    const evaluation = stage === "critique" ? fallbackGraderEvaluation({ ...promptPayload, draft: promptPayload.draft }) : null;
    return {
      text,
      evaluation,
      provider: "local",
      model: "local-brand-engine",
      usage: calculateUsageCost(),
      warning: "Claude is not configured. This is a local fallback and may be less personal."
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
      max_tokens: 1400,
      temperature: stage === "critique" ? 0.42 : 0.68,
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

  const workflowUsage = calculateUsageCost(data.usage);
  let evaluation = null;
  let usage = workflowUsage;

  if (stage === "critique") {
    try {
      const graderResult = await evaluateDraftWithGrader(promptPayload, text);
      evaluation = graderResult.evaluation;
      usage = combineUsageCost(workflowUsage, graderResult.usage);
    } catch (error) {
      evaluation = {
        ...fallbackGraderEvaluation(promptPayload),
        warning: error.message
      };
    }
  }

  return {
    text,
    evaluation,
    provider: "claude",
    model: data.model || CLAUDE_MODEL,
    usage
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
      usage: calculateUsageCost(),
      warning: "Claude is not configured. This is a local fallback and may be less personal."
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
      max_tokens: 1100,
      temperature: 0.72,
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
          warning: "Claude generation failed, so this draft used the local fallback. Treat it as a rough placeholder; it may be more generic and less faithful to tone samples.",
          fallbackReason: error.message
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
            graderScore: result.evaluation?.score || 0,
            ...result.usage
          }
        }, req);
        sendJson(res, 200, result);
      } catch (error) {
        const fallbackText = fallbackWorkflowText(payload);
        const fallback = {
          text: fallbackText,
          evaluation: sanitizeText(payload.stage, "critique") === "critique"
            ? fallbackGraderEvaluation({ ...payload, draft: payload.draft })
            : null,
          provider: "local",
          model: "local-brand-engine",
          usage: calculateUsageCost(),
          warning: "Claude workflow failed, so this step used the local fallback. Treat it as a rough placeholder; it may be more generic and less editorially sharp.",
          fallbackReason: error.message
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
            graderScore: fallback.evaluation?.score || 0,
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
