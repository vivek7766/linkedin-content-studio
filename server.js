require("dotenv").config({ quiet: true });
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = path.join(__dirname, "public");
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const ANTHROPIC_API_KEY_NAMES = ["ANTHROPIC_API_KEY", "ANTHROPIC_KEY", "CLAUDE_API_KEY"];

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload));
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

function getRelevantEnvNames() {
  return Object.keys(process.env)
    .filter((name) => /anthropic|claude|railway|port|node_env/i.test(name))
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

function getStyleModeGuidance(styleMode) {
  const guidance = {
    Balanced:
      "Blend Brand Voice and Personal Style evenly. Keep positioning clear while preserving the author's sample-driven rhythm.",
    "Brand-led":
      "Prioritize Brand Voice: audience, point of view, credibility, and strategic positioning. Use Personal Style lightly for cadence and structure.",
    "Style-led":
      "Prioritize Personal Style: sample rhythm, openings, tension-building, analogies, and punchy thesis lines. Keep Brand Voice as a factual constraint."
  };
  return guidance[styleMode] || guidance.Balanced;
}

function getViralityGuidance(viralityMode, currentTrigger) {
  const guidance = {
    "Insight-led":
      "Optimize for durable insight, credibility, and usefulness rather than provocation.",
    "Current affairs":
      "Anchor the post in the supplied current trigger or selected Current Affairs topic. Do not invent news. Challenge the obvious headline and extract the underlying product, AI, leadership, or operating lesson.",
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

function buildPrompt(payload) {
  const topic = sanitizeText(payload.topic?.title, "AI at work");
  const pillar = sanitizeText(payload.topic?.pillar, "AI at Work");
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
    "Use a reflective, strategic, senior product leader voice with concrete analogies and original insight."
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
      "You write sharp, credible LinkedIn posts for a product leader building a Product x AI personal brand.",
      "The author context: PM background, AI strategy and execution, enterprise transformation, consumer AI lens, practical leadership.",
      "Make the writing specific, grounded, and useful. Avoid generic AI hype, fake certainty, and salesy language.",
      "Use sample posts only to infer style, rhythm, structure, and level of depth. Do not copy distinctive sentences, examples, or wording from the samples.",
      "Return only the post text. Do not add labels, commentary, markdown headings, or hashtags unless the user explicitly asks for them."
    ].join(" "),
    user: [
      `Topic: ${topic}`,
      `Pillar: ${pillar}`,
      `Angle: ${angle}`,
      `User idea: ${userIdea || "No additional user idea supplied."}`,
      `Audience: ${sanitizeText(voice.audience, "product, design, engineering, strategy, and AI leaders")}`,
      `Tone: ${sanitizeText(voice.tone, "authoritative but conversational, grounded in real experience")}`,
      `Point of view: ${sanitizeText(voice.pointOfView, "AI creates advantage when product teams redesign decisions and workflows, not when they sprinkle tools on old processes")}`,
      `Credibility signals: ${sanitizeText(voice.credentials, "PM lens, enterprise and consumer product judgment, applied AI operating experience")}`,
      `Avoid: ${sanitizeText(voice.avoid, "jargon, breathless hype, em dashes, generic thought leadership")}`,
      `Style Mode: ${styleMode}`,
      `Style Mode guidance: ${getStyleModeGuidance(styleMode)}`,
      `Virality Lens: ${viralityMode}`,
      `Virality guidance: ${getViralityGuidance(viralityMode, currentTrigger)}`,
      "",
      "Personal writing instructions:",
      styleInstructions,
      "",
      "Reference sample posts for tone calibration:",
      styleSamples,
      "",
      "Style calibration notes:",
      "- Preserve the author's strategic, reflective, system-level reasoning.",
      "- Prefer concrete analogies, named tensions, India/global context when relevant, and crisp thesis lines.",
      "- For viral/current affairs posts, use a timely trigger to reveal a deeper system truth, not as shallow trend-chasing.",
      "- Let paragraphs breathe with LinkedIn-friendly line breaks.",
      "- Create a new original post. Do not reuse the sample analogies unless the selected topic directly calls for them.",
      "",
      "Recent topics to avoid repeating:",
      recentPosts,
      "",
      "Write one publish-ready LinkedIn post with:",
      "- A scroll-stopping opening hook.",
      "- If a user idea is supplied, make it the core input rather than treating it as a side note.",
      "- A structured body: insight, concrete example, implication.",
      "- A closing question that invites thoughtful replies.",
      "- 130-220 words.",
      "- Natural line breaks for LinkedIn readability."
    ].join("\n")
  };
}

function fallbackPost(payload) {
  const topic = payload.topic || {};
  const title = sanitizeText(topic.title, "How AI changes product work");
  const topicPhrase = title ? title.charAt(0).toLowerCase() + title.slice(1) : title;
  const pillar = sanitizeText(topic.pillar, "AI at Work");
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
  const audience = sanitizeText(voice.audience, "product and AI leaders");
  const pointOfView = sanitizeText(
    voice.pointOfView,
    "AI creates advantage when teams redesign decisions and workflows, not when they simply add another tool"
  );

  const hooks = {
    Teach: [
      `Most teams are asking the wrong first question about ${topicPhrase}.`,
      `${title}: the useful conversation is one layer deeper than tools.`,
      hasStyleSamples
        ? `The visible story is ${topicPhrase}. The real story is the system around it.`
        : `The useful lesson in ${topicPhrase} is less about tools and more about operating design.`,
      `A simple test for ${pillar.toLowerCase()}: does it change the decision, or just decorate the workflow?`
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
      `A pattern I keep seeing in product work: ${topicPhrase} only becomes real when the team changes its habits.`,
      `The first time ${topicPhrase} clicked for me, it was not because the model got better.`,
      `One lesson I have learned from building around AI: the product decision matters more than the demo.`
    ],
    "Hot take": [
      `Hot take: ${topicPhrase} will reward disciplined operators more than flashy experimenters.`,
      `The biggest unlock in ${topicPhrase} is not speed. It is judgment at scale.`,
      `I suspect the winners in ${pillar.toLowerCase()} will look less like AI labs and more like disciplined product teams.`
    ]
  };

  if (viralityMode === "Current affairs") {
    hooks[angle] = [
      currentTrigger
        ? `The headline is about ${triggerPhrase}. The real story is what it reveals underneath.`
        : "The easiest take on this week's AI narrative is probably the least useful one.",
      "A current headline is useful only if it helps us see the system behind the noise.",
      "The news cycle moves fast. Operating reality moves slower. That gap is where the lesson sits."
    ];
  }

  if (viralityMode === "Contrarian commentary") {
    hooks[angle] = [
      `The popular take on ${topicPhrase} is too neat.`,
      `I think the obvious lesson from ${topicPhrase} is the wrong one.`,
      "We may be overestimating the technology shift and underestimating the operating shift."
    ];
  }

  if (viralityMode === "Anecdote-led") {
    hooks[angle] = [
      `A small moment changed how I think about ${topicPhrase}.`,
      "This sounds like a technology story. It is really a human behavior story.",
      "I keep coming back to one pattern: people do not adopt systems. They adopt relief from friction."
    ];
  }

  if (viralityMode === "Debate spark") {
    hooks[angle] = [
      `What if the way we talk about ${topicPhrase} is making teams less prepared?`,
      "There are two kinds of leaders in the AI shift. Only one is building for what comes next.",
      "A question worth debating: are we automating work, or just moving the bottleneck somewhere else?"
    ];
  }

  const angleHooks = hooks[angle] || hooks.Teach;
  const hook = angleHooks[Math.floor(Math.random() * angleHooks.length)];

  const middleByAngle = {
    Teach:
      "A strong AI workflow has three parts: a clear human decision, a model-assisted input, and a feedback loop that makes the next decision better. If any one of those is missing, the team usually gets a polished shortcut instead of a real capability.",
    Challenge:
      "The trap is treating AI as a layer you add after the product strategy is set. The better move is to ask where judgment, context, and repetition already live in the customer or employee journey, then redesign that moment around a better decision.",
    "Personal story":
      "In practice, the useful breakthroughs tend to be quiet. A support team routes issues with better context. A PM sees risk earlier. A customer gets a next step that feels obvious instead of automated. None of this looks dramatic in a demo, but it compounds.",
    "Hot take":
      "The teams that win will not be the ones with the longest list of pilots. They will be the ones who can turn one high-value workflow into a repeatable operating advantage, then keep improving it with real usage data."
  };

  const styleModeLine = {
    Balanced: `For ${audience}, the implication is pretty direct: ${pointOfView}.`,
    "Brand-led": `For ${audience}, the strategic implication is direct: ${pointOfView}.`,
    "Style-led": `But here is the part I keep returning to: ${pointOfView}.`
  };

  const viralityBridge = {
    "Insight-led": hasStyleSamples
      ? "It is not enough to make one part of the machine faster. The surrounding constraints, incentives, handoffs, and judgment loops have to change with it."
      : "That changes the product brief. Instead of asking \"where can we use AI?\", the sharper question is: \"which decision would become meaningfully better if the system had more context, memory, and iteration?\"",
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
      : "Where are you seeing AI actually change the way work gets done, not just the interface around it?"
  ].join("\n");
}

function buildWorkflowPrompt(payload) {
  const stage = sanitizeText(payload.stage, "critique");
  const topic = sanitizeText(payload.topic?.title, "AI at work");
  const pillar = sanitizeText(payload.topic?.pillar, "AI at Work");
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
    "Use a reflective, strategic, senior product leader voice with concrete analogies and original insight."
  );
  const styleSamples = sanitizeBlock(personalStyle.samples, "No sample posts provided.", 12000);

  const stageInstructions = {
    critique: [
      "Critique the draft as a senior LinkedIn editor.",
      "Return concise, actionable notes only.",
      "Cover hook, clarity, originality, structure, brand fit, style fit, and one rewrite direction.",
      "Do not rewrite the full post in this step."
    ].join(" "),
    rewrite: [
      "Rewrite the draft using the critique.",
      "Preserve the author's point of view and personal style, but make the argument sharper and more original.",
      "Return only the rewritten LinkedIn post, with natural line breaks."
    ].join(" "),
    polish: [
      "Final polish the rewritten post for publishing.",
      "Tighten the hook, remove filler, improve rhythm, keep the author's voice, and make the closing question sharper.",
      "Return only the final LinkedIn post."
    ].join(" ")
  };

  return {
    system: [
      "You are an expert LinkedIn editor for a Product x AI personal brand.",
      "Use sample posts only to infer style, rhythm, structure, and level of depth. Do not copy distinctive sentences, examples, or wording from the samples.",
      "Keep the author's voice original, strategic, grounded, and senior."
    ].join(" "),
    user: [
      `Workflow stage: ${stage}`,
      `Stage instruction: ${stageInstructions[stage] || stageInstructions.critique}`,
      `Topic: ${topic}`,
      `Pillar: ${pillar}`,
      `Angle: ${angle}`,
      `User idea: ${userIdea || "No additional user idea supplied."}`,
      `Style Mode: ${styleMode}`,
      `Virality Lens: ${viralityMode}`,
      `Current trigger: ${currentTrigger || "None supplied."}`,
      `Audience: ${sanitizeText(voice.audience, "product, design, engineering, strategy, and AI leaders")}`,
      `Tone: ${sanitizeText(voice.tone, "authoritative but conversational, grounded in real experience")}`,
      `Point of view: ${sanitizeText(voice.pointOfView, "AI creates advantage when product teams redesign decisions and workflows, not when they sprinkle tools on old processes")}`,
      `Credibility signals: ${sanitizeText(voice.credentials, "PM lens, enterprise and consumer product judgment, applied AI operating experience")}`,
      `Avoid: ${sanitizeText(voice.avoid, "jargon, breathless hype, em dashes, generic thought leadership")}`,
      "",
      "Personal writing instructions:",
      styleInstructions,
      "",
      "Reference sample posts for tone calibration:",
      styleSamples,
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
    "Hook: Make the first line sharper and more specific. It should create tension before it explains.",
    `Core idea: ${hasIdea ? "The draft has a user idea to build from; make the implication more explicit." : "Add a concrete user idea or lived trigger to make the post more ownable."}`,
    "Structure: Move from observation to tension to implication. Remove repetition.",
    "Originality: Name the hidden bottleneck, trade-off, or human behavior underneath the topic.",
    `Engagement: ${hasQuestion ? "The closing question is present; make it more debatable." : "Add a closing question that invites a point of view."}`,
    `Length: ${words} words. Aim for 130-220 words unless the story needs more room.`,
    "Rewrite direction: Lead with the strongest tension, add one concrete example or analogy, then land the product/leadership implication."
  ].join("\n");
}

function fallbackRewrite(payload) {
  const idea = sanitizeText(payload.userIdea, payload.topic?.title || "this AI shift");
  const voice = payload.voice || {};
  const audience = sanitizeText(voice.audience, "product and AI leaders");
  const pointOfView = sanitizeText(
    voice.pointOfView,
    "AI creates advantage when teams redesign decisions and workflows, not when they simply add another tool"
  );

  return [
    `The visible story is ${idea}.`,
    "",
    "The deeper story is usually less convenient.",
    "",
    "Most teams look at AI through the lens of capability: what can the model do, how fast can it do it, and where can we plug it into the workflow?",
    "",
    "But capability is rarely the real bottleneck.",
    "",
    "The harder question is whether the surrounding system is ready for the change: incentives, handoffs, governance, trust, and the human judgment that still has to sit between the model and the outcome.",
    "",
    `For ${audience}, the implication is direct: ${pointOfView}.`,
    "",
    "Do not just ask what AI can automate. Ask what decision, behavior, or operating rhythm needs to be redesigned because AI is now part of the system.",
    "",
    "Where do you think teams are still confusing AI capability with AI readiness?"
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
  const apiKey = getAnthropicApiKey();
  if (!apiKey.value) {
    return {
      text: fallbackWorkflowText(payload),
      provider: "local",
      model: "local-brand-engine"
    };
  }

  const prompt = buildWorkflowPrompt(payload);
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
    model: data.model || CLAUDE_MODEL
  };
}

async function generatePost(payload) {
  const apiKey = getAnthropicApiKey();
  if (!apiKey.value) {
    return {
      post: fallbackPost(payload),
      provider: "local",
      model: "local-brand-engine"
    };
  }

  const prompt = buildPrompt(payload);
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
    model: data.model || CLAUDE_MODEL
  };
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = decodeURIComponent(url.pathname);
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(ROOT, relativePath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "content-type": MIME_TYPES[ext] || "application/octet-stream",
      "cache-control": "no-store"
    });
    res.end(contents);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/health") {
    sendJson(res, 200, getConfigStatus());
    return;
  }

  if (req.method === "POST" && req.url === "/api/generate") {
    try {
      const payload = JSON.parse(await readBody(req));
      try {
        sendJson(res, 200, await generatePost(payload));
      } catch (error) {
        sendJson(res, 200, {
          post: fallbackPost(payload),
          provider: "local",
          model: "local-brand-engine",
          warning: error.message
        });
      }
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/api/workflow") {
    try {
      const payload = JSON.parse(await readBody(req));
      try {
        sendJson(res, 200, await runWorkflowStage(payload));
      } catch (error) {
        sendJson(res, 200, {
          text: fallbackWorkflowText(payload),
          provider: "local",
          model: "local-brand-engine",
          warning: error.message
        });
      }
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { "allow": "GET, HEAD, POST" });
  res.end("Method not allowed");
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
