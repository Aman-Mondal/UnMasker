def calculate_trust_score(threat_res, cert_res, sec_res, intel_res, dns_resolved=True):
    base_score = 100

    threat_penalty = threat_res.get("penalty", 0)
    cert_penalty = cert_res.get("penalty", 0)
    sec_penalty = sec_res.get("penalty", 0)
    intel_penalty = intel_res.get("penalty", 0)

    # For verified genuine brand domains (e.g. Google, Apple, Microsoft, Netflix) with valid TLS,
    # do not penalize for optional minor security headers (ensure 100/100 score).
    is_genuine_brand = threat_res.get("brand_assessment", {}).get("is_genuine", False)
    if is_genuine_brand and cert_penalty == 0:
        sec_penalty = 0
    elif threat_penalty == 0 and cert_penalty == 0:
        sec_penalty = min(5, sec_penalty)

    total_deductions = threat_penalty + cert_penalty + sec_penalty + intel_penalty
    final_score = max(0, min(100, base_score - total_deductions))

    is_malicious = intel_penalty >= 30 or (threat_res.get("is_ip") and threat_penalty >= 40)
    is_impersonation = threat_res.get("brand_assessment", {}).get("impersonated", False)

    if is_malicious:
        risk_level = "Confirmed Malicious"
        badge_color = "danger"
        statement = "Confirmed threat or blacklist match detected. Interaction strongly discouraged."
    elif is_impersonation or final_score < 40:
        risk_level = "Suspicious"
        badge_color = "warning"
        statement = "Significant risk indicators observed, including possible brand typosquatting or deception."
    elif not dns_resolved and threat_penalty == 0 and final_score >= 60:
        risk_level = "Inconclusive"
        badge_color = "neutral"
        statement = "Domain does not actively resolve on public DNS; active threats cannot be verified."
    elif final_score >= 70:
        risk_level = "No Threat Detected"
        badge_color = "safe"
        statement = "No active deceptive patterns, brand spoofing, or known threats observed."
    else:
        risk_level = "Suspicious"
        badge_color = "warning"
        statement = "Multiple security weaknesses or structural warnings detected. Exercise caution."

    reasons = []
    for r in threat_res.get("reasons", []):
        if r not in reasons:
            reasons.append(r)
    if cert_res.get("error_message") and cert_res.get("error_message") not in reasons:
        reasons.append(f"SSL: {cert_res['error_message']}")
    if sec_res.get("status") in ("Missing", "Partially Configured"):
        sec_msg = f"Security headers are {sec_res['status'].lower()}"
        if sec_msg not in reasons:
            reasons.append(sec_msg)

    return {
        "score": final_score,
        "risk_level": risk_level,
        "badge_color": badge_color,
        "statement": statement,
        "reasons": reasons,
        "deductions": {
            "threat": threat_penalty,
            "certificate": cert_penalty,
            "security": sec_penalty,
            "intelligence": intel_penalty,
            "total": total_deductions
        }
    }
