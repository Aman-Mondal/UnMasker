import requests
import json
import time

test_cases = [
    # ---------------------------
    # Genuine Real URLs
    # ---------------------------
    {"url": "https://www.google.com", "expected_type": "genuine", "notes": "Official Google Search & Services (Verified Brand)"},
    {"url": "https://github.com", "expected_type": "genuine", "notes": "Official developer platform"},
    {"url": "https://en.wikipedia.org", "expected_type": "genuine", "notes": "Wikimedia foundation (modern Let's Encrypt TLS)"},
    {"url": "https://www.apple.com", "expected_type": "genuine", "notes": "Official Apple portal"},
    {"url": "https://www.amazon.com", "expected_type": "genuine", "notes": "Official Amazon retail"},
    {"url": "https://www.cloudflare.com", "expected_type": "genuine", "notes": "Enterprise CDN / Security"},
    {"url": "https://stackoverflow.com", "expected_type": "genuine", "notes": "Developer Q&A community"},
    {"url": "https://www.paypal.com", "expected_type": "genuine", "notes": "Official PayPal payment platform"},
    {"url": "https://transbiotech.com", "expected_type": "genuine", "notes": "Valid company (must NOT false-positive as SBI)"},
    {"url": "https://www.chase.com", "expected_type": "genuine", "notes": "Official JPMorgan Chase Banking"},

    # ---------------------------
    # Real Scam / Fraud / Phishing Patterns
    # ---------------------------
    {"url": "https://netfiixgt.com/", "expected_type": "fraud", "notes": "Netflix typosquatting credential harvester"},
    {"url": "https://sbi-secure-login.com", "expected_type": "fraud", "notes": "SBI banking phishing portal"},
    {"url": "https://amaz0n-support.net", "expected_type": "fraud", "notes": "Amazon homoglyph support scam"},
    {"url": "https://paypa1-verification.com", "expected_type": "fraud", "notes": "PayPal homoglyph credential harvesting"},
    {"url": "https://flipkart-offers-login.in", "expected_type": "fraud", "notes": "Fake e-commerce festival scam"},
    {"url": "https://govt-schemes-apply.com", "expected_type": "fraud", "notes": "Deceptive welfare/subsidy fraud lure"},
    {"url": "http://account-update-security-login.top/", "expected_type": "fraud", "notes": "High abuse TLD + multi phishing keywords"},
    {"url": "https://bit.ly/3xFakeLogin", "expected_type": "fraud", "notes": "URL shortener masking malicious target"},
    {"url": "https://netflix-verify-account.com", "expected_type": "fraud", "notes": "Netflix credential phishing lure"},
    {"url": "https://appleid-manage-security.com", "expected_type": "fraud", "notes": "Apple ID phishing harvesting"},
    {"url": "http://185.220.101.5/bank/login", "expected_type": "fraud", "notes": "Raw IP banking credential harvest"}
]

print("=" * 85)
print("   UNMASKER VERIFICATION: REAL GENUINE & FRAUD / SCAM URL BENCHMARK")
print("=" * 85)

passed_count = 0
failed_count = 0

for tc in test_cases:
    url = tc["url"]
    expected = tc["expected_type"]
    t0 = time.time()
    try:
        r = requests.post("http://127.0.0.1:5001/analyze", json={"url": url}, timeout=25)
        elapsed = round(time.time() - t0, 2)
        if r.status_code == 200:
            d = r.json()
            score = d.get("trust_score")
            risk = d.get("risk_level")
            brand = d.get("threat_analysis", {}).get("brand_assessment", {})
            reasons = d.get("reasons", [])

            is_correct = False
            if expected == "genuine":
                is_correct = (risk == "No Threat Detected" and score >= 70 and not brand.get("impersonated"))
            elif expected == "fraud":
                is_correct = (risk in ("Suspicious", "Confirmed Malicious") and score <= 70)

            verdict_tag = "PASS" if is_correct else "FAIL"
            if is_correct:
                passed_count += 1
            else:
                failed_count += 1

            print(f"[{verdict_tag:4}] [{expected.upper():7}] {url:40} | Score: {score:3}/100 | {risk:20} | {elapsed}s")
            if brand.get("impersonated"):
                print(f"       -> Brand Spoofed: {brand.get('target')}")
            if reasons:
                print(f"       -> Key Indicators: {', '.join(reasons[:2])}")
        else:
            failed_count += 1
            print(f"[FAIL] [{expected.upper():7}] {url:40} | HTTP {r.status_code} Error | {elapsed}s")
    except Exception as e:
        failed_count += 1
        elapsed = round(time.time() - t0, 2)
        print(f"[FAIL] [{expected.upper():7}] {url:40} | EXCEPTION: {e} | {elapsed}s")

print("=" * 85)
print(f"SUMMARY: {passed_count} PASSED, {failed_count} FAILED out of {len(test_cases)} test cases.")
print("=" * 85)
