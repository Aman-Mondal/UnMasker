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
      if (!resJson.success && resJson.error) {
        throw new Error(resJson.error || "Inspection failed.");
      }

      renderScanResults(resJson.data || resJson, resJson.scan_id || "latest");
    } catch (err) {
      loadingState.classList.add("hidden");
      errorState.classList.remove("hidden");
      errorMsg.innerText = err.message || "Failed to reach UnMasker engine on port 5000.";
    }
  }

  function renderScanResults(data, scanId) {
    loadingState.classList.add("hidden");
    resultsState.classList.remove("hidden");

    const score = data.trust_score ?? 100;
    const scoreVal = document.getElementById("scoreVal");
    const riskBadge = document.getElementById("riskBadge");
    const scoreDesc = document.getElementById("scoreDesc");

    scoreVal.innerText = score;
    riskBadge.innerText = data.risk_level || (score >= 80 ? "No Threat Detected" : score >= 60 ? "Suspicious" : "High Risk");
    scoreDesc.innerText = data.statement || data.summary_statement || "Real-time threat evaluation complete.";

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

    const sslStatus = data.certificate_info?.status || data.quick_details?.ssl_status || "Valid";
    const domainAge = data.threat_analysis?.domain_age || data.quick_details?.domain_age || "Active";
    const secHeaders = data.security_assessment?.status || data.quick_details?.security_headers_status || "Configured";
    const repCount = data.community_reports_count ?? data.quick_details?.community_reports_count ?? 0;

    document.getElementById("mSsl").innerText = sslStatus;
    document.getElementById("mAge").innerText = domainAge;
    document.getElementById("mHeaders").innerText = secHeaders;
    document.getElementById("mReports").innerText = `${repCount} reports`;

    const reasonsList = document.getElementById("reasonsList");
    reasonsList.innerHTML = "";
    const rawReasons = data.reasons || data.combined_reasons || [];
    if (rawReasons.length > 0) {
      rawReasons.slice(0, 4).forEach(r => {
        const text = typeof r === "string" ? r : r.text;
        const isCritical = typeof r === "object" && r.type === "critical";
        const li = document.createElement("li");
        const icon = isCritical ? "✕" : "!";
        const color = isCritical ? "#dc2626" : "#d97706";
        li.innerHTML = `<span style="color:${color}; font-weight:bold;">${icon}</span> <span>${text}</span>`;
        reasonsList.appendChild(li);
      });
    } else {
      reasonsList.innerHTML = `<li style="color:#15803d;">✓ No threat heuristics detected</li>`;
    }

    const viewFullBtn = document.getElementById("viewFullReportBtn");
    viewFullBtn.href = `http://127.0.0.1:5000/`;
  }

  rescanBtn.addEventListener("click", inspectActiveTab);
  retryBtn.addEventListener("click", inspectActiveTab);

  inspectActiveTab();
});
