import requests
import config


def query_google_safe_browsing(target_url):
    api_key = config.GOOGLE_SAFE_BROWSING_API_KEY
    if not api_key:
        return {
            "configured": False,
            "detected": False,
            "status": "Inconclusive (Not Configured)",
            "message": "External Google Safe Browsing API key not set in environment."
        }

    try:
        endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
        payload = {
            "client": {"clientId": "unmasker-scanner", "clientVersion": "2.0"},
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": target_url}]
            }
        }
        res = requests.post(endpoint, json=payload, timeout=4)
        if res.status_code == 200:
            matches = res.json().get("matches", [])
            detected = len(matches) > 0
            threats = [m.get("threatType") for m in matches]
            return {
                "configured": True,
                "detected": detected,
                "status": "Confirmed Malicious" if detected else "No Threat Detected",
                "message": f"Threat flagged by Google: {', '.join(threats)}" if detected else "Clean in Google Safe Browsing index."
            }
        return {"configured": True, "detected": False, "status": "Inconclusive", "message": f"API HTTP {res.status_code}"}
    except Exception as e:
        return {"configured": True, "detected": False, "status": "Inconclusive", "message": f"Query error: {str(e)}"}


def query_virustotal(domain):
    api_key = config.VIRUSTOTAL_API_KEY
    if not api_key:
        return {
            "configured": False,
            "detected": False,
            "status": "Inconclusive (Not Configured)",
            "message": "External VirusTotal API key not set in environment."
        }

    try:
        url = f"https://www.virustotal.com/api/v3/domains/{domain}"
        res = requests.get(url, headers={"x-apikey": api_key}, timeout=4)
        if res.status_code == 200:
            stats = res.json().get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            flagged = (malicious + suspicious) > 0
            return {
                "configured": True,
                "detected": flagged,
                "status": "Confirmed Malicious" if malicious >= 2 else ("Suspicious" if flagged else "No Threat Detected"),
                "message": f"{malicious} vendor(s) flagged this domain as malicious." if flagged else "Clean across security vendor engines."
            }
        return {"configured": True, "detected": False, "status": "Inconclusive", "message": f"API HTTP {res.status_code}"}
    except Exception as e:
        return {"configured": True, "detected": False, "status": "Inconclusive", "message": f"Query error: {str(e)}"}


def check_external_intelligence(url, domain):
    gsb = query_google_safe_browsing(url)
    vt = query_virustotal(domain)

    penalty = 0
    if gsb.get("detected"): penalty += 40
    if vt.get("detected"): penalty += 40

    findings = []
    if gsb.get("detected"):
        findings.append({
            "type": "critical",
            "title": "Google Safe Browsing Blacklist Match",
            "description": gsb.get("message")
        })
    if vt.get("detected"):
        findings.append({
            "type": "critical",
            "title": "VirusTotal Multi-Engine Threat Flag",
            "description": vt.get("message")
        })

    return {
        "google_safe_browsing": gsb,
        "virustotal": vt,
        "penalty": min(40, penalty),
        "findings": findings
    }
