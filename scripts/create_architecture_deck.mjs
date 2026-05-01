import { createRequire } from "module";
import fs from "fs";
import path from "path";

const require = createRequire(import.meta.url);
const pptxgen = require("pptxgenjs");
const { Canvas } = require("/Users/vivek.kumar.singh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/node_modules/skia-canvas");

const OUT_DIR = path.join(process.cwd(), "docs", "architecture");
const PPTX_PATH = path.join(OUT_DIR, "LinkedIn_Content_Studio_Technical_Architecture.pptx");
const W = 13.333;
const H = 7.5;
const PREVIEW_W = 1280;
const PREVIEW_H = 720;

const C = {
  bg: "F7F8FB",
  ink: "17211D",
  muted: "66726D",
  line: "D9DFD9",
  teal: "0F766E",
  tealSoft: "DFF3EF",
  indigo: "4F46E5",
  indigoSoft: "E7E7FF",
  amber: "B45309",
  amberSoft: "FFF0CC",
  white: "FFFFFF",
  slate: "26312D"
};

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "LinkedIn Content Studio";
pptx.company = "LinkedIn Content Studio";
pptx.subject = "Technical architecture and 1M-user roadmap";
pptx.title = "LinkedIn Content Studio Technical Architecture";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US"
};

fs.mkdirSync(OUT_DIR, { recursive: true });

function addTitle(slide, kicker, title, subtitle = "") {
  slide.addText(kicker.toUpperCase(), {
    x: 0.65, y: 0.42, w: 4.8, h: 0.22,
    margin: 0, color: C.teal, bold: true, fontSize: 8.5, breakLine: false, fit: "shrink"
  });
  slide.addText(title, {
    x: 0.65, y: 0.74, w: 10.8, h: 0.72,
    margin: 0, color: C.ink, bold: true, fontSize: 28, fit: "shrink"
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.67, y: 1.48, w: 9.6, h: 0.36,
      margin: 0, color: C.muted, fontSize: 12, fit: "shrink"
    });
  }
}

function box(slide, x, y, w, h, text, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill || C.white },
    line: { color: opts.line || C.line, width: opts.lineWidth || 1 }
  });
  slide.addText(text, {
    x: x + 0.14, y: y + 0.12, w: w - 0.28, h: h - 0.24,
    margin: 0, color: opts.color || C.ink, bold: opts.bold ?? true,
    fontSize: opts.fontSize || 11, fit: "shrink", valign: "mid"
  });
}

function pill(slide, x, y, w, text, color = C.teal, fill = C.tealSoft) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34, rectRadius: 0.16,
    fill: { color: fill },
    line: { color, width: 1 }
  });
  slide.addText(text, {
    x, y: y + 0.085, w, h: 0.12, margin: 0,
    align: "center", color, bold: true, fontSize: 7.5, fit: "shrink"
  });
}

function arrow(slide, x1, y1, x2, y2, color = C.teal) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width: 1.4, endArrowType: "triangle" }
  });
}

function sectionLabel(slide, text, x, y, color = C.muted) {
  slide.addText(text.toUpperCase(), {
    x, y, w: 2.4, h: 0.16, margin: 0,
    color, bold: true, fontSize: 7.2, fit: "shrink"
  });
}

function bullet(slide, text, x, y, w, color = C.ink) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x, y: y + 0.08, w: 0.08, h: 0.08,
    fill: { color: C.teal }, line: { color: C.teal }
  });
  slide.addText(text, {
    x: x + 0.18, y, w, h: 0.28,
    margin: 0, color, fontSize: 10.2, fit: "shrink"
  });
}

function addFooter(slide, n) {
  slide.addText(`LinkedIn Content Studio architecture | ${n}`, {
    x: 0.65, y: 7.08, w: 4.2, h: 0.18,
    margin: 0, color: "8A9691", fontSize: 7.2, fit: "shrink"
  });
}

function slideCover() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  s.addText("LINKEDIN CONTENT STUDIO", {
    x: 0.65, y: 0.56, w: 4.2, h: 0.22, margin: 0,
    color: C.teal, bold: true, fontSize: 8.5, fit: "shrink"
  });
  s.addText("Technical architecture to 1M users", {
    x: 0.64, y: 1.02, w: 8.9, h: 1.1, margin: 0,
    color: C.ink, bold: true, fontSize: 36, fit: "shrink"
  });
  s.addText("Current POC, commercial hardening path, and future-state platform architecture for a profile-aware AI writing product.", {
    x: 0.68, y: 2.32, w: 7.4, h: 0.58, margin: 0,
    color: C.muted, fontSize: 14, fit: "shrink"
  });
  const items = [
    ["POC", C.tealSoft, C.teal],
    ["Private beta", C.indigoSoft, C.indigo],
    ["Public beta", C.amberSoft, C.amber],
    ["SaaS scale", "E8F5F3", C.teal],
    ["1M users", "ECEBFF", C.indigo]
  ];
  items.forEach(([label, fill, color], i) => {
    const x = 0.85 + i * 2.28;
    pill(s, x, 5.66, 1.4, label, color, fill);
    if (i < items.length - 1) arrow(s, x + 1.42, 5.83, x + 2.06, 5.83, "9AA7A2");
  });
  s.addShape(pptx.ShapeType.arc, {
    x: 8.7, y: 0.75, w: 3.9, h: 3.9,
    line: { color: C.indigo, width: 2, transparency: 25 },
    adjustPoint: 0.25
  });
  s.addShape(pptx.ShapeType.arc, {
    x: 9.55, y: 1.6, w: 2.2, h: 2.2,
    line: { color: C.amber, width: 2, transparency: 30 },
    adjustPoint: 0.35
  });
  addFooter(s, 1);
}

function slideCurrent() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "Current system", "POC architecture: lean, useful, intentionally simple", "A single Node service handles static assets, Claude requests, fallback generation, and metadata-only analytics.");
  const nodes = [
    ["User browser / PWA", 0.8, 2.45, C.indigoSoft, C.indigo],
    ["Node HTTP server", 3.2, 2.45, C.white, C.teal],
    ["Claude API", 5.6, 2.0, C.tealSoft, C.teal],
    ["Local fallback engine", 5.6, 3.08, C.amberSoft, C.amber],
    ["JSONL analytics", 8.0, 2.45, C.white, C.indigo],
    ["Railway runtime", 10.4, 2.45, C.white, C.slate]
  ];
  nodes.forEach(([t, x, y, fill, line]) => box(s, x, y, 1.72, 0.72, t, { fill, line, fontSize: 10.4 }));
  arrow(s, 2.52, 2.81, 3.18, 2.81);
  arrow(s, 4.92, 2.64, 5.58, 2.34);
  arrow(s, 4.92, 2.98, 5.58, 3.42, C.amber);
  arrow(s, 7.32, 2.81, 7.98, 2.81, C.indigo);
  arrow(s, 9.72, 2.81, 10.38, 2.81, C.slate);
  sectionLabel(s, "Strengths", 0.88, 4.35, C.teal);
  bullet(s, "Fast to ship, easy to reason about, and low operational overhead.", 0.9, 4.78, 5.2);
  bullet(s, "Metadata-only observability avoids storing user ideas, samples, or generated posts.", 0.9, 5.22, 5.2);
  bullet(s, "Claude usage metadata now feeds token and dollar consumption metrics.", 0.9, 5.66, 5.2);
  sectionLabel(s, "Limits", 7.0, 4.35, C.amber);
  bullet(s, "No accounts, tenant model, durable workspace sync, quotas, or billing.", 7.02, 4.78, 5.0);
  bullet(s, "JSONL analytics and browser local storage are POC foundations, not SaaS foundations.", 7.02, 5.22, 5.0);
  bullet(s, "AI work is synchronous; scale needs queueing, retries, and model routing.", 7.02, 5.66, 5.0);
  addFooter(s, 2);
}

function slideFlow() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "Product flow", "The product loop is the architecture anchor", "The future stack should preserve the simple path users already understand.");
  const steps = ["Profile", "Topic", "Idea", "Draft", "Critique", "Rewrite", "Polish", "Copy / Save"];
  steps.forEach((step, i) => {
    const x = 0.64 + i * 1.55;
    const w = i === steps.length - 1 ? 1.42 : 1.18;
    box(s, x, 2.55, w, 0.68, step, { fill: i < 3 ? C.white : C.tealSoft, line: i < 3 ? C.line : C.teal, fontSize: 10.4 });
    if (i < steps.length - 1) arrow(s, x + w, 2.89, x + 1.45, 2.89);
  });
  sectionLabel(s, "Sidecars", 0.88, 5.25, C.indigo);
  box(s, 0.9, 5.6, 2.55, 0.66, "Analytics events", { fill: C.indigoSoft, line: C.indigo, fontSize: 11 });
  box(s, 3.78, 5.6, 2.55, 0.66, "Token + cost usage", { fill: C.amberSoft, line: C.amber, fontSize: 11 });
  box(s, 6.66, 5.6, 2.55, 0.66, "Privacy boundary", { fill: C.white, line: C.teal, fontSize: 11 });
  box(s, 9.54, 5.6, 2.55, 0.66, "Quality feedback", { fill: C.white, line: C.line, fontSize: 11 });
  addFooter(s, 3);
}

function slideTarget() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "Target architecture", "Commercial platform shape for scale", "Split the app into delivery, identity, core API, AI orchestration, data, events, and observability layers.");
  const rows = [
    [["PWA / Web", "CDN / Edge", "API Gateway"], 0.95, 2.0, C.indigoSoft, C.indigo],
    [["AuthN/AuthZ", "App API", "AI Orchestrator"], 0.95, 3.16, C.white, C.teal],
    [["Postgres", "Redis / Queue", "Object Storage"], 0.95, 4.32, C.tealSoft, C.teal],
    [["Event Collector", "Warehouse", "Logs / Metrics / Traces"], 0.95, 5.48, C.amberSoft, C.amber]
  ];
  rows.forEach(([labels, startX, y, fill, line]) => {
    labels.forEach((label, i) => {
      const x = startX + i * 3.95;
      box(s, x, y, 2.95, 0.68, label, { fill, line, fontSize: 11.4 });
      if (i < labels.length - 1) arrow(s, x + 2.95, y + 0.34, x + 3.72, y + 0.34, line);
    });
  });
  arrow(s, 2.42, 2.68, 2.42, 3.14, C.muted);
  arrow(s, 6.37, 3.84, 6.37, 4.3, C.muted);
  arrow(s, 10.32, 3.84, 10.32, 4.3, C.muted);
  arrow(s, 6.37, 5.0, 6.37, 5.46, C.muted);
  addFooter(s, 4);
}

function slideSecurity() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "Trust model", "Security, privacy, and governance become product features", "The commercial version needs explicit controls before team workflows, billing, and saved content scale.");
  const columns = [
    ["Identity", ["Managed auth provider", "RBAC for teams", "Session and device controls"]],
    ["Data", ["Postgres tenant boundaries", "Encrypted secrets", "Delete and export controls"]],
    ["AI", ["Prompt versioning", "Model gateway policy", "Rate limits and cost caps"]],
    ["Operations", ["Request IDs", "Audit logs", "SLOs and incident process"]]
  ];
  columns.forEach(([title, bullets], i) => {
    const x = 0.75 + i * 3.08;
    pill(s, x, 2.1, 1.35, title, [C.indigo, C.teal, C.amber, C.slate][i], [C.indigoSoft, C.tealSoft, C.amberSoft, "EEF2F7"][i]);
    bullets.forEach((b, j) => bullet(s, b, x + 0.04, 2.82 + j * 0.68, 2.46));
  });
  box(s, 0.9, 5.68, 11.45, 0.62, "Principle: analytics can measure behavior and cost without capturing user ideas, samples, generated posts, or final drafts.", { fill: C.white, line: C.teal, fontSize: 12 });
  addFooter(s, 5);
}

function slideMilestones() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "Scale roadmap", "Do not scale the POC; graduate it by milestone", "Each stage earns the right to add operational complexity.");
  const milestones = [
    ["POC", "50-200 users", "PWA, Node API, Claude, JSONL analytics"],
    ["Private beta", "1k-5k", "Auth, Postgres, saved workspace, rate limits"],
    ["Public beta", "10k-50k", "CDN, Redis queue, workers, event pipeline"],
    ["SaaS", "100k-250k", "Billing, teams, RBAC, quotas, model gateway"],
    ["1M-ready", "1M users", "Multi-region, warehouse, experiments, SLOs"]
  ];
  milestones.forEach(([name, scale, detail], i) => {
    const y = 1.92 + i * 0.92;
    pill(s, 0.82, y, 1.25, name, i % 2 ? C.indigo : C.teal, i % 2 ? C.indigoSoft : C.tealSoft);
    s.addText(scale, { x: 2.32, y: y + 0.05, w: 1.6, h: 0.2, margin: 0, color: C.ink, bold: true, fontSize: 12, fit: "shrink" });
    s.addText(detail, { x: 4.05, y: y + 0.05, w: 7.8, h: 0.28, margin: 0, color: C.muted, fontSize: 11, fit: "shrink" });
    if (i < milestones.length - 1) arrow(s, 1.45, y + 0.36, 1.45, y + 0.86, "9AA7A2");
  });
  addFooter(s, 6);
}

function slideDecisions() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "Decision queue", "The next architecture choices should follow traction", "The right stack depends on whether users return, personalize, save, and pay.");
  sectionLabel(s, "Decide now", 0.85, 2.05, C.teal);
  bullet(s, "Keep metadata-only analytics as a non-negotiable privacy constraint.", 0.9, 2.48, 5.1);
  bullet(s, "Protect the analytics dashboard with ANALYTICS_ADMIN_TOKEN before broader sharing.", 0.9, 2.92, 5.1);
  bullet(s, "Use GitHub + Railway until beta usage proves the need for more platform surface.", 0.9, 3.36, 5.1);
  sectionLabel(s, "Decide at beta", 7.0, 2.05, C.indigo);
  bullet(s, "Auth provider, database provider, event pipeline, and saved-content privacy model.", 7.05, 2.48, 4.8);
  bullet(s, "Framework migration path: Fastify/Express API first, Next.js or Remix when routing/auth/billing need it.", 7.05, 2.92, 4.8);
  bullet(s, "AI platform split: queue, workers, model gateway, prompt versioning, eval harness.", 7.05, 3.36, 4.8);
  box(s, 0.95, 5.5, 11.3, 0.72, "North star: completed publishable posts per active user per month. Architecture exists to make that metric reliable, private, and economically healthy.", { fill: C.white, line: C.amber, fontSize: 12 });
  addFooter(s, 7);
}

slideCover();
slideCurrent();
slideFlow();
slideTarget();
slideSecurity();
slideMilestones();
slideDecisions();

await pptx.writeFile({ fileName: PPTX_PATH });

const artifactTool = await import("/Users/vivek.kumar.singh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs");
const deckBlob = await artifactTool.FileBlob.load(PPTX_PATH);
const renderedDeck = await artifactTool.PresentationFile.importPptx(deckBlob);
const previewSlugs = ["01-cover", "02-current", "03-flow", "04-target", "05-trust", "06-roadmap", "07-decisions"];

for (let i = 0; i < renderedDeck.slides.items.length; i += 1) {
  const canvas = new Canvas(PREVIEW_W, PREVIEW_H);
  const ctx = canvas.getContext("2d");
  await artifactTool.drawSlideToCtx(renderedDeck.slides.items[i], renderedDeck, ctx);
  const file = path.join(OUT_DIR, `architecture-preview-${previewSlugs[i]}.png`);
  fs.writeFileSync(file, await canvas.toBuffer("png"));
}

console.log(PPTX_PATH);
