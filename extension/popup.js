const API_ENDPOINT = "http://127.0.0.1:5000/api/scan";

document.addEventListener("DOMContentLoaded", async () => {
  const targetUrlText = document.getElementById("targetUrlText");
  const loadingState = document.getElementById("loadingState");
  const resultsState = document.getElementById("resultsState");
  const errorState = document.getElementById("errorState");
  const errorMsg = document.getElementById("errorMsg");
  const rescanBtn = document.getElementById("rescanBtn");
  const retryBtn = document.getElementById("retryBtn");

  async function inspectActiveTab() {
    loadingState.classList.remove("hidden");
    resultsState.classList.add("hidden");
    errorState.classList.add("hidden");

    let currentUrl = "https://sbi-secure-login.com";

    // Attempt to query chrome.tabs if running inside actual extension context
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs && tabs[0] && tabs[0].url) {
          const u = tabs[0].url;
          if (u.startsWith("http://") || u.startsWith("https://")) {
            currentUrl = u;
          }
        }
      } catch (err) {
        console.warn("Could not query active tab:", err);
      }
    }

    targetUrlText.innerText = currentUrl;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUrl })
      });

      const resJson = await response.json();
      if (!resJson.success) {
        throw new Error(resJson.error || "Inspection failed.");
      }

      renderScanResults(resJson.data, resJson.scan_id);
    } catch (err) {
      loadingState.classList.add("hidden");
      errorState.classList.remove("hidden");
      errorMsg.innerText = err.message || "Failed to reach UnMasker engine on port 5000.";
    }
  }

  function renderScanResults(data, scanId) {
    loadingState.classList.add("hidden");
    resultsState.classList.remove("hidden");

    const score = data.trust_score;
    const scoreVal = document.getElementById("scoreVal");
    const riskBadge = document.getElementById("riskBadge");
    const scoreDesc = document.getElementById("scoreDesc");
    const scoreBanner = document.getElementById("scoreBanner");

    scoreVal.innerText = score;
    riskBadge.innerText = data.risk_level;
    scoreDesc.innerText = data.summary_statement;

    if (score >= 80) {
      riskBadge.className = "badge badge-safe";
      scoreVal.style.color = "#15803d";
    } else if (score >= 60) {
      riskBadge.className = "badge badge-warning";
      scoreVal.style.color = "#b45309";
    } else {
      riskBadge.className = "badge badge-danger";
      scoreVal.style.color = "#b91c1c";
    }

    const qd = data.quick_details || {};
    document.getElementById("mSsl").innerText = qd.ssl_status || "N/A";
    document.getElementById("mAge").innerText = qd.domain_age || "N/A";
    document.getElementById("mHeaders").innerText = qd.security_headers_status || "N/A";
    document.getElementById("mReports").innerText = `${qd.community_reports_count || 0} reports`;

    const reasonsList = document.getElementById("reasonsList");
    reasonsList.innerHTML = "";
    const reasons = data.combined_reasons || [];
    if (reasons.length > 0) {
      reasons.slice(0, 4).forEach(r => {
        const li = document.createElement("li");
        const icon = r.type === "critical" ? "✕" : "!";
        const color = r.type === "critical" ? "#dc2626" : "#d97706";
        li.innerHTML = `<span style="color:${color}; font-weight:bold;">${icon}</span> <span>${r.text}</span>`;
        reasonsList.appendChild(li);
      });
    } else {
      reasonsList.innerHTML = `<li style="color:#15803d;">✓ No threat heuristics detected</li>`;
    }

    const viewFullBtn = document.getElementById("viewFullReportBtn");
    viewFullBtn.href = `http://127.0.0.1:5000/results/${scanId}`;
  }

  rescanBtn.addEventListener("click", inspectActiveTab);
  retryBtn.addEventListener("click", inspectActiveTab);

  inspectActiveTab();
});
