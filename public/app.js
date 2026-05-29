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
    prompt: "Explore how AI helps managers notice patterns, tradeoffs, and follow-through.",
    profiles: ["product-ai", "consultant", "enterprise-leader"]
  },
  {
    id: "product-requirements-ai",
    pillar: "Product Thinking",
    title: "The AI-era PRD starts with judgment, not features",
    prompt: "Reframe product requirements around decisions, context, uncertainty, and feedback.",
    profiles: ["product-ai", "entrepreneur", "genai-engineer"]
  },
  {
    id: "shipping-ai-features",
    pillar: "Product Thinking",
    title: "Shipping AI features without making the product feel less trustworthy",
    prompt: "Talk about confidence, graceful failure, user control, and expectation setting.",
    profiles: ["product-ai", "entrepreneur", "genai-engineer"]
  },
  {
    id: "enterprise-ai-pilots",
    pillar: "Enterprise Transformation",
    title: "Why enterprise AI pilots stall after the first impressive demo",
    prompt: "Connect adoption to incentives, process ownership, change management, and measurement.",
    profiles: ["product-ai", "consultant", "enterprise-leader", "supply-chain"]
  },
  {
    id: "procurement-ai",
    pillar: "Enterprise Transformation",
    title: "Procurement may shape enterprise AI more than model quality",
    prompt: "Show how legal, security, data access, and vendor risk decide what reaches production.",
    profiles: ["product-ai", "consultant", "enterprise-leader", "supply-chain"]
  },
  {
    id: "consumer-ai-memory",
    pillar: "Consumer AI",
    title: "Consumer AI gets interesting when it remembers taste, not just tasks",
    prompt: "Explain why personalization, taste, and context change the product experience.",
    profiles: ["product-ai", "entrepreneur"]
  },
  {
    id: "ai-native-consumer-products",
    pillar: "Consumer AI",
    title: "AI-native consumer products need rituals, not just chat boxes",
    prompt: "Explore habit loops, moments of delight, and repeat usage beyond novelty.",
    profiles: ["product-ai", "entrepreneur"]
  },
  {
    id: "leadership-ai-ambiguity",
    pillar: "Leadership in the Age of AI",
    title: "AI leadership is becoming ambiguity management",
    prompt: "Write about making calls when capability, risk, and expectations keep shifting.",
    profiles: ["product-ai", "consultant", "enterprise-leader", "supply-chain"]
  },
  {
    id: "exec-ai-literacy",
    pillar: "Leadership in the Age of AI",
    title: "The new executive literacy: knowing what not to automate",
    prompt: "Make the case for restraint, accountability, and protecting high-trust moments.",
    profiles: ["product-ai", "consultant", "enterprise-leader", "supply-chain"]
  },
  {
    id: "metrics-for-ai-products",
    pillar: "Product Thinking",
    title: "The AI product metric that matters before retention",
    prompt: "Focus on whether the product earns user trust through useful, repeated outcomes.",
    profiles: ["product-ai", "entrepreneur", "genai-engineer"]
  },
  {
    id: "enterprise-consumer-gap",
    pillar: "Enterprise Transformation",
    title: "Enterprise AI can learn from consumer AI's obsession with friction",
    prompt: "Compare enterprise workflow depth with consumer-grade usability expectations.",
    profiles: ["product-ai", "consultant", "enterprise-leader"]
  },
  {
    id: "current-affair-product-lesson",
    pillar: "Current Affairs",
    title: "Turn a current headline into a product lesson",
    prompt: "Use a live market or culture trigger, then extract the domain, leadership, or operating implication."
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
    title: "A contrarian read on this week's dominant narrative",
    prompt: "Start from a current debate, then offer a grounded, original counterpoint."
  },
  {
    id: "founder-capital-efficiency",
    pillar: "Founder Operating Systems",
    title: "Capital efficiency is becoming a founder superpower",
    prompt: "Show how small teams can turn constraints into sharper product, GTM, and operating choices.",
    profiles: ["entrepreneur"]
  },
  {
    id: "founder-ai-leverage",
    pillar: "Founder Operating Systems",
    title: "The AI-native founder does not just move faster",
    prompt: "Explain how founders can use AI to compress learning cycles without outsourcing judgment.",
    profiles: ["entrepreneur", "product-ai"]
  },
  {
    id: "consulting-ai-operating-model",
    pillar: "Consulting and Advisory",
    title: "The AI slide that needs an operating model behind it",
    prompt: "Turn boardroom AI ambition into governance, workflows, measurement, and change execution.",
    profiles: ["consultant", "enterprise-leader"]
  },
  {
    id: "analyst-signal-vs-noise",
    pillar: "Market Analysis",
    title: "Signal vs noise in the next market narrative",
    prompt: "Help analysts separate headline momentum from durable shifts in value pools and execution risk.",
    profiles: ["consultant", "entrepreneur", "enterprise-leader"]
  },
  {
    id: "genai-eval-reliability",
    pillar: "Engineering and AI Systems",
    title: "GenAI reliability is an evaluation problem before it is a model problem",
    prompt: "Write about evals, failure modes, retrieval quality, guardrails, and production readiness.",
    profiles: ["genai-engineer", "technical-architect"]
  },
  {
    id: "agentic-systems-recovery",
    pillar: "Engineering and AI Systems",
    title: "Judge AI agents by recovery, not demos",
    prompt: "Explain why production agents need observability, fallback paths, memory boundaries, and human review.",
    profiles: ["genai-engineer", "product-ai", "technical-architect"]
  },
  {
    id: "ai-ux-trust",
    pillar: "Design and Experience",
    title: "AI UX earns trust before it earns delight",
    prompt: "Connect confidence, control, recovery, and transparency to product experience quality.",
    profiles: ["ui-ux-designer", "product-ai", "entrepreneur"]
  },
  {
    id: "invisible-ai-ux",
    pillar: "Design and Experience",
    title: "The invisible UX of AI is recovery",
    prompt: "Show why graceful failure, human override, and context repair matter more than magical first-run demos.",
    profiles: ["ui-ux-designer", "genai-engineer", "product-ai"]
  },
  {
    id: "design-systems-behavior",
    pillar: "Design and Experience",
    title: "Design systems need behavior systems in the AI era",
    prompt: "Reframe components, patterns, and governance around dynamic model behavior and user trust.",
    profiles: ["ui-ux-designer", "technical-architect", "product-ai"]
  },
  {
    id: "architecture-as-product",
    pillar: "Architecture and Platforms",
    title: "Architecture decisions are product decisions now",
    prompt: "Explain how latency, memory, auth, cost, and failure modes shape what users actually experience.",
    profiles: ["technical-architect", "genai-engineer", "enterprise-leader", "product-ai"]
  },
  {
    id: "model-gateway-architecture",
    pillar: "Architecture and Platforms",
    title: "The model gateway is becoming the new integration layer",
    prompt: "Write about routing, cost controls, evals, policy, observability, and vendor optionality.",
    profiles: ["technical-architect", "genai-engineer", "enterprise-leader"]
  },
  {
    id: "scaling-ai-apps-boundaries",
    pillar: "Architecture and Platforms",
    title: "Scaling AI apps is mostly about boundaries",
    prompt: "Challenge the idea that bigger models solve architecture problems; focus on data, queues, contracts, and blast radius.",
    profiles: ["technical-architect", "genai-engineer"]
  },
  {
    id: "supply-chain-demand-sensing",
    pillar: "Supply Chain Leadership",
    title: "Demand sensing fails when decision rights are unclear",
    prompt: "Connect AI forecasts to planning cadence, commercial incentives, inventory trade-offs, and accountability.",
    profiles: ["supply-chain", "enterprise-leader"]
  },
  {
    id: "supply-chain-control-tower",
    pillar: "Supply Chain Leadership",
    title: "The control tower is becoming a decision product",
    prompt: "Reframe supply chain visibility around exceptions, judgment, response loops, and resilience.",
    profiles: ["supply-chain"]
  },
  {
    id: "enterprise-transformation-leadership",
    pillar: "Leadership Systems",
    title: "Transformation fails when leaders buy tools before changing rituals",
    prompt: "Explore how executives turn new technology into operating cadence, incentives, and behavior change.",
    profiles: ["enterprise-leader", "consultant", "supply-chain"]
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

const DEFAULT_PROFILE_ID = "product-ai";

const PROFILE_PRESETS = [
  {
    id: "product-ai",
    label: "Product x AI Leader",
    chip: "Product/AI",
    description: "PM, AI strategy, enterprise transformation, and consumer product judgment.",
    voice: DEFAULT_VOICE,
    personalStyle: DEFAULT_PERSONAL_STYLE
  },
  {
    id: "entrepreneur",
    label: "Entrepreneur / Founder",
    chip: "Founder",
    description: "Builder-led posts about markets, product, GTM, capital efficiency, and hard decisions.",
    voice: {
      tone: "Direct, practical, builder-led, optimistic but not naive",
      audience: "Founders, operators, investors, early team members, and startup leaders",
      pointOfView:
        "Founders win when they turn constraints into sharper product judgment, faster learning loops, and disciplined execution",
      credentials: "Founder/operator lens, customer discovery, GTM experiments, product-market fit, hiring, capital allocation",
      avoid: "Empty hustle, vanity metrics, generic startup advice, fundraising theater"
    },
    personalStyle: {
      instructions:
        "Open with a founder tension, customer moment, market observation, or operating scar. Move quickly from story to lesson. Keep the voice specific, candid, and useful. Show the trade-off behind the decision. End with a question other builders would actually debate.",
      samples: ""
    }
  },
  {
    id: "consultant",
    label: "Consultant / Analyst",
    chip: "Advisory",
    description: "Boardroom-ready commentary for consulting, strategy, market analysis, and client transformation.",
    voice: {
      tone: "Analytical, structured, senior, concise, and commercially aware",
      audience: "Consulting partners, analysts, client executives, transformation leaders, and strategy teams",
      pointOfView:
        "Good advisory work turns ambiguity into decision clarity, operating choices, and measurable business impact",
      credentials: "Client transformation lens, market analysis, executive communication, operating model design, business case rigor",
      avoid: "Deck-speak, vague frameworks, performative certainty, generic digital transformation language"
    },
    personalStyle: {
      instructions:
        "Open with a market signal, client pattern, boardroom tension, or counterintuitive data read. Structure the post like a sharp memo: observation, implication, risk, decision. Use crisp framing, clear trade-offs, and practical executive language.",
      samples: ""
    }
  },
  {
    id: "ui-ux-designer",
    label: "UI/UX Designer",
    chip: "Design",
    description: "Experience-led posts about product craft, design systems, AI UX, research, and trust.",
    voice: {
      tone: "Clear, human, craft-aware, practical, and insight-led",
      audience: "Designers, product managers, researchers, founders, design leaders, and AI product teams",
      pointOfView:
        "Great design in the AI era turns uncertainty into understandable choices, trusted interactions, and humane systems",
      credentials: "UX strategy, interaction design, research synthesis, design systems, accessibility, product craft, AI experience design",
      avoid: "Dribbble aesthetics, vague empathy language, generic design quotes, beauty without behavior"
    },
    personalStyle: {
      instructions:
        "Open with a product moment, user hesitation, design trade-off, or deceptively simple interface question. Move from surface experience to the system behavior underneath it. Keep the post concrete, humane, and useful for teams building real products. End with a question about trust, clarity, or user agency.",
      samples: ""
    }
  },
  {
    id: "genai-engineer",
    label: "GenAI Engineer",
    chip: "Engineering",
    description: "Technical credibility for builders of LLM apps, agents, evals, RAG, and production AI systems.",
    voice: {
      tone: "Technically credible, precise, pragmatic, and implementation-aware",
      audience: "AI engineers, platform teams, product engineers, ML leaders, founders, and technical PMs",
      pointOfView:
        "GenAI systems create value when engineering teams design for reliability, evaluation, observability, and human trust",
      credentials: "LLM application engineering, RAG, agents, evals, observability, architecture, production trade-offs",
      avoid: "Model hype, benchmark worship, hand-wavy architecture, unexplained jargon"
    },
    personalStyle: {
      instructions:
        "Open with a concrete production failure, engineering trade-off, or deceptively simple technical question. Explain the system underneath the demo. Make the post useful to builders without turning it into documentation. Name failure modes and design principles.",
      samples: ""
    }
  },
  {
    id: "technical-architect",
    label: "Technical Architect",
    chip: "Architecture",
    description: "System-level posts about platforms, scalability, integration, reliability, security, and AI architecture.",
    voice: {
      tone: "Systems-minded, precise, commercially aware, pragmatic, and senior",
      audience: "CTOs, architects, platform leaders, engineering managers, AI teams, and enterprise technology leaders",
      pointOfView:
        "Architecture creates advantage when teams make explicit trade-offs around reliability, cost, security, data boundaries, and change velocity",
      credentials: "Enterprise architecture, cloud platforms, API design, reliability, security, integration patterns, AI platform architecture",
      avoid: "Architecture astronaut language, vendor bingo, diagrams without operating consequences, unexplained acronyms"
    },
    personalStyle: {
      instructions:
        "Open with a production constraint, architecture trade-off, scaling failure, or platform decision that looks technical but changes the business outcome. Explain the system, name the hidden coupling, and land the operating implication. Keep it accessible to leaders while credible to architects.",
      samples: ""
    }
  },
  {
    id: "supply-chain",
    label: "Supply Chain Leader",
    chip: "Supply chain",
    description: "Operations leadership across planning, resilience, procurement, logistics, and AI-enabled decisions.",
    voice: {
      tone: "Operational, grounded, executive, practical, and systems-oriented",
      audience: "Supply chain leaders, COOs, planning teams, procurement leaders, logistics leaders, and transformation teams",
      pointOfView:
        "Supply chain advantage comes from better decision loops, clearer trade-offs, and resilience designed into daily operations",
      credentials: "Planning cadence, demand sensing, inventory trade-offs, supplier risk, logistics, control towers, resilience",
      avoid: "Buzzwords, dashboard theater, simplistic automation claims, ignoring frontline constraints"
    },
    personalStyle: {
      instructions:
        "Open with an operational tension, disruption, forecast miss, inventory trade-off, or planning-room observation. Translate complexity into a clear decision lesson. Keep examples concrete and executive-ready. End with a question about accountability, resilience, or trade-offs.",
      samples: ""
    }
  },
  {
    id: "enterprise-leader",
    label: "Enterprise Leader",
    chip: "Executive",
    description: "Senior leadership posts about transformation, operating cadence, talent, governance, and AI adoption.",
    voice: {
      tone: "Authoritative, measured, strategic, human, and practical",
      audience: "CXOs, business unit leaders, transformation teams, HR leaders, and technology executives",
      pointOfView:
        "Enterprise transformation works when leaders redesign rituals, incentives, governance, and decision rights around the new capability",
      credentials: "Enterprise operating models, change leadership, governance, talent systems, AI adoption, cross-functional execution",
      avoid: "Top-down slogans, vague transformation language, tech-first thinking, culture platitudes"
    },
    personalStyle: {
      instructions:
        "Open with a leadership tension, organizational pattern, or transformation failure mode. Balance business logic with human context. Make the post useful for senior leaders who need to move from intent to operating change.",
      samples: ""
    }
  }
];

const DEFAULT_GENERATION_SETTINGS = {
  styleMode: "Balanced",
  viralityMode: "Insight-led",
  currentAffair: ""
};

const DEFAULT_WORKFLOW = {
  userIdea: "",
  contentBrief: {
    thesis: "",
    commonBelief: "",
    anecdote: "",
    evidence: "",
    takeaway: ""
  },
  graderEvaluation: null,
  activeStage: "idea"
};

const ANALYTICS_ENABLED = window.location.protocol.startsWith("http") && navigator.doNotTrack !== "1";
const ANALYTICS_USER_KEY = "linkedinStudioAnalyticsUser";
const ANALYTICS_SESSION_KEY = "linkedinStudioAnalyticsSession";

const storedProfileId = loadJson("linkedinStudioSelectedProfile", DEFAULT_PROFILE_ID);
const selectedProfileId = PROFILE_PRESETS.some((profile) => profile.id === storedProfileId)
  ? storedProfileId
  : DEFAULT_PROFILE_ID;
const legacyVoice = loadJson("linkedinStudioVoice", DEFAULT_VOICE);
const legacyPersonalStyle = ensurePersonalStyleSamples(loadJson("linkedinStudioPersonalStyle", DEFAULT_PERSONAL_STYLE), true);
const savedProfileOverrides = loadJson("linkedinStudioProfileOverrides", {});

if (!savedProfileOverrides[DEFAULT_PROFILE_ID]) {
  savedProfileOverrides[DEFAULT_PROFILE_ID] = {
    voice: legacyVoice,
    personalStyle: legacyPersonalStyle
  };
}

const initialProfileWorkspace = getProfileWorkspace(selectedProfileId, savedProfileOverrides);

const state = {
  selectedProfileId,
  profileOverrides: savedProfileOverrides,
  selectedTopicId: getDefaultTopicForProfile(selectedProfileId).id,
  selectedAngle: "Teach",
  voice: initialProfileWorkspace.voice,
  personalStyle: initialProfileWorkspace.personalStyle,
  generationSettings: ensureGenerationSettings(loadJson("linkedinStudioGenerationSettings", DEFAULT_GENERATION_SETTINGS)),
  workflow: ensureWorkflow(loadJson("linkedinStudioWorkflow", DEFAULT_WORKFLOW)),
  history: loadJson("linkedinStudioHistory", [])
};
saveJson("linkedinStudioProfileOverrides", state.profileOverrides);
saveJson("linkedinStudioPersonalStyle", state.personalStyle);

const elements = {
  weekLabel: document.querySelector("#weekLabel"),
  profileGrid: document.querySelector("#profileGrid"),
  selectedProfileMeta: document.querySelector("#selectedProfileMeta"),
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
  qualityNotice: document.querySelector("#qualityNotice"),
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
  briefThesis: document.querySelector("#briefThesis"),
  briefBelief: document.querySelector("#briefBelief"),
  briefAnecdote: document.querySelector("#briefAnecdote"),
  briefEvidence: document.querySelector("#briefEvidence"),
  briefTakeaway: document.querySelector("#briefTakeaway"),
  critiqueButton: document.querySelector("#critiqueButton"),
  rewriteButton: document.querySelector("#rewriteButton"),
  polishButton: document.querySelector("#polishButton"),
  critiqueOutput: document.querySelector("#critiqueOutput"),
  critiqueRow: document.querySelector("#critiqueRow"),
  graderPanel: document.querySelector("#graderPanel"),
  graderScore: document.querySelector("#graderScore"),
  graderVerdict: document.querySelector("#graderVerdict"),
  graderStrengths: document.querySelector("#graderStrengths"),
  graderWeaknesses: document.querySelector("#graderWeaknesses"),
  graderReasoning: document.querySelector("#graderReasoning"),
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

function getOrCreateAnalyticsId(key) {
  const existing = localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

function getAnalyticsSessionId() {
  const stored = loadJson(ANALYTICS_SESSION_KEY, null);
  const now = Date.now();
  if (stored?.id && stored?.expiresAt && stored.expiresAt > now) {
    stored.expiresAt = now + 30 * 60 * 1000;
    saveJson(ANALYTICS_SESSION_KEY, stored);
    return stored.id;
  }

  const session = {
    id: crypto.randomUUID(),
    expiresAt: now + 30 * 60 * 1000
  };
  saveJson(ANALYTICS_SESSION_KEY, session);
  return session.id;
}

const analyticsState = {
  enabled: ANALYTICS_ENABLED,
  anonymousId: ANALYTICS_ENABLED ? getOrCreateAnalyticsId(ANALYTICS_USER_KEY) : "",
  sessionId: ANALYTICS_ENABLED ? getAnalyticsSessionId() : "",
  startedAt: Date.now()
};

function countWords(text) {
  const clean = String(text || "").trim();
  return clean ? clean.split(/\s+/).length : 0;
}

function getSampleAnalytics() {
  const sampleText = elements.styleSamples?.value || "";
  const numberedSamples = sampleText.match(/^\s*\d+\./gm);
  return {
    sampleCount: numberedSamples ? numberedSamples.length : sampleText.trim() ? 1 : 0,
    sampleWordCount: countWords(sampleText)
  };
}

function getBriefAnalytics() {
  const fields = [
    elements.briefThesis?.value,
    elements.briefBelief?.value,
    elements.briefAnecdote?.value,
    elements.briefEvidence?.value,
    elements.briefTakeaway?.value
  ];

  return {
    briefFilledCount: fields.filter((value) => String(value || "").trim()).length
  };
}

function getAnalyticsContext(extra = {}) {
  const profile = getSelectedProfile();
  const topic = getSelectedTopic();
  return {
    profileId: profile.id,
    profileLabel: profile.label,
    topicId: topic.id,
    topicPillar: topic.pillar,
    angle: state.selectedAngle,
    styleMode: state.generationSettings.styleMode,
    viralityMode: state.generationSettings.viralityMode,
    userIdeaLength: elements.userIdea?.value?.trim().length || 0,
    currentTriggerLength: elements.currentAffair?.value?.trim().length || 0,
    historyCount: state.history.length,
    ...getSampleAnalytics(),
    ...getBriefAnalytics(),
    ...extra
  };
}

function getSafeReferrer() {
  if (!document.referrer) {
    return "";
  }

  try {
    const referrer = new URL(document.referrer);
    return `${referrer.origin}${referrer.pathname}`;
  } catch {
    return "";
  }
}

function trackEvent(event, properties = {}) {
  if (!analyticsState.enabled) {
    return;
  }

  const payload = {
    event,
    anonymousId: analyticsState.anonymousId,
    sessionId: analyticsState.sessionId,
    clientTs: new Date().toISOString(),
    page: window.location.pathname || "/",
    referrer: getSafeReferrer(),
    properties
  };
  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon) {
      const queued = navigator.sendBeacon("/api/analytics/event", new Blob([body], { type: "application/json" }));
      if (queued) {
        return;
      }
    }
  } catch {
    // Fall through to fetch; analytics should never interrupt the writing flow.
  }

  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {});
}

function ensurePersonalStyleSamples(personalStyle, includeSeedSamples = false) {
  const style = {
    ...DEFAULT_PERSONAL_STYLE,
    ...personalStyle
  };

  if (includeSeedSamples && !style.samples.includes("First HYROX: Humbled")) {
    style.samples = `${style.samples.trim()}\n\n${HYROX_STYLE_SAMPLE}`;
  }

  if (includeSeedSamples && !style.samples.includes("stack of stacks")) {
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
  const migratedStyleMode = {
    "Brand-led": "Profile-led",
    "Style-led": "Tone-led"
  }[settings?.styleMode] || settings?.styleMode;

  return {
    ...DEFAULT_GENERATION_SETTINGS,
    ...settings,
    styleMode: migratedStyleMode || DEFAULT_GENERATION_SETTINGS.styleMode
  };
}

function ensureWorkflow(workflow) {
  return {
    ...DEFAULT_WORKFLOW,
    ...(workflow || {}),
    contentBrief: {
      ...DEFAULT_WORKFLOW.contentBrief,
      ...(workflow?.contentBrief || {})
    }
  };
}

function getSelectedProfile() {
  return PROFILE_PRESETS.find((profile) => profile.id === state.selectedProfileId) || PROFILE_PRESETS[0];
}

function getProfilePreset(profileId) {
  return PROFILE_PRESETS.find((profile) => profile.id === profileId) || PROFILE_PRESETS[0];
}

function getProfileWorkspace(profileId, overrides = {}) {
  const preset = getProfilePreset(profileId);
  const override = overrides[profileId] || {};
  return {
    voice: {
      ...preset.voice,
      ...(override.voice || {})
    },
    personalStyle: ensurePersonalStyleSamples({
      ...preset.personalStyle,
      ...(override.personalStyle || {})
    }, profileId === DEFAULT_PROFILE_ID)
  };
}

function persistProfileWorkspace() {
  state.profileOverrides = {
    ...state.profileOverrides,
    [state.selectedProfileId]: {
      voice: state.voice,
      personalStyle: state.personalStyle
    }
  };
  saveJson("linkedinStudioProfileOverrides", state.profileOverrides);
  saveJson("linkedinStudioVoice", state.voice);
  saveJson("linkedinStudioPersonalStyle", state.personalStyle);
}

function topicMatchesProfile(topic, profileId = state.selectedProfileId) {
  return !Array.isArray(topic.profiles) || topic.profiles.includes(profileId);
}

function getTopicsForProfile(profileId = state.selectedProfileId) {
  return TOPICS
    .filter((topic) => topicMatchesProfile(topic, profileId))
    .sort((a, b) => {
      const aSpecific = Array.isArray(a.profiles) && a.profiles.includes(profileId);
      const bSpecific = Array.isArray(b.profiles) && b.profiles.includes(profileId);
      return Number(bSpecific) - Number(aSpecific);
    });
}

function getDefaultTopicForProfile(profileId) {
  const effectiveProfileId = profileId || (typeof state === "undefined" ? DEFAULT_PROFILE_ID : state.selectedProfileId);
  return getTopicsForProfile(effectiveProfileId)[0] || TOPICS[0];
}

function ensureSelectedTopicForProfile() {
  if (!topicMatchesProfile(getSelectedTopic(), state.selectedProfileId)) {
    state.selectedTopicId = getDefaultTopicForProfile(state.selectedProfileId).id;
  }
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

function renderProfilePicker() {
  const profile = getSelectedProfile();
  elements.selectedProfileMeta.textContent = profile.description;
  elements.profileGrid.innerHTML = PROFILE_PRESETS.map((item) => {
    const active = item.id === state.selectedProfileId ? " active" : "";
    return `
      <button class="profile-card${active}" type="button" data-profile-id="${item.id}">
        <span>
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.description)}</span>
        </span>
        <span class="profile-chip">${escapeHtml(item.chip)}</span>
      </button>
    `;
  }).join("");
}

function renderPillarFilter() {
  const currentValue = elements.pillarFilter.value || "All";
  const pillars = [...new Set(getTopicsForProfile().map((topic) => topic.pillar))];
  elements.pillarFilter.innerHTML = [
    '<option value="All">All pillars</option>',
    ...pillars.map((pillar) => `<option value="${escapeHtml(pillar)}">${escapeHtml(pillar)}</option>`)
  ].join("");
  elements.pillarFilter.value = pillars.includes(currentValue) ? currentValue : "All";
}

function renderTopics() {
  const filter = elements.pillarFilter.value || "All";
  const profileTopics = getTopicsForProfile();
  const topics = filter === "All" ? profileTopics : profileTopics.filter((topic) => topic.pillar === filter);

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
  const workflow = ensureWorkflow(state.workflow);
  state.workflow = workflow;
  elements.userIdea.value = workflow.userIdea || "";
  elements.briefThesis.value = workflow.contentBrief.thesis || "";
  elements.briefBelief.value = workflow.contentBrief.commonBelief || "";
  elements.briefAnecdote.value = workflow.contentBrief.anecdote || "";
  elements.briefEvidence.value = workflow.contentBrief.evidence || "";
  elements.briefTakeaway.value = workflow.contentBrief.takeaway || "";
  document.querySelectorAll(".workflow-step").forEach((step) => {
    step.classList.toggle("active", step.dataset.workflowStage === workflow.activeStage);
  });
  renderGraderEvaluation();
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
          <span>${escapeHtml(item.profileLabel || "General")} - ${escapeHtml(item.pillar)} - ${escapeHtml(item.angle)} - ${date}</span>
        </article>
      `;
    })
    .join("");
}

function renderMetrics() {
  const text = getPublishableDraft();
  const words = countWords(text);
  elements.wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
  elements.charCount.textContent = `${text.length} chars`;
}

function renderSampleMetrics() {
  const sampleText = elements.styleSamples.value.trim();
  const numberedSamples = sampleText.match(/^\s*\d+\./gm);
  const samples = numberedSamples ? numberedSamples.length : sampleText ? 1 : 0;
  const words = countWords(sampleText);
  elements.sampleCount.textContent = `${samples} ${samples === 1 ? "sample" : "samples"}`;
  elements.sampleWordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
}

function getGraderScoreClass(score) {
  if (score >= 8) return "score-high";
  if (score >= 6) return "score-medium";
  return "score-low";
}

function normalizeClientGraderEvaluation(evaluation) {
  if (!evaluation || typeof evaluation !== "object") {
    return null;
  }

  const rawScore = Number(evaluation.score);
  const score = Number.isFinite(rawScore) ? Math.max(1, Math.min(10, Math.round(rawScore))) : 0;
  if (!score) {
    return null;
  }

  return {
    score,
    maxScore: Number(evaluation.maxScore) || 10,
    verdict: evaluation.verdict || (score >= 8 ? "Strong" : score >= 7 ? "Publishable with edits" : score >= 4 ? "Needs rewrite" : "Not publishable"),
    strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths.filter(Boolean).slice(0, 3) : [],
    weaknesses: Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses.filter(Boolean).slice(0, 3) : [],
    reasoning: evaluation.reasoning || "",
    provider: evaluation.provider || "",
    model: evaluation.model || "",
    warning: evaluation.warning || ""
  };
}

function renderGraderList(list, items, fallback) {
  list.innerHTML = (items.length ? items : [fallback])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function renderGraderEvaluation() {
  const evaluation = normalizeClientGraderEvaluation(state.workflow.graderEvaluation);
  elements.critiqueRow.classList.toggle("has-grader", Boolean(evaluation));
  elements.graderPanel.hidden = !evaluation;

  if (!evaluation) {
    elements.graderScore.textContent = "--/10";
    elements.graderVerdict.textContent = "";
    elements.graderStrengths.innerHTML = "";
    elements.graderWeaknesses.innerHTML = "";
    elements.graderReasoning.textContent = "";
    return;
  }

  elements.graderPanel.classList.remove("score-low", "score-medium", "score-high");
  elements.graderPanel.classList.add(getGraderScoreClass(evaluation.score));
  elements.graderScore.textContent = `${evaluation.score}/${evaluation.maxScore}`;
  elements.graderVerdict.textContent = evaluation.verdict;
  renderGraderList(elements.graderStrengths, evaluation.strengths, "Clear topic and enough structure to evaluate.");
  renderGraderList(elements.graderWeaknesses, evaluation.weaknesses, "Needs sharper specificity and stronger author voice.");
  elements.graderReasoning.textContent = evaluation.warning
    ? `${evaluation.reasoning} ${evaluation.warning}`.trim()
    : evaluation.reasoning;
}

function renderAll() {
  elements.weekLabel.textContent = getWeekLabel();
  ensureSelectedTopicForProfile();
  renderProfilePicker();
  renderPillarFilter();
  renderTopics();
  renderComposer();
  renderVoice();
  renderPersonalStyle();
  renderGenerationSettings();
  renderWorkflow();
  renderHistory();
  renderMetrics();
  renderGraderEvaluation();
}

function syncVoiceFromInputs() {
  state.voice = {
    tone: elements.voiceTone.value.trim(),
    audience: elements.voiceAudience.value.trim(),
    pointOfView: elements.voicePointOfView.value.trim(),
    credentials: elements.voiceCredentials.value.trim(),
    avoid: elements.voiceAvoid.value.trim()
  };
  persistProfileWorkspace();
}

function syncPersonalStyleFromInputs() {
  state.personalStyle = {
    instructions: elements.styleInstructions.value.trim(),
    samples: elements.styleSamples.value.trim()
  };
  persistProfileWorkspace();
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
    ...ensureWorkflow(state.workflow),
    userIdea: elements.userIdea.value.trim(),
    contentBrief: {
      thesis: elements.briefThesis.value.trim(),
      commonBelief: elements.briefBelief.value.trim(),
      anecdote: elements.briefAnecdote.value.trim(),
      evidence: elements.briefEvidence.value.trim(),
      takeaway: elements.briefTakeaway.value.trim()
    }
  };
  saveJson("linkedinStudioWorkflow", state.workflow);
}

function setWorkflowStage(stage) {
  state.workflow = {
    ...ensureWorkflow(state.workflow),
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
  const profile = getSelectedProfile();
  const topic = getSelectedTopic();
  syncVoiceFromInputs();
  syncPersonalStyleFromInputs();
  syncGenerationSettingsFromInputs();
  syncWorkflowFromInputs();

  return {
    profile: {
      id: profile.id,
      label: profile.label,
      description: profile.description
    },
    topic,
    angle: state.selectedAngle,
    voice: state.voice,
    personalStyle: state.personalStyle,
    generationSettings: state.generationSettings,
    userIdea: state.workflow.userIdea,
    contentBrief: state.workflow.contentBrief,
    graderEvaluation: state.workflow.graderEvaluation,
    draft: elements.draftOutput.value.trim(),
    critique: elements.critiqueOutput.value.trim(),
    rewrite: elements.rewriteOutput.value.trim(),
    final: elements.finalOutput.value.trim(),
    history: state.history
  };
}

function setQualityNotice(message = "") {
  if (!elements.qualityNotice) {
    return;
  }

  elements.qualityNotice.textContent = message;
  elements.qualityNotice.hidden = !message;
}

function setGraderEvaluation(evaluation) {
  state.workflow = {
    ...ensureWorkflow(state.workflow),
    graderEvaluation: normalizeClientGraderEvaluation(evaluation)
  };
  saveJson("linkedinStudioWorkflow", state.workflow);
  renderGraderEvaluation();
}

function clearGraderEvaluation() {
  if (!state.workflow.graderEvaluation) {
    return;
  }

  state.workflow = {
    ...ensureWorkflow(state.workflow),
    graderEvaluation: null
  };
  saveJson("linkedinStudioWorkflow", state.workflow);
  renderGraderEvaluation();
}

function applyProviderResult(data, label) {
  if (data.provider === "claude") {
    elements.providerBadge.textContent = `Claude ${label}`;
    setQualityNotice("");
    return true;
  }

  const fallbackMessage = data.warning ||
    "Claude is unavailable, so this result used the local fallback. Treat it as a rough placeholder; it may be more generic and less faithful to your samples.";
  elements.providerBadge.textContent = "Local fallback";
  setQualityNotice(fallbackMessage);
  return false;
}

async function generatePost() {
  const payload = getWorkflowPayload();
  const startedAt = Date.now();
  trackEvent("draft_requested", getAnalyticsContext({
    action: "generate_post"
  }));
  setBusy(true);
  elements.providerBadge.textContent = "Drafting";
  setQualityNotice("");

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
    clearGraderEvaluation();
    const usedClaude = applyProviderResult(data, "draft");
    setWorkflowStage("draft");
    renderMetrics();
    trackEvent("draft_generated", getAnalyticsContext({
      provider: data.provider || "unknown",
      model: data.model || "unknown",
      latencyMs: Date.now() - startedAt,
      draftWordCount: countWords(data.post || ""),
      success: true,
      usedFallback: !usedClaude
    }));
    showToast(usedClaude ? "Claude draft ready." : "Local fallback draft ready.");
  } catch (error) {
    const localDraft = createLocalDraft(
      payload.profile,
      payload.topic,
      state.selectedAngle,
      state.voice,
      state.personalStyle,
      state.generationSettings,
      state.workflow.userIdea
    );
    elements.draftOutput.value = localDraft;
    elements.critiqueOutput.value = "";
    elements.rewriteOutput.value = "";
    elements.finalOutput.value = "";
    clearGraderEvaluation();
    elements.providerBadge.textContent = "Local fallback";
    setQualityNotice("Claude request failed in the browser. This draft used the local fallback and may be more generic than production Claude output.");
    setWorkflowStage("draft");
    renderMetrics();
    trackEvent("draft_generated", getAnalyticsContext({
      provider: "local_browser",
      model: "local-brand-engine",
      latencyMs: Date.now() - startedAt,
      draftWordCount: countWords(localDraft),
      success: true,
      usedFallback: true,
      errorCode: "client_generate_failed"
    }));
    showToast("Local fallback draft ready.");
  } finally {
    setBusy(false);
  }
}

async function runWorkflowStage(stage) {
  const payload = getWorkflowPayload();

  if (stage === "critique" && !payload.draft) {
    trackEvent("workflow_blocked", getAnalyticsContext({ stage, errorCode: "missing_draft" }));
    showToast("Generate or write a draft first.");
    return;
  }

  if (stage === "rewrite" && !payload.draft) {
    trackEvent("workflow_blocked", getAnalyticsContext({ stage, errorCode: "missing_draft" }));
    showToast("Generate or write a draft first.");
    return;
  }

  if (stage === "rewrite" && !payload.critique) {
    trackEvent("workflow_blocked", getAnalyticsContext({ stage, errorCode: "missing_critique" }));
    showToast("Critique the draft first.");
    return;
  }

  if (stage === "polish" && !payload.rewrite) {
    trackEvent("workflow_blocked", getAnalyticsContext({ stage, errorCode: "missing_rewrite" }));
    showToast("Rewrite the draft first.");
    return;
  }

  const startedAt = Date.now();
  trackEvent("workflow_requested", getAnalyticsContext({ stage }));
  setBusy(true);
  elements.providerBadge.textContent = stage === "polish" ? "Polishing" : stage === "rewrite" ? "Rewriting" : "Critiquing";
  setQualityNotice("");

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
    applyWorkflowResult(stage, data.text || "", data.evaluation || null);
    const usedClaude = applyProviderResult(data, getStageLabel(stage).toLowerCase());
    trackEvent("workflow_completed", getAnalyticsContext({
      stage,
      provider: data.provider || "unknown",
      model: data.model || "unknown",
      latencyMs: Date.now() - startedAt,
      finalWordCount: countWords(data.text || ""),
      graderScore: data.evaluation?.score || 0,
      success: true,
      usedFallback: !usedClaude
    }));
    showToast(usedClaude ? `${getStageLabel(stage)} ready.` : `Local fallback ${getStageLabel(stage).toLowerCase()} ready.`);
  } catch (error) {
    const localText = createLocalWorkflowText(stage, payload);
    const localEvaluation = stage === "critique" ? createLocalGraderEvaluation(payload) : null;
    applyWorkflowResult(stage, localText, localEvaluation);
    elements.providerBadge.textContent = "Local fallback";
    setQualityNotice("Claude workflow request failed in the browser. This step used the local fallback and may be more generic than the Claude version.");
    trackEvent("workflow_completed", getAnalyticsContext({
      stage,
      provider: "local_browser",
      model: "local-brand-engine",
      latencyMs: Date.now() - startedAt,
      finalWordCount: countWords(localText),
      graderScore: localEvaluation?.score || 0,
      success: true,
      usedFallback: true,
      errorCode: "client_workflow_failed"
    }));
    showToast(`Local fallback ${getStageLabel(stage).toLowerCase()} ready.`);
  } finally {
    setBusy(false);
  }
}

function applyWorkflowResult(stage, text, evaluation = null) {
  if (stage === "critique") {
    elements.critiqueOutput.value = text;
    setGraderEvaluation(evaluation);
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

function createLocalDraft(profile, topic, angle, voice, personalStyle = {}, generationSettings = DEFAULT_GENERATION_SETTINGS, userIdea = "") {
  const profileLabel = profile?.label || "professional";
  const title = topic.title || "How this shift changes work";
  const topicPhrase = title.charAt(0).toLowerCase() + title.slice(1);
  const pillar = topic.pillar || "Professional Insight";
  const currentTrigger = generationSettings.currentAffair || "";
  const viralityMode = generationSettings.viralityMode || "Insight-led";
  const styleMode = generationSettings.styleMode || "Balanced";
  const audience = voice.audience || "domain peers and business leaders";
  const pointOfView =
    voice.pointOfView ||
    "distinctive expertise compounds when professionals turn domain judgment into clear decisions and useful stories";

  const hasStyleSamples = Boolean((personalStyle.samples || "").trim());
  const contentBrief = ensureWorkflow(state.workflow).contentBrief;
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
      "One lesson I keep relearning: the decision matters more than the demo."
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
        : `The easiest take on this week's narrative is probably the least useful one.`,
      `A current headline is useful only if it helps us see the system behind the noise.`,
      `The news cycle moves fast. Operating reality moves slower. That gap is where the lesson sits.`
    ];
  }

  if (viralityMode === "Contrarian commentary") {
    hooks[angle] = [
      `The popular take on ${topicPhrase} is too neat.`,
      `I think the obvious lesson from ${topicPhrase} is the wrong one.`,
      `We may be overestimating the headline shift and underestimating the operating shift.`
    ];
  }

  if (viralityMode === "Anecdote-led") {
    hooks[angle] = [
      `A small moment changed how I think about ${topicPhrase}.`,
      `This sounds like a tools story. It is really a human behavior story.`,
      `I keep coming back to one pattern: people do not adopt systems. They adopt relief from friction.`
    ];
  }

  if (viralityMode === "Debate spark") {
    hooks[angle] = [
      `What if the way we talk about ${topicPhrase} is making teams less prepared?`,
      `There are two kinds of leaders in any major shift. Only one is building for what comes next.`,
      `A question worth debating: are we automating work, or just moving the bottleneck somewhere else?`
    ];
  }

  const body = {
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
    "Tone-led": `But here is the part I keep returning to: ${pointOfView}.`
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
    randomItem(hooks[angle] || hooks.Teach),
    "",
    ideaLine,
    "",
    briefLine,
    briefLine ? "" : null,
    body[angle] || body.Teach,
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

function createLocalCritique(payload) {
  const draft = payload.draft || "";
  const words = draft ? draft.split(/\s+/).length : 0;
  const hasQuestion = /\?\s*$/.test(draft.trim()) || draft.includes("?");
  const hasIdea = Boolean((payload.userIdea || "").trim());
  const brief = payload.contentBrief || {};
  const hasBrief = Object.values(brief).some((value) => String(value || "").trim());

  return [
    "EDITORIAL DIAGNOSIS",
    "- Core problem: The draft needs a sharper author-owned tension and a more concrete proof point.",
    "- Generic or weak lines: Cut any line that explains importance without showing consequence.",
    "- Voice mismatch: Push closer to the sample pattern: concrete trigger, named tension, system-level implication, crisp thesis line.",
    `- Missing specificity: ${hasBrief ? "Use the content brief as the spine and make one brief detail visible in the body." : hasIdea ? "Turn the user idea into an example, tradeoff, or lived observation." : "Add a concrete user idea, lived trigger, or professional observation before rewriting."}`,
    "- Argument gap: Explain why the obvious interpretation is incomplete, then name the hidden bottleneck underneath it.",
    `- LinkedIn risk: ${words < 120 ? "Too thin to feel earned." : "Skippable if it stays abstract."}`,
    "",
    "REWRITE STRATEGY",
    "- New hook direction: Open with the strongest contradiction, not a summary.",
    "- Concrete anchor to add: One specific example, analogy, operating detail, or moment of friction.",
    "- Thesis line to sharpen: Make the central claim short enough to be remembered.",
    `- Ending move: ${hasQuestion ? "Make the closing question more debatable and less obvious." : "End with a soft question that invites a real point of view."}`,
    "",
    "QUALITY VERDICT",
    "- Publishable: Almost",
    "- Overall score: 6/10"
  ].join("\n");
}

function createLocalGraderEvaluation(payload) {
  const draft = payload.draft || "";
  const words = draft ? draft.split(/\s+/).filter(Boolean).length : 0;
  const brief = payload.contentBrief || {};
  const hasBrief = Object.values(brief).some((value) => String(value || "").trim());
  const hasConcreteAnchor = /\b\d+[%x]?\b|HYROX|Vande Bharat|Solow|client|customer|meeting|team|workflow|budget|legal|infosec/i.test(draft);
  const hasPointOfView = /not enough|not just|the real|the useful|the obvious|what if|because|but/i.test(draft);
  const hasQuestion = draft.includes("?");
  const hasGenericPattern = /in today's fast-paced|game[- ]changer|unlock|leverage|transformative|revolutionize|delve|navigate the complexities/i.test(draft);
  let score = 5;

  if (words >= 130 && words <= 420) score += 1;
  if (words < 90) score -= 1;
  if (hasBrief) score += 1;
  if (hasConcreteAnchor) score += 1;
  if (hasPointOfView) score += 1;
  if (hasQuestion) score += 0.5;
  if (hasGenericPattern) score -= 2;

  score = Math.max(1, Math.min(10, Math.round(score)));

  return normalizeClientGraderEvaluation({
    score,
    verdict: score >= 8 ? "Strong" : score >= 7 ? "Publishable with edits" : score >= 4 ? "Needs rewrite" : "Not publishable",
    strengths: [
      hasPointOfView ? "Visible point of view or tension." : "Recognizable topic and structure.",
      hasConcreteAnchor ? "Uses at least one concrete anchor." : "Has room for a sharper anchor.",
      hasBrief ? "Connects to the supplied content brief." : "Can become stronger with a filled content brief."
    ],
    weaknesses: [
      hasGenericPattern ? "Some phrasing still reads generic." : "Originality should still be stress-tested.",
      hasConcreteAnchor ? "The anchor can carry more consequence." : "Needs a named anecdote, detail, or proof point.",
      "Claude grader is unavailable here, so this local score is directional."
    ],
    reasoning: "Local grader score based on structure, specificity, point of view, content-brief use, and generic-language risk.",
    provider: "local_browser",
    model: "local-grader"
  });
}

function createLocalRewrite(payload) {
  const profileLabel = payload.profile?.label || "professional";
  const brief = payload.contentBrief || {};
  const idea = brief.thesis || payload.userIdea || payload.topic.title;
  const challengedBelief = brief.commonBelief || "new capability automatically creates better outcomes";
  const anchor = brief.anecdote || brief.evidence || "a team improves one visible part of the workflow while the real constraint remains somewhere else";
  const firstLine = payload.generationSettings.viralityMode === "Debate spark"
    ? `What if the obvious take on ${idea.toLowerCase()} is the wrong one?`
    : `The obvious story is ${idea}.`;

  return [
    firstLine,
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
    "This is where many efforts lose momentum. They improve one node in the chain while the rest of the organization continues to run on old assumptions.",
    "",
    "The lesson for leaders and operators is simple: do not just ask what the new capability can automate.",
    "",
    `For a ${profileLabel.toLowerCase()}, the stronger question is not just what changed. It is which decision, behavior, or operating rhythm now needs to be redesigned.`,
    "",
    "Where do you think teams are still confusing new capability with real readiness?"
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
  const profile = getSelectedProfile();
  const item = {
    id: crypto.randomUUID(),
    profileId: profile.id,
    profileLabel: profile.label,
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
  trackEvent("post_saved", getAnalyticsContext({
    finalWordCount: countWords(draft),
    action: "save_to_tracker"
  }));
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
    trackEvent("post_copied", getAnalyticsContext({
      finalWordCount: countWords(draft),
      action: "copy_to_clipboard"
    }));
    showToast("Copied for LinkedIn.");
  } catch {
    elements.draftOutput.select();
    document.execCommand("copy");
    trackEvent("post_copied", getAnalyticsContext({
      finalWordCount: countWords(draft),
      action: "copy_fallback"
    }));
    showToast("Copied for LinkedIn.");
  }
}

function clearWorkflowOutputs() {
  elements.draftOutput.value = "";
  elements.critiqueOutput.value = "";
  elements.rewriteOutput.value = "";
  elements.finalOutput.value = "";
  state.workflow = {
    ...state.workflow,
    graderEvaluation: null,
    activeStage: "idea"
  };
  saveJson("linkedinStudioWorkflow", state.workflow);
  renderMetrics();
  renderGraderEvaluation();
}

function selectProfile(profileId) {
  if (profileId === state.selectedProfileId) {
    return;
  }

  const fromProfileId = state.selectedProfileId;
  syncVoiceFromInputs();
  syncPersonalStyleFromInputs();
  state.selectedProfileId = profileId;
  saveJson("linkedinStudioSelectedProfile", state.selectedProfileId);

  const workspace = getProfileWorkspace(profileId, state.profileOverrides);
  state.voice = workspace.voice;
  state.personalStyle = workspace.personalStyle;
  state.selectedTopicId = getDefaultTopicForProfile(profileId).id;
  elements.pillarFilter.value = "All";
  clearWorkflowOutputs();
  renderAll();
  trackEvent("profile_selected", getAnalyticsContext({
    fromProfileId,
    action: "profile_switch"
  }));
  showToast(`${getSelectedProfile().label} profile loaded.`);
}

function surpriseMe() {
  const currentFilter = elements.pillarFilter.value || "All";
  const profileTopics = getTopicsForProfile();
  const candidates = (currentFilter === "All" ? profileTopics : profileTopics.filter((topic) => topic.pillar === currentFilter)).filter(
    (topic) => !isTopicUsed(topic.id)
  );
  const pool = candidates.length ? candidates : profileTopics;
  const nextTopic = pool[Math.floor(Math.random() * pool.length)];
  const angles = ["Teach", "Challenge", "Personal story", "Hot take"];
  state.selectedTopicId = nextTopic.id;
  state.selectedAngle = angles[Math.floor(Math.random() * angles.length)];
  renderTopics();
  renderComposer();
  trackEvent("surprise_clicked", getAnalyticsContext({
    action: "surprise_topic"
  }));
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

elements.profileGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-profile-id]");
  if (!card) return;
  selectProfile(card.dataset.profileId);
});

elements.topicGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-topic-id]");
  if (!card) return;
  state.selectedTopicId = card.dataset.topicId;
  renderTopics();
  renderComposer();
  trackEvent("topic_selected", getAnalyticsContext({
    action: "topic_card"
  }));
});

document.querySelectorAll(".angle-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedAngle = button.dataset.angle;
    renderComposer();
    trackEvent("angle_selected", getAnalyticsContext({
      action: "angle_button"
    }));
  });
});

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.generationSettings.styleMode = button.dataset.styleMode;
    saveJson("linkedinStudioGenerationSettings", state.generationSettings);
    renderComposer();
    trackEvent("style_mode_selected", getAnalyticsContext({
      action: "style_mode_button"
    }));
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

elements.styleSamples.addEventListener("change", () => {
  trackEvent("tone_samples_changed", getAnalyticsContext({
    action: "sample_text_changed"
  }));
});

[elements.viralityMode, elements.currentAffair].forEach((input) => {
  input.addEventListener("input", syncGenerationSettingsFromInputs);
  input.addEventListener("change", syncGenerationSettingsFromInputs);
});

elements.viralityMode.addEventListener("change", () => {
  trackEvent("virality_mode_changed", getAnalyticsContext({
    action: "virality_select"
  }));
});

elements.currentAffair.addEventListener("change", () => {
  trackEvent("current_trigger_changed", getAnalyticsContext({
    action: "current_trigger_text_changed"
  }));
});

elements.userIdea.addEventListener("input", syncWorkflowFromInputs);
elements.userIdea.addEventListener("change", () => {
  trackEvent("user_idea_changed", getAnalyticsContext({
    action: "user_idea_text_changed"
  }));
});
[
  elements.briefThesis,
  elements.briefBelief,
  elements.briefAnecdote,
  elements.briefEvidence,
  elements.briefTakeaway
].forEach((input) => {
  input.addEventListener("input", syncWorkflowFromInputs);
  input.addEventListener("change", () => {
    trackEvent("content_brief_changed", getAnalyticsContext({
      action: "content_brief_text_changed"
    }));
  });
});
elements.pillarFilter.addEventListener("change", () => {
  renderTopics();
  trackEvent("pillar_filter_changed", getAnalyticsContext({
    pillar: elements.pillarFilter.value,
    action: "pillar_filter"
  }));
});
elements.surpriseButton.addEventListener("click", surpriseMe);
elements.generateButton.addEventListener("click", generatePost);
elements.critiqueButton.addEventListener("click", () => runWorkflowStage("critique"));
elements.rewriteButton.addEventListener("click", () => runWorkflowStage("rewrite"));
elements.polishButton.addEventListener("click", () => runWorkflowStage("polish"));
elements.copyButton.addEventListener("click", copyDraft);
elements.saveButton.addEventListener("click", saveToTracker);
[elements.draftOutput, elements.rewriteOutput, elements.finalOutput].forEach((input) => {
  input.addEventListener("input", () => {
    if (input === elements.draftOutput) {
      clearGraderEvaluation();
    }
    renderMetrics();
    renderWorkflow();
  });
});
elements.critiqueOutput.addEventListener("input", () => setWorkflowStage("critique"));
elements.resetVoiceButton.addEventListener("click", () => {
  state.voice = structuredClone(getSelectedProfile().voice);
  persistProfileWorkspace();
  renderVoice();
  trackEvent("profile_voice_reset", getAnalyticsContext({
    action: "reset_profile_voice"
  }));
  showToast("Profile voice reset.");
});
elements.resetStyleButton.addEventListener("click", () => {
  state.personalStyle = ensurePersonalStyleSamples(
    structuredClone(getSelectedProfile().personalStyle),
    state.selectedProfileId === DEFAULT_PROFILE_ID
  );
  persistProfileWorkspace();
  renderPersonalStyle();
  trackEvent("tone_samples_reset", getAnalyticsContext({
    action: "reset_tone_samples"
  }));
  showToast("Tone samples reset.");
});

renderAll();
trackEvent("app_loaded", getAnalyticsContext({
  action: "initial_load"
}));

if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    trackEvent("session_hidden", getAnalyticsContext({
      latencyMs: Date.now() - analyticsState.startedAt,
      action: "visibility_hidden"
    }));
  }
});
