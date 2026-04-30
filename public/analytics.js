const elements = {
  generatedAt: document.querySelector("#analyticsGeneratedAt"),
  northStarGrid: document.querySelector("#northStarGrid"),
  funnelList: document.querySelector("#funnelList"),
  costGrid: document.querySelector("#costGrid"),
  reliabilityGrid: document.querySelector("#reliabilityGrid"),
  topProfiles: document.querySelector("#topProfiles"),
  topTopics: document.querySelector("#topTopics"),
  styleModes: document.querySelector("#styleModes"),
  viralityModes: document.querySelector("#viralityModes"),
  refreshButton: document.querySelector("#refreshAnalyticsButton")
};

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatMoney(value) {
  const amount = Number(value || 0);
  if (amount > 0 && amount < 0.01) {
    return `$${amount.toFixed(4)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatDuration(ms) {
  if (!ms) {
    return "0 ms";
  }
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  return `${(ms / 1000).toFixed(1)} s`;
}

function card(label, value, note = "") {
  return `
    <article class="analytics-card">
      <span>${label}</span>
      <strong>${value}</strong>
      ${note ? `<p>${note}</p>` : ""}
    </article>
  `;
}

function renderRankList(target, rows, emptyText) {
  if (!rows?.length) {
    target.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return;
  }

  target.innerHTML = rows
    .map((row) => `
      <div class="rank-item">
        <span>${escapeHtml(row.value)}</span>
        <strong>${formatNumber(row.count)}</strong>
      </div>
    `)
    .join("");
}

function renderFunnel(funnel) {
  const rows = [
    ["App loaded", funnel.appLoaded],
    ["Profile selected", funnel.profileSelected],
    ["Draft requested", funnel.draftRequested],
    ["Draft generated", funnel.draftGenerated],
    ["Critique completed", funnel.critiqueCompleted],
    ["Rewrite completed", funnel.rewriteCompleted],
    ["Final polish completed", funnel.polishCompleted],
    ["Copied", funnel.copied],
    ["Saved", funnel.saved]
  ];

  elements.funnelList.innerHTML = rows
    .map(([label, value]) => `
      <div class="funnel-row">
        <span>${label}</span>
        <strong>${formatNumber(value)}</strong>
      </div>
    `)
    .join("");
}

function renderDashboard(summary) {
  const windowData = summary.windows.last7d;
  const allTime = summary.windows.allTime;
  const generatedAt = new Date(summary.generatedAt).toLocaleString();
  elements.generatedAt.textContent = `Last updated ${generatedAt}. Tracking metadata only; post text and samples are not stored.`;

  elements.northStarGrid.innerHTML = [
    card("DAU", formatNumber(summary.activeUsers.dau), "Active users, last 24 hours"),
    card("MAU", formatNumber(summary.activeUsers.mau), "Active users, last 30 days"),
    card("TAU", formatNumber(summary.activeUsers.tau), "Total active users captured"),
    card("Total posts generated", formatNumber(allTime.posts.totalGenerated), "All profiles"),
    card("Posts generated", formatNumber(windowData.posts.totalGenerated), "Last 7 days"),
    card("Copy or save rate", formatPercent(windowData.conversion.copyOrSavePerDraft), "Strong utility signal"),
    card("Final polish rate", formatPercent(windowData.conversion.polishPerDraft), "Polished / drafts"),
    card("Activation", formatPercent(windowData.conversion.draftPerVisit), "Drafts / visits")
  ].join("");

  renderFunnel(windowData.funnel);

  elements.costGrid.innerHTML = [
    card("Tokens / post", formatNumber(allTime.aiUsage.averageTokensPerPost), "Avg draft generation"),
    card("Dollar value / post", formatMoney(allTime.aiUsage.averageCostPerPostUsd), "Avg draft generation"),
    card("Generation tokens", formatNumber(allTime.aiUsage.generationTotalTokens), "Drafts only"),
    card("Generation cost", formatMoney(allTime.aiUsage.generationCostUsd), "Drafts only"),
    card("Total tokens consumed", formatNumber(allTime.aiUsage.totalTokens), "Draft + workflow"),
    card("Total consumption", formatMoney(allTime.aiUsage.totalConsumptionUsd), "Draft + workflow")
  ].join("");

  elements.reliabilityGrid.innerHTML = [
    card("Generation failure rate", formatPercent(windowData.generation.failureRate), "Client-visible failures"),
    card("Claude drafts", formatNumber(windowData.generation.claude), "Provider mix"),
    card("Local fallback drafts", formatNumber(windowData.generation.local), "Fallback reliance"),
    card("Client latency", formatDuration(windowData.generation.averageClientLatencyMs), "Draft request round trip"),
    card("Server latency", formatDuration(windowData.generation.averageServerLatencyMs), "Claude/fallback endpoint"),
    card("Returning user rate", formatPercent(windowData.returningUserRate), "Repeat usage signal")
  ].join("");

  renderRankList(elements.topProfiles, allTime.postsByProfile, "No generated posts yet.");
  renderRankList(elements.topTopics, windowData.topTopics, "No topic events yet.");
  renderRankList(elements.styleModes, windowData.styleModes, "No style mode events yet.");
  renderRankList(elements.viralityModes, windowData.viralityModes, "No virality events yet.");
}

async function loadAnalytics() {
  elements.generatedAt.textContent = "Loading analytics...";
  try {
    const token = new URLSearchParams(window.location.search).get("token");
    const summaryUrl = token
      ? `/api/analytics/summary?token=${encodeURIComponent(token)}`
      : "/api/analytics/summary";
    const response = await fetch(summaryUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(response.status === 401 ? "Analytics token required." : "Analytics request failed.");
    }
    renderDashboard(await response.json());
  } catch (error) {
    elements.generatedAt.textContent = error.message;
    elements.northStarGrid.innerHTML = "";
    elements.funnelList.innerHTML = "";
    elements.costGrid.innerHTML = "";
    elements.reliabilityGrid.innerHTML = "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

elements.refreshButton.addEventListener("click", loadAnalytics);
loadAnalytics();
