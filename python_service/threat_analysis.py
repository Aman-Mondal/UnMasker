import re
import datetime
import requests
from urllib.parse import urlparse

# Reference list of frequently targeted brands and their official domains
TARGETED_BRANDS = {
    "netflix": ["netflix.com", "netflix.net"],
    "google": ["google.com", "google.co.in", "google.org", "google.net", "gstatic.com", "googleusercontent.com"],
    "microsoft": ["microsoft.com", "live.com", "office.com", "microsoftonline.com", "azure.com", "bing.com", "msn.com"],
    "apple": ["apple.com", "icloud.com"],
    "amazon": ["amazon.com", "amazon.in", "amazon.co.uk", "amazon.de", "aws.amazon.com", "amazonaws.com"],
    "paypal": ["paypal.com", "paypal.me"],
    "sbi": ["sbi.co.in", "statebankofindia.com", "onlinesbi.sbi"],
    "facebook": ["facebook.com", "meta.com", "instagram.com", "whatsapp.com"],
    "instagram": ["instagram.com"],
    "whatsapp": ["whatsapp.com"],
    "twitter": ["x.com", "twitter.com"],
    "flipkart": ["flipkart.com"],
    "hdfc": ["hdfcbank.com", "hdfc.com"],
    "icici": ["icicibank.com"],
    "chase": ["chase.com", "jpmorganchase.com"],
    "wellsfargo": ["wellsfargo.com"],
    "bankofamerica": ["bankofamerica.com", "bofa.com"],
    "binance": ["binance.com"],
    "coinbase": ["coinbase.com"],
    "paytm": ["paytm.com"],
    "spotify": ["spotify.com"]
}

# Deceptive affixes commonly appended to brand names in phishing URLs
DECEPTIVE_AFFIXES = [
    "gt", "app", "login", "secure", "support", "verify", "update",
    "portal", "auth", "web", "help", "online", "free", "bill", "service",
    "client", "account", "recovery", "check", "pay", "center", "card", "id",
    "alert", "manage", "connect", "mail"
]

SUSPICIOUS_KEYWORDS = [
    # Login & Authentication Phishing
    "login", "signin", "sign-in", "log-in", "verify", "verification",
    "secure", "security", "authenticate", "credential", "auth",
    # Account & Financial Data Harvesting
    "account", "update", "banking", "wallet", "recovery", "billing",
    "payment", "kyc", "pin", "otp", "passcode", "password", "unlock",
    # Fraud, Subsidy, Welfare, Lottery, and Crypto Lures
    "govt", "gov-", "scheme", "schemes", "apply", "subsidy", "grant",
    "refund", "claim", "prize", "lottery", "giveaway", "airdrop",
    "free-gift", "reward", "bonus", "winner"
]

URL_SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly", "ow.ly", "cutt.ly"
]

HIGH_ABUSE_TLDS = [
    "top", "xyz", "work", "click", "buzz", "club", "cam", "surf",
    "stream", "country", "gq", "cf", "ml", "tk", "ga", "icu"
]

MULTIPART_TLDS = {
    "co.uk", "co.in", "gov.in", "com.au", "co.nz", "org.uk", "ac.in", "net.in",
    "gov.uk", "com.br", "co.jp"
}

IPV4_REGEX = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")


def levenshtein_distance(s1, s2):
    if len(s1) > len(s2):
        s1, s2 = s2, s1
    distances = range(len(s1) + 1)
    for i2, c2 in enumerate(s2):
        distances_ = [i2 + 1]
        for i1, c1 in enumerate(s1):
            if c1 == c2:
                distances_.append(distances[i1])
            else:
                distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
        distances = distances_
    return distances[-1]


def normalize_visual_homoglyphs(text):
    t = text.lower()
    return (t.replace("ii", "l")
             .replace("1", "l")
             .replace("0", "o")
             .replace("rn", "m")
             .replace("vv", "w")
             .replace("cl", "d"))


def evaluate_brand_impersonation(domain):
    clean = domain.lower().split(":")[0].strip()
    parts = clean.split(".")

    # Handle multi-part TLDs (e.g. .co.uk, .co.in, .gov.in)
    is_multipart = any(clean.endswith("." + mtld) for mtld in MULTIPART_TLDS)
    if is_multipart:
        sld = parts[-3] if len(parts) >= 3 else parts[0]
        subdomains = parts[:-3] if len(parts) > 3 else []
    else:
        sld = parts[-2] if len(parts) >= 2 else parts[0]
        subdomains = parts[:-2] if len(parts) > 2 else []

    # Check genuine official domain whitelist
    for brand, officials in TARGETED_BRANDS.items():
        if any(clean == off or clean.endswith("." + off) for off in officials):
            return {"is_genuine": True, "brand": brand, "impersonated": False, "target": None}

    # Extract all candidate tokens from SLD and subdomains
    tokens = set()
    raw_segments = [sld] + subdomains
    for seg in raw_segments:
        tokens.add(seg)
        for sub in re.split(r'[-_]+', seg):
            if sub:
                tokens.add(sub)

    # Apply affix stripping to discover disguised brand stems (e.g. netfiixgt -> netfiix, appleid -> apple)
    stems = set(tokens)
    for tok in list(tokens):
        for affix in DECEPTIVE_AFFIXES:
            if tok.endswith(affix) and len(tok) > len(affix) + 2:
                stems.add(tok[:-len(affix)])
            if tok.startswith(affix) and len(tok) > len(affix) + 2:
                stems.add(tok[len(affix):])
    tokens = stems

    COMMON_DICTIONARY_FALSE_POSITIVES = {
        "apple": {"apply", "applet", "apples"},
        "chase": {"chaste", "chasm", "phase"},
        "meta": {"metal", "meta"},
        "target": {"tarot"}
    }

    detected = []
    for brand in TARGETED_BRANDS:
        brand_len = len(brand)
        for tok in tokens:
            norm_tok = normalize_visual_homoglyphs(tok)

            # Skip common dictionary false positives
            if tok in COMMON_DICTIONARY_FALSE_POSITIVES.get(brand, set()):
                continue

            # Exact token match or normalized homoglyph lookalike
            if tok == brand or norm_tok == brand:
                detected.append({"brand": brand, "type": "exact_token" if tok == brand else "visual_homoglyph", "confidence": "high"})
                break

            # Edit distance typosquatting on tokens of length >= 4
            if brand_len >= 4 and abs(len(tok) - brand_len) <= 2:
                dist = min(levenshtein_distance(tok, brand), levenshtein_distance(norm_tok, brand))
                if dist in (1, 2) and (dist / brand_len) <= 0.30:
                    detected.append({"brand": brand, "type": f"typosquat_dist_{dist}", "confidence": "high"})
                    break

    if detected:
        return {"is_genuine": False, "impersonated": True, "target": detected[0]["brand"].title(), "detections": detected}
    return {"is_genuine": False, "impersonated": False, "target": None}


def get_domain_age(domain, is_genuine_brand=False):
    if is_genuine_brand:
        return {"age_str": "Established Brand", "is_new": False, "days": 3650}
    try:
        clean = domain.split(":")[0].strip().lower()
        if clean.startswith("www."):
            clean = clean[4:]
        if clean in ("localhost", "127.0.0.1") or bool(IPV4_REGEX.match(clean)):
            return {"age_str": "N/A (IP Address)", "is_new": False, "days": None}

        # Query RDAP registry service with fast timeout
        r = requests.get(f"https://rdap.org/domain/{clean}", timeout=(1.2, 1.5))
        if r.status_code == 200:
            events = r.json().get("events", [])
            for e in events:
                if e.get("eventAction") == "registration":
                    reg_str = e.get("eventDate", "")[:10]
                    reg_dt = datetime.datetime.strptime(reg_str, "%Y-%m-%d").date()
                    days = (datetime.date.today() - reg_dt).days
                    if days < 30:
                        return {"age_str": f"{days} days", "is_new": True, "days": days}
                    elif days >= 365:
                        years = days // 365
                        return {"age_str": f"{years} year{'s' if years > 1 else ''}", "is_new": False, "days": days}
                    else:
                        months = max(1, days // 30)
                        return {"age_str": f"{months} month{'s' if months > 1 else ''}", "is_new": False, "days": days}
    except Exception:
        pass
    return {"age_str": "Active Domain", "is_new": False, "days": None}


def analyze_threats(url, domain, resolved_ip=None):
    findings = []
    reasons = []
    penalty = 0

    clean_domain = domain.lower()
    parsed = urlparse(url)
    path = (parsed.path + "?" + parsed.query).lower()
    parts = clean_domain.split(".")
    tld = parts[-1] if len(parts) > 1 else ""

    # 1. IP address check
    is_ip = bool(IPV4_REGEX.match(clean_domain))
    if is_ip:
        findings.append({
            "type": "critical",
            "title": "Raw IP Address Hostname",
            "description": f"URL connects directly to IP {clean_domain} without verified domain registration."
        })
        reasons.append(f"Direct IP used instead of domain: {clean_domain}")
        penalty += 40

    # 2. Brand Impersonation & Typosquatting
    brand_res = evaluate_brand_impersonation(clean_domain)
    if brand_res["impersonated"]:
        brand_name = brand_res["target"]
        findings.append({
            "type": "critical",
            "title": f"Suspected Brand Impersonation ({brand_name})",
            "description": f"Domain mimics well-known brand '{brand_name}'. Phishing campaigns frequently spoof trusted trademarks."
        })
        reasons.append(f"Domain mimics recognized brand: {brand_name}")
        penalty += 45
    elif brand_res["is_genuine"]:
        findings.append({
            "type": "safe",
            "title": f"Verified Brand Domain ({brand_res['brand'].title()})",
            "description": f"Domain matches official registration records for {brand_res['brand'].title()}."
        })

    # 3. Phishing Keywords
    found_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in clean_domain or kw in path]
    if found_keywords:
        kw_str = ", ".join(found_keywords[:3])
        is_risky = brand_res["impersonated"] or is_ip or (tld in HIGH_ABUSE_TLDS)
        findings.append({
            "type": "critical" if is_risky else "warning",
            "title": "Suspicious Login/Security Keywords",
            "description": f"URL contains keywords frequently associated with phishing forms: '{kw_str}'."
        })
        reasons.append(f"Suspicious URL keywords: \"{kw_str}\"")
        penalty += 20 if is_risky else 10

    # 4. Excessive Subdomains
    subdomains = len(parts) - 2 if len(parts) > 2 else 0
    if subdomains >= 3:
        findings.append({
            "type": "warning",
            "title": f"Excessive Subdomains ({subdomains} levels)",
            "description": "Deeply nested subdomains are often used to evade basic domain filters."
        })
        reasons.append(f"Excessive subdomains ({subdomains} levels)")
        penalty += 15

    # 5. URL Shorteners
    if any(clean_domain == s or clean_domain.endswith("." + s) for s in URL_SHORTENERS):
        findings.append({
            "type": "warning",
            "title": "URL Shortener Detected",
            "description": "Shortened links obscure the final destination from user inspection."
        })
        reasons.append("URL shortener obscures destination")
        penalty += 15

    # 6. High-Abuse TLDs
    if tld in HIGH_ABUSE_TLDS:
        findings.append({
            "type": "warning",
            "title": f"High-Risk TLD (.{tld})",
            "description": f"The '.{tld}' top-level domain has an elevated prevalence of spam and malicious domains."
        })
        reasons.append(f"High-abuse top-level domain: .{tld}")
        penalty += 15

    # 7. Punycode (IDN)
    if "xn--" in clean_domain:
        findings.append({
            "type": "critical",
            "title": "Punycode (IDN) Homograph Risk",
            "description": "Domain uses internationalized Punycode encoding, capable of visual character spoofing."
        })
        reasons.append("Punycode (xn--) encoding detected")
        penalty += 30

    # 8. Domain Age (RDAP Inspection)
    domain_age = get_domain_age(clean_domain, is_genuine_brand=brand_res.get("is_genuine", False))
    if domain_age["is_new"]:
        findings.append({
            "type": "critical",
            "title": f"Newly Registered Domain ({domain_age['age_str']})",
            "description": f"Domain was registered only {domain_age['age_str']} ago. Modern phishing campaigns frequently deploy newly registered domains to evade reputation systems."
        })
        reasons.append(f"Newly registered domain ({domain_age['age_str']} old)")
        penalty += 15

    penalty = min(60, penalty)

    return {
        "findings": findings,
        "reasons": reasons,
        "penalty": penalty,
        "is_suspicious": penalty >= 25,
        "brand_assessment": brand_res,
        "domain_age": domain_age["age_str"],
        "is_ip": is_ip
    }
