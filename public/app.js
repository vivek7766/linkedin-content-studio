const TOPICS = [
  {
    id: "ai-workflow-theater",
    pillar: "AI at Work",
    title: "AI workflow theater vs real operating leverage",
    prompt: "Draw a line between demos that impress and workflows that change daily decisions."
  },
  {
    id: "manager-copilot",
    pillar: "AI at Work",
    title: "The manager copilot is really a decision system",
    prompt: "Explore how AI helps managers notice patterns, tradeoffs, and follow-through."
  },
  {
    id: "product-requirements-ai",
    pillar: "Product Thinking",
    title: "The AI-era PRD starts with judgment, not features",
    prompt: "Reframe product requirements around decisions, context, uncertainty, and feedback."
  },
  {
    id: "shipping-ai-features",
    pillar: "Product Thinking",
    title: "Shipping AI features without making the product feel less trustworthy",
    prompt: "Talk about confidence, graceful failure, user control, and expectation setting."
  },
  {
    id: "enterprise-ai-pilots",
    pillar: "Enterprise Transformation",
    title: "Why enterprise AI pilots stall after the first impressive demo",
    prompt: "Connect adoption to incentives, process ownership, change management, and measurement."
  },
  {
    id: "procurement-ai",
    pillar: "Enterprise Transformation",
    title: "Procurement may shape enterprise AI more than model quality",
    prompt: "Show how legal, security, data access, and vendor risk decide what reaches production."
  },
  {
    id: "consumer-ai-memory",
    pillar: "Consumer AI",
    title: "Consumer AI gets interesting when it remembers taste, not just tasks",
    prompt: "Explain why personalization, taste, and context change the product experience."
  },
  {
    id: "ai-native-consumer-products",
    pillar: "Consumer AI",
    title: "AI-native consumer products need rituals, not just chat boxes",
    prompt: "Explore habit loops, moments of delight, and repeat usage beyond novelty."
  },
  {
    id: "leadership-ai-ambiguity",
    pillar: "Leadership in the Age of AI",
    title: "AI leadership is becoming ambiguity management",
    prompt: "Write about making calls when capability, risk, and expectations keep shifting."
  },
  {
    id: "exec-ai-literacy",
    pillar: "Leadership in the Age of AI",
    title: "The new executive literacy: knowing what not to automate",
    prompt: "Make the case for restraint, accountability, and protecting high-trust moments."
  },
  {
    id: "metrics-for-ai-products",
    pillar: "Product Thinking",
    title: "The AI product metric that matters before retention",
    prompt: "Focus on whether the product earns user trust through useful, repeated outcomes."
  },
  {
    id: "enterprise-consumer-gap",
    pillar: "Enterprise Transformation",
    title: "Enterprise AI can learn from consumer AI's obsession with friction",
    prompt: "Compare enterprise workflow depth with consumer-grade usability expectations."
  },
  {
    id: "current-affair-product-lesson",
    pillar: "Current Affairs",
    title: "Turn a current headline into a product lesson",
    prompt: "Use a live market or culture trigger, then extract the product and AI implication."
  },
  {
    id: "ai-news-cycle-operating-reality",
    pillar: "Current Affairs",
    title: "The AI news cycle vs operating reality",
    prompt: "Challenge the obvious headline and connect it to adoption, incentives, or execution."
  },
  {
    id: "contrarian-read-on-ai-narrative",
    pillar: "Current Affairs",
    title: "A contrarian read on this week's AI narrative",
    prompt: "Start from a current debate, then offer a grounded, original counterpoint."
  }
];

const DEFAULT_VOICE = {
  tone: "Authoritative but conversational, grounded in real experience",
  audience: "Product, design, engineering, strategy, and AI leaders",
  pointOfView:
    "AI creates advantage when product teams redesign decisions and workflows, not when they sprinkle tools on old processes",
  credentials: "PM lens, applied AI strategy, enterprise transformation, consumer product judgment",
  avoid: "Jargon, breathless hype, generic thought leadership, em dashes"
};

const HYROX_STYLE_SAMPLE =
  "5. Stop waiting for the \"perfect window\" to do something hard. It doesn't exist.\n\nMost people treat high-performance like a lab experiment: they want the perfect diet, the perfect 12-week training block, and a \"green\" recovery score before they dare to step on the starting line.\n\nI almost fell into that trap.\n\nI had every excuse to stay on the sidelines:\n- Constant travel\n- Non-existent recovery\n- Nutrition that was \"suboptimal\" at best\n\nHuge shoutout to my younger brother Prashant Singh for calling my bluff. He pushed me to stop over-analyzing and just sign up. He knew what I had forgotten: Conditions don't dictate your start date. Your discipline does.\n\nReality hit hard at my first HYROX.\nMy \"system\" broke.\nCramps hit - twice.\nEnergy cratered when the weights got heavy.\n\nBut here's the contrarian truth about leadership and elite fitness:\nPreparation is a luxury. Execution is a choice.\n\nIn Product and Leadership, we talk constantly about \"scaling systems.\" But the most important system you'll ever manage is the one between your ears.\n\nWhen the prep fails - and it will - grit is the only thing that scales.\n\nHYROX isn't a fitness race. It's a physical audit of your ability to stay calm when your plan goes out the window.\n\nYour body will always try to negotiate a way out. Your mind is the only one with the power to close the deal.\n\nI didn't finish with a peak performance PR. I finished because I refused to exit when it got uncomfortable.\n\nFirst HYROX: Humbled, exhausted, and already planning the next one.";

const FULL_STACK_STYLE_SAMPLE =
  "6. Are you still looking for a full stack developer?\n\nFair question.\n\nBut what's your stack today?\n\nIs it just frontend and backend?\nOr does it include data, pipelines, cloud, observability...\nand now AI sitting on top of everything?\n\nBecause the role has quietly changed.\n\nA developer today isn't just moving across layers -\nthey're expected to understand how decisions flow through them.\n\nFrom UI to API\nFrom API to data\nFrom data to models\nFrom models to outcomes\n\nIt's no longer a stack.\n\nIt's a stack of stacks.\n\nSo when we say \"full stack\"...\n\nDo we mean someone who knows a few technologies across layers?\n\nOr someone who can see the system end-to-end,\nmake trade-offs, and decide what actually needs to be built?\n\nBecause those are very different people.\n\nAnd only one of them is built for what's coming next.";

const DEFAULT_PERSONAL_STYLE = {
  instructions:
    "Use my natural pattern: open with a concrete analogy, a sharp claim, a deceptively simple question, or a reflective observation; bridge from culture, economics, product, lived experience, or human behavior into AI; name the core tension; move from individual productivity to system-level consequences; reframe familiar categories into system-level insight; combine strategic clarity with a philosophical/human layer; use occasional short thesis lines; end with a question that invites real disagreement. Sound original, grounded, and senior. Avoid generic AI cheerleading, forced hashtags, recycled phrases, and copying sample wording verbatim.",
  samples: [
    "1. Vande Bharat was built to accelerate to 100 kmph in about 52 seconds and is designed to operate at speeds up to 160 kmph. Yet, across India, its actual average speed is barely half of this potential because it is running on legacy tracks with speed restrictions, older signalling and control systems that were never designed for sustained high-speed operations. Leaders across organizations face a similar dilemma - let's call it the hashtag#AIParadox. Individuals have become more productive by using Copilots and personal AI bots. Yet, enterprise ROI remains elusive. The problems are structural and cultural. Certain individuals becoming more productive increases stress in other parts of the downstream system, creating a process debt. Let's say Marketing gets productive by using a customized AI solution. But, the enterprise reality could be that legal, budget and infosec approvals continue to be bottlenecks as they run on legacy systems and processes. If the company is structured in rigid silos, it will implement AI in a siloed way. Since departments don't talk, point solutions don't deliver meaningful ROI. In 1987, Nobel Prize winning economist Robert Solow famously remarked, \"You can see the computer age everywhere but in the productivity statistics.\" This paradox suggests that simply adding technology to existing processes doesn't create immediate growth. It often takes a gestation period where managers learn to reorganize work entirely around the new tech, rather than just using it to do old tasks faster. It's not enough to swap the tech, the factory needs to be redesigned. Leaders have to rearchitect the end-to-end processes. Gen AI powered agents can be introduced in a systematic manner, starting with automating smaller and simpler workflows and then expanding it to the entire workflow, cutting across functions. Companies which have a head start will be closer to achieving expected ROIs, while those who waited at the fence will have to first navigate the cultural and structural challenges. This gives the leaders a 12-18 months moat, which is powerful in today's market.",
    "2. There's an argument often heard in AI circles: that with rapid advances, we are entering a post-scarcity world. The knowledge of the best doctors now available to rural patients or developing nations; drug discovery timelines collapsing through AI-driven modelling; cost of healthcare falling as intelligence gets distributed. We have to be careful with this argument. AI technologies have network effects that concentrate value rather than diffuse it. AI democratizes intelligence, not prosperity. A few countries will capture disproportionate gains. Within them, a few firms, and a few individuals will capture even more. Abundance, therefore, may be good in theory but localized in practice. This shifts the burden to policymakers. It's a delicate balance. Free-market advocates push for natural evolution, even if it widens the income divide. For a nation like India, a middle path is more viable - blending innovation with guardrails to ensure the gains of AI diffusion are more evenly spread. What do you think: Will AI democratize prosperity, or entrench the wealthy and powerful elites?",
    "3. The barrier to entry just collapsed. Most people haven't noticed yet.\n\nFor most of history, execution required permission - from institutions, from experts, from people who gatekept technical knowledge. You needed a developer to build. A designer to make it look real. An analyst to make sense of the data.\n\nThat's not entirely gone. But the gap has narrowed in ways that should unsettle how we think about competitive advantage. Here's what's actually new:\n\nSimulation used to be expensive. You needed a team, a budget, and months to find out if an idea had legs.\n\nNow you can stress-test a business model before breakfast. Map out failure points before you've spent a dollar. Run a dozen versions of your idea in an afternoon and arrive at the best one by evening.\n\nThe distance between \"what if this worked?\" and \"here's proof it can\" has never been shorter.\n\nThat changes everything about who gets to play. The person with deep domain knowledge - but zero technical background - can now prototype, pressure-test, and ship ideas that would've died on a napkin three years ago.\n\nBut here's what I keep returning to:\n\nThe tools compress simulation. They don't compress judgment.\n\nThey can stress-test your idea. They can't tell you which ideas are worth testing, or why your gut feeling about a market is right when the numbers say otherwise.\n\nThe discipline to sit with a hard problem until the real question reveals itself - those aren't being automated.\n\nThe floor just got higher. The ceiling is still yours to build.",
    "4. Lately, I've been thinking about how a single word can awaken entire worlds inside us. Take the word \"Patience.\" For one person, it may feel like a soft rhythm of rain on a window - calm, steady, forgiving. For someone else, it might feel like the ache of waiting for something uncertain. For another, it could be quiet strength - the heartbeat that keeps them going through chaos. This is more than language. It's 'qualia' - the private, subjective texture of experience. No two minds ever truly feel a word the same way. Just as no two people see the color \"red\" in exactly the same shade. Your \"experience\" of a red might be completely different from mine. And yet, out of this difference, something extraordinary happens: Teams form. Companies are built. Decisions are made. Because we don't just exchange words - we exchange perspectives. We sense moods in a room, unspoken hesitations in a meeting, subtle sparks of alignment when a vision lands. This is what many miss in the growing chorus saying, \"AI can replace managers.\" Lately, we've seen companies lean harder on tech - shrinking the number of managers, assuming data and algorithms can replace empathy and context. But that's a dangerous illusion. AI can read roadmaps. AI can optimize backlogs. AI can even write vision statements. But what it cannot do is feel the silent tension in a cross-functional debate. It cannot yet sense when a team is inspired by an idea or when doubt lingers. It cannot yet hold the weight of human ambiguity - and still move forward with intuition. Because strategy isn't built only on logic. It's built on shared human experiences. AI may be brilliant at processing words. But it lives outside the private skies we carry within us. And that private sky inside each of us - is where the real work, the human work, happens.",
    HYROX_STYLE_SAMPLE,
    FULL_STACK_STYLE_SAMPLE
  ].join("\n\n")
};

const DEFAULT_GENERATION_SETTINGS = {
  styleMode: "Balanced",
  viralityMode: "Insight-led",
  currentAffair: ""
};

const DEFAULT_WORKFLOW = {
  userIdea: "",
  activeStage: "idea"
};

const state = {
  selectedTopicId: TOPICS[0].id,
  selectedAngle: "Teach",
  voice: loadJson("linkedinStudioVoice", DEFAULT_VOICE),
  personalStyle: ensurePersonalStyleSamples(loadJson("linkedinStudioPersonalStyle", DEFAULT_PERSONAL_STYLE)),
  generationSettings: ensureGenerationSettings(loadJson("linkedinStudioGenerationSettings", DEFAULT_GENERATION_SETTINGS)),
  workflow: loadJson("linkedinStudioWorkflow", DEFAULT_WORKFLOW),
  history: loadJson("linkedinStudioHistory", [])
};
saveJson("linkedinStudioPersonalStyle", state.personalStyle);

const elements = {
  weekLabel: document.querySelector("#weekLabel"),
  topicGrid: document.querySelector("#topicGrid"),
  pillarFilter: document.querySelector("#pillarFilter"),
  surpriseButton: document.querySelector("#surpriseButton"),
  selectedTopicTitle: document.querySelector("#selectedTopicTitle"),
  selectedTopicMeta: document.querySelector("#selectedTopicMeta"),
  draftOutput: document.querySelector("#draftOutput"),
  wordCount: document.querySelector("#wordCount"),
  charCount: document.querySelector("#charCount"),
  generateButton: document.querySelector("#generateButton"),
  copyButton: document.querySelector("#copyButton"),
  saveButton: document.querySelector("#saveButton"),
  providerBadge: document.querySelector("#providerBadge"),
  historyList: document.querySelector("#historyList"),
  historyCount: document.querySelector("#historyCount"),
  postedThisMonth: document.querySelector("#postedThisMonth"),
  topicCoverage: document.querySelector("#topicCoverage"),
  toast: document.querySelector("#toast"),
  resetVoiceButton: document.querySelector("#resetVoiceButton"),
  resetStyleButton: document.querySelector("#resetStyleButton"),
  voiceTone: document.querySelector("#voiceTone"),
  voiceAudience: document.querySelector("#voiceAudience"),
  voicePointOfView: document.querySelector("#voicePointOfView"),
  voiceCredentials: document.querySelector("#voiceCredentials"),
  voiceAvoid: document.querySelector("#voiceAvoid"),
  styleInstructions: document.querySelector("#styleInstructions"),
  styleSamples: document.querySelector("#styleSamples"),
  sampleCount: document.querySelector("#sampleCount"),
  sampleWordCount: document.querySelector("#sampleWordCount"),
  viralityMode: document.querySelector("#viralityMode"),
  currentAffair: document.querySelector("#currentAffair"),
  userIdea: document.querySelector("#userIdea"),
  critiqueButton: document.querySelector("#critiqueButton"),
  rewriteButton: document.querySelector("#rewriteButton"),
  polishButton: document.querySelector("#polishButton"),
  critiqueOutput: document.querySelector("#critiqueOutput"),
  rewriteOutput: document.querySelector("#rewriteOutput"),
  finalOutput: document.querySelector("#finalOutput")
};

function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensurePersonalStyleSamples(personalStyle) {
  const style = {
    ...DEFAULT_PERSONAL_STYLE,
    ...personalStyle
  };

  if (!style.samples.includes("First HYROX: Humbled")) {
    style.samples = `${style.samples.trim()}\n\n${HYROX_STYLE_SAMPLE}`;
  }

  if (!style.samples.includes("stack of stacks")) {
    style.samples = `${style.samples.trim()}\n\n${FULL_STACK_STYLE_SAMPLE}`;
  }

  if (!style.instructions.includes("lived experience")) {
    style.instructions = style.instructions.includes("product, or human behavior")
      ? style.instructions.replace("product, or human behavior", "product, lived experience, or human behavior")
      : `${style.instructions} When useful, connect lived experience to product, leadership, and AI principles.`;
  }

  if (!style.instructions.includes("deceptively simple question")) {
    style.instructions = `${style.instructions} Use deceptively simple questions when the post is reframing a familiar role, category, or assumption.`;
  }

  return style;
}

function ensureGenerationSettings(settings) {
  return {
    ...DEFAULT_GENERATION_SETTINGS,
    ...settings
  };
}

function getSelectedTopic() {
  return TOPICS.find((topic) => topic.id === state.selectedTopicId) || TOPICS[0];
}

function isTopicUsed(topicId) {
  return state.history.some((item) => item.topicId === topicId);
}

function getWeekLabel() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor((now - firstDay) / 86400000);
  const week = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  return `Week ${week} - ${now.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function renderPillarFilter() {
  const pillars = [...new Set(TOPICS.map((topic) => topic.pillar))];
  elements.pillarFilter.innerHTML = [
    '<option value="All">All pillars</option>',
    ...pillars.map((pillar) => `<option value="${escapeHtml(pillar)}">${escapeHtml(pillar)}</option>`)
  ].join("");
}

function renderTopics() {
  const filter = elements.pillarFilter.value || "All";
  const topics = filter === "All" ? TOPICS : TOPICS.filter((topic) => topic.pillar === filter);

  elements.topicGrid.innerHTML = topics
    .map((topic) => {
      const active = topic.id === state.selectedTopicId ? " active" : "";
      const used = isTopicUsed(topic.id);
      return `
        <button class="topic-card${active}${used ? " used" : ""}" type="button" data-topic-id="${topic.id}">
          <span>
            <h3>${escapeHtml(topic.title)}</h3>
            <p>${escapeHtml(topic.prompt)}</p>
          </span>
          <span class="topic-footer">
            <span class="pillar-tag">${escapeHtml(topic.pillar)}</span>
            ${used ? '<span class="used-tag">Posted</span>' : ""}
          </span>
        </button>
      `;
    })
    .join("");
}

function renderComposer() {
  const topic = getSelectedTopic();
  elements.selectedTopicTitle.textContent = topic.title;
  elements.selectedTopicMeta.textContent = `${topic.pillar} - ${topic.prompt}`;

  document.querySelectorAll(".angle-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.angle === state.selectedAngle);
  });

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.styleMode === state.generationSettings.styleMode);
  });
}

function renderVoice() {
  elements.voiceTone.value = state.voice.tone;
  elements.voiceAudience.value = state.voice.audience;
  elements.voicePointOfView.value = state.voice.pointOfView;
  elements.voiceCredentials.value = state.voice.credentials;
  elements.voiceAvoid.value = state.voice.avoid;
}

function renderPersonalStyle() {
  elements.styleInstructions.value = state.personalStyle.instructions;
  elements.styleSamples.value = state.personalStyle.samples;
  renderSampleMetrics();
}

function renderGenerationSettings() {
  elements.viralityMode.value = state.generationSettings.viralityMode;
  elements.currentAffair.value = state.generationSettings.currentAffair;
}

function renderWorkflow() {
  elements.userIdea.value = state.workflow.userIdea || "";
  document.querySelectorAll(".workflow-step").forEach((step) => {
    step.classList.toggle("active", step.dataset.workflowStage === state.workflow.activeStage);
  });
  updateWorkflowControls();
}

function renderHistory() {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const pillars = new Set(state.history.map((item) => item.pillar));
  const monthCount = state.history.filter((item) => {
    const date = new Date(item.createdAt);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).length;

  elements.historyCount.textContent = String(state.history.length);
  elements.postedThisMonth.textContent = String(monthCount);
  elements.topicCoverage.textContent = String(pillars.size);

  if (!state.history.length) {
    elements.historyList.innerHTML = '<div class="empty-state">No saved posts yet.</div>';
    return;
  }

  elements.historyList.innerHTML = state.history
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((item) => {
      const date = new Date(item.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      return `
        <article class="history-item">
          <strong>${escapeHtml(item.topic)}</strong>
          <span>${escapeHtml(item.pillar)} - ${escapeHtml(item.angle)} - ${date}</span>
        </article>
      `;
    })
    .join("");
}

function renderMetrics() {
  const text = getPublishableDraft();
  const words = text ? text.split(/\s+/).length : 0;
  elements.wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
  elements.charCount.textContent = `${text.length} chars`;
}

function renderSampleMetrics() {
  const sampleText = elements.styleSamples.value.trim();
  const numberedSamples = sampleText.match(/^\s*\d+\./gm);
  const samples = numberedSamples ? numberedSamples.length : sampleText ? 1 : 0;
  const words = sampleText ? sampleText.split(/\s+/).length : 0;
  elements.sampleCount.textContent = `${samples} ${samples === 1 ? "sample" : "samples"}`;
  elements.sampleWordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
}

function renderAll() {
  elements.weekLabel.textContent = getWeekLabel();
  renderTopics();
  renderComposer();
  renderVoice();
  renderPersonalStyle();
  renderGenerationSettings();
  renderWorkflow();
  renderHistory();
  renderMetrics();
}

function syncVoiceFromInputs() {
  state.voice = {
    tone: elements.voiceTone.value.trim(),
    audience: elements.voiceAudience.value.trim(),
    pointOfView: elements.voicePointOfView.value.trim(),
    credentials: elements.voiceCredentials.value.trim(),
    avoid: elements.voiceAvoid.value.trim()
  };
  saveJson("linkedinStudioVoice", state.voice);
}

function syncPersonalStyleFromInputs() {
  state.personalStyle = {
    instructions: elements.styleInstructions.value.trim(),
    samples: elements.styleSamples.value.trim()
  };
  saveJson("linkedinStudioPersonalStyle", state.personalStyle);
  renderSampleMetrics();
}

function syncGenerationSettingsFromInputs() {
  state.generationSettings = {
    styleMode: state.generationSettings.styleMode || DEFAULT_GENERATION_SETTINGS.styleMode,
    viralityMode: elements.viralityMode.value,
    currentAffair: elements.currentAffair.value.trim()
  };
  saveJson("linkedinStudioGenerationSettings", state.generationSettings);
}

function syncWorkflowFromInputs() {
  state.workflow = {
    ...state.workflow,
    userIdea: elements.userIdea.value.trim()
  };
  saveJson("linkedinStudioWorkflow", state.workflow);
}

function setWorkflowStage(stage) {
  state.workflow = {
    ...state.workflow,
    activeStage: stage
  };
  saveJson("linkedinStudioWorkflow", state.workflow);
  renderWorkflow();
}

function getPublishableDraft() {
  return (
    elements.finalOutput.value.trim() ||
    elements.rewriteOutput.value.trim() ||
    elements.draftOutput.value.trim()
  );
}

function getWorkflowPayload() {
  const topic = getSelectedTopic();
  syncVoiceFromInputs();
  syncPersonalStyleFromInputs();
  syncGenerationSettingsFromInputs();
  syncWorkflowFromInputs();

  return {
    topic,
    angle: state.selectedAngle,
    voice: state.voice,
    personalStyle: state.personalStyle,
    generationSettings: state.generationSettings,
    userIdea: state.workflow.userIdea,
    draft: elements.draftOutput.value.trim(),
    critique: elements.critiqueOutput.value.trim(),
    rewrite: elements.rewriteOutput.value.trim(),
    final: elements.finalOutput.value.trim(),
    history: state.history
  };
}

async function generatePost() {
  const payload = getWorkflowPayload();
  setBusy(true);
  elements.providerBadge.textContent = "Drafting";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Draft request failed");
    }

    const data = await response.json();
    elements.draftOutput.value = data.post || "";
    elements.critiqueOutput.value = "";
    elements.rewriteOutput.value = "";
    elements.finalOutput.value = "";
    elements.providerBadge.textContent = data.provider === "claude" ? "Claude draft" : "Local draft";
    setWorkflowStage("draft");
    renderMetrics();
    showToast(data.provider === "claude" ? "Claude draft ready." : "Local draft ready.");
  } catch (error) {
    elements.draftOutput.value = createLocalDraft(
      payload.topic,
      state.selectedAngle,
      state.voice,
      state.personalStyle,
      state.generationSettings,
      state.workflow.userIdea
    );
    elements.critiqueOutput.value = "";
    elements.rewriteOutput.value = "";
    elements.finalOutput.value = "";
    elements.providerBadge.textContent = "Local draft";
    setWorkflowStage("draft");
    renderMetrics();
    showToast("Local draft ready.");
  } finally {
    setBusy(false);
  }
}

async function runWorkflowStage(stage) {
  const payload = getWorkflowPayload();

  if (stage === "critique" && !payload.draft) {
    showToast("Generate or write a draft first.");
    return;
  }

  if (stage === "rewrite" && !payload.draft) {
    showToast("Generate or write a draft first.");
    return;
  }

  if (stage === "rewrite" && !payload.critique) {
    showToast("Critique the draft first.");
    return;
  }

  if (stage === "polish" && !payload.rewrite) {
    showToast("Rewrite the draft first.");
    return;
  }

  setBusy(true);
  elements.providerBadge.textContent = stage === "polish" ? "Polishing" : stage === "rewrite" ? "Rewriting" : "Critiquing";

  try {
    const response = await fetch("/api/workflow", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, stage })
    });

    if (!response.ok) {
      throw new Error("Workflow request failed");
    }

    const data = await response.json();
    applyWorkflowResult(stage, data.text || "");
    elements.providerBadge.textContent =
      data.provider === "claude" ? `Claude ${getStageLabel(stage).toLowerCase()}` : `Local ${getStageLabel(stage).toLowerCase()}`;
    showToast(`${getStageLabel(stage)} ready.`);
  } catch (error) {
    applyWorkflowResult(stage, createLocalWorkflowText(stage, payload));
    elements.providerBadge.textContent = `Local ${getStageLabel(stage).toLowerCase()}`;
    showToast(`${getStageLabel(stage)} ready.`);
  } finally {
    setBusy(false);
  }
}

function applyWorkflowResult(stage, text) {
  if (stage === "critique") {
    elements.critiqueOutput.value = text;
  }

  if (stage === "rewrite") {
    elements.rewriteOutput.value = text;
    elements.finalOutput.value = "";
  }

  if (stage === "polish") {
    elements.finalOutput.value = text;
  }

  setWorkflowStage(stage);
  renderMetrics();
}

function getStageLabel(stage) {
  const labels = {
    critique: "Critique",
    rewrite: "Rewrite",
    polish: "Final polish"
  };
  return labels[stage] || "Workflow step";
}

function createLocalWorkflowText(stage, payload) {
  if (stage === "critique") {
    return createLocalCritique(payload);
  }

  if (stage === "rewrite") {
    return createLocalRewrite(payload);
  }

  if (stage === "polish") {
    return createLocalPolish(payload);
  }

  return "";
}

function createLocalDraft(topic, angle, voice, personalStyle = {}, generationSettings = DEFAULT_GENERATION_SETTINGS, userIdea = "") {
  const title = topic.title || "How AI changes product work";
  const topicPhrase = title.charAt(0).toLowerCase() + title.slice(1);
  const pillar = topic.pillar || "AI at Work";
  const currentTrigger = generationSettings.currentAffair || "";
  const viralityMode = generationSettings.viralityMode || "Insight-led";
  const styleMode = generationSettings.styleMode || "Balanced";
  const audience = voice.audience || "product and AI leaders";
  const pointOfView =
    voice.pointOfView ||
    "AI creates advantage when teams redesign decisions and workflows, not when they simply add another tool";

  const hasStyleSamples = Boolean((personalStyle.samples || "").trim());
  const triggerPhrase = currentTrigger ? currentTrigger.split(/[.!?\n]/)[0].trim() : topicPhrase;
  const ideaLine = userIdea
    ? `The starting point is simple: ${userIdea}`
    : `The useful conversation starts with ${topicPhrase}.`;
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
      "One lesson I have learned from building around AI: the product decision matters more than the demo."
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
        : `The easiest take on this week's AI narrative is probably the least useful one.`,
      `A current headline is useful only if it helps us see the system behind the noise.`,
      `The news cycle moves fast. Operating reality moves slower. That gap is where the lesson sits.`
    ];
  }

  if (viralityMode === "Contrarian commentary") {
    hooks[angle] = [
      `The popular take on ${topicPhrase} is too neat.`,
      `I think the obvious lesson from ${topicPhrase} is the wrong one.`,
      `We may be overestimating the technology shift and underestimating the operating shift.`
    ];
  }

  if (viralityMode === "Anecdote-led") {
    hooks[angle] = [
      `A small moment changed how I think about ${topicPhrase}.`,
      `This sounds like a technology story. It is really a human behavior story.`,
      `I keep coming back to one pattern: people do not adopt systems. They adopt relief from friction.`
    ];
  }

  if (viralityMode === "Debate spark") {
    hooks[angle] = [
      `What if the way we talk about ${topicPhrase} is making teams less prepared?`,
      `There are two kinds of leaders in the AI shift. Only one is building for what comes next.`,
      `A question worth debating: are we automating work, or just moving the bottleneck somewhere else?`
    ];
  }

  const body = {
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
    randomItem(hooks[angle] || hooks.Teach),
    "",
    ideaLine,
    "",
    body[angle] || body.Teach,
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

function createLocalCritique(payload) {
  const draft = payload.draft || "";
  const words = draft ? draft.split(/\s+/).length : 0;
  const hasQuestion = /\?\s*$/.test(draft.trim()) || draft.includes("?");
  const hasIdea = Boolean((payload.userIdea || "").trim());

  return [
    "Hook: Make the first line sharper and more specific. It should create tension before it explains.",
    `Core idea: ${hasIdea ? "The draft uses the user idea, but the implication can be made more explicit." : "The draft would be stronger with a concrete user idea or lived trigger."}`,
    "Structure: Keep the post moving from observation to tension to implication. Remove any paragraph that only repeats the same claim.",
    "Originality: Push beyond a generic AI/product lesson. Name the hidden bottleneck, trade-off, or human behavior underneath.",
    `Engagement: ${hasQuestion ? "The closing question is present; make it more debatable." : "Add a closing question that invites a point of view."}`,
    `Length: ${words} words. Aim for 130-220 words unless the story needs more room.`,
    "Rewrite direction: Start with the strongest tension, add one concrete example or analogy, then end with a crisp leadership/product implication."
  ].join("\n");
}

function createLocalRewrite(payload) {
  const source = payload.draft || createLocalDraft(
    payload.topic,
    payload.angle,
    payload.voice,
    payload.personalStyle,
    payload.generationSettings,
    payload.userIdea
  );
  const idea = payload.userIdea || payload.topic.title;
  const firstLine = payload.generationSettings.viralityMode === "Debate spark"
    ? `What if the obvious take on ${idea.toLowerCase()} is the wrong one?`
    : `The visible story is ${idea}.`;

  return [
    firstLine,
    "",
    "The deeper story is usually less convenient.",
    "",
    "Most teams look at AI through the lens of capability: what can the model do, how fast can it do it, and where can we plug it into the workflow?",
    "",
    "But capability is rarely the real bottleneck.",
    "",
    "The harder question is whether the surrounding system is ready for the change: incentives, handoffs, governance, trust, and the human judgment that still has to sit between the model and the outcome.",
    "",
    "This is where many AI efforts lose momentum. They improve one node in the chain while the rest of the organization continues to run on old assumptions.",
    "",
    "The lesson for product and leadership teams is simple: do not just ask what AI can automate.",
    "",
    "Ask what decision, behavior, or operating rhythm needs to be redesigned because AI is now part of the system.",
    "",
    "Where do you think teams are still confusing AI capability with AI readiness?"
  ].join("\n");
}

function createLocalPolish(payload) {
  const source = payload.rewrite || payload.draft || "";
  if (!source.trim()) {
    return "";
  }

  return source
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+$/gm, "")
    .replace(/very /gi, "")
    .replace(/really /gi, "")
    .trim();
}

function saveToTracker() {
  const draft = getPublishableDraft();
  if (!draft) {
    showToast("Generate or write a post first.");
    return;
  }

  const topic = getSelectedTopic();
  const item = {
    id: crypto.randomUUID(),
    topicId: topic.id,
    topic: topic.title,
    pillar: topic.pillar,
    angle: state.selectedAngle,
    draft,
    createdAt: new Date().toISOString()
  };

  state.history = [item, ...state.history].slice(0, 52);
  saveJson("linkedinStudioHistory", state.history);
  renderTopics();
  renderHistory();
  showToast("Saved to tracker.");
}

async function copyDraft() {
  const draft = getPublishableDraft();
  if (!draft) {
    showToast("Nothing to copy yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(draft);
    showToast("Copied for LinkedIn.");
  } catch {
    elements.draftOutput.select();
    document.execCommand("copy");
    showToast("Copied for LinkedIn.");
  }
}

function surpriseMe() {
  const currentFilter = elements.pillarFilter.value || "All";
  const candidates = (currentFilter === "All" ? TOPICS : TOPICS.filter((topic) => topic.pillar === currentFilter)).filter(
    (topic) => !isTopicUsed(topic.id)
  );
  const pool = candidates.length ? candidates : TOPICS;
  const nextTopic = pool[Math.floor(Math.random() * pool.length)];
  const angles = ["Teach", "Challenge", "Personal story", "Hot take"];
  state.selectedTopicId = nextTopic.id;
  state.selectedAngle = angles[Math.floor(Math.random() * angles.length)];
  renderTopics();
  renderComposer();
}

function setBusy(isBusy) {
  elements.generateButton.disabled = isBusy;
  updateWorkflowControls(isBusy);
  elements.generateButton.textContent = isBusy ? "Generating" : "Generate post";
}

function updateWorkflowControls(isBusy = false) {
  const hasDraft = Boolean(elements.draftOutput.value.trim());
  const hasCritique = Boolean(elements.critiqueOutput.value.trim());
  const hasRewrite = Boolean(elements.rewriteOutput.value.trim());

  elements.critiqueButton.disabled = isBusy || !hasDraft;
  elements.rewriteButton.disabled = isBusy || !hasDraft || !hasCritique;
  elements.polishButton.disabled = isBusy || !hasRewrite;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2200);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

elements.topicGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-topic-id]");
  if (!card) return;
  state.selectedTopicId = card.dataset.topicId;
  renderTopics();
  renderComposer();
});

document.querySelectorAll(".angle-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedAngle = button.dataset.angle;
    renderComposer();
  });
});

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.generationSettings.styleMode = button.dataset.styleMode;
    saveJson("linkedinStudioGenerationSettings", state.generationSettings);
    renderComposer();
  });
});

[
  elements.voiceTone,
  elements.voiceAudience,
  elements.voicePointOfView,
  elements.voiceCredentials,
  elements.voiceAvoid
].forEach((input) => {
  input.addEventListener("input", syncVoiceFromInputs);
});

[elements.styleInstructions, elements.styleSamples].forEach((input) => {
  input.addEventListener("input", syncPersonalStyleFromInputs);
});

[elements.viralityMode, elements.currentAffair].forEach((input) => {
  input.addEventListener("input", syncGenerationSettingsFromInputs);
  input.addEventListener("change", syncGenerationSettingsFromInputs);
});

elements.userIdea.addEventListener("input", syncWorkflowFromInputs);
elements.pillarFilter.addEventListener("change", renderTopics);
elements.surpriseButton.addEventListener("click", surpriseMe);
elements.generateButton.addEventListener("click", generatePost);
elements.critiqueButton.addEventListener("click", () => runWorkflowStage("critique"));
elements.rewriteButton.addEventListener("click", () => runWorkflowStage("rewrite"));
elements.polishButton.addEventListener("click", () => runWorkflowStage("polish"));
elements.copyButton.addEventListener("click", copyDraft);
elements.saveButton.addEventListener("click", saveToTracker);
[elements.draftOutput, elements.rewriteOutput, elements.finalOutput].forEach((input) => {
  input.addEventListener("input", () => {
    renderMetrics();
    renderWorkflow();
  });
});
elements.critiqueOutput.addEventListener("input", () => setWorkflowStage("critique"));
elements.resetVoiceButton.addEventListener("click", () => {
  state.voice = structuredClone(DEFAULT_VOICE);
  saveJson("linkedinStudioVoice", state.voice);
  renderVoice();
  showToast("Brand voice reset.");
});
elements.resetStyleButton.addEventListener("click", () => {
  state.personalStyle = structuredClone(DEFAULT_PERSONAL_STYLE);
  saveJson("linkedinStudioPersonalStyle", state.personalStyle);
  renderPersonalStyle();
  showToast("Personal style reset.");
});

renderPillarFilter();
renderAll();
