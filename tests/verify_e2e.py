import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_frontend_serving():
    print("[1] Testing React Frontend Serving at / ...")
    r = requests.get(f"{BASE_URL}/")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert "UnMasker" in r.text, "UnMasker not found in index.html"
    print("    -> React Frontend served successfully with UnMasker branding!")

def test_auth_and_stats():
    print("\n[2] Testing Authentication & Brave-Style Protection Stats...")
    import time
    user_email = f"researcher_{int(time.time())}@unmasker.org"
    reg_payload = {
        "name": "Security Researcher",
        "email": user_email,
        "password": "SecurePassword123!"
    }
    r = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
    assert r.status_code == 201, f"Register failed: {r.text}"
    data = r.json()
    token = data["token"]
    user = data["user"]
    print(f"    -> User registered: {user['name']} ({user['email']})")

    # Fetch initial stats
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/api/stats", headers=headers)
    assert r.status_code == 200, f"Get stats failed: {r.text}"
    data = r.json()
    stats = data.get("stats", data)
    print(f"    -> Initial Stats: Analyzed={stats['totalAnalyzed']}, Potential={stats['potentialThreats']}, Confirmed={stats['confirmedMalicious']}, Blocked={stats['threatsBlocked']}")
    assert stats["totalAnalyzed"] == 0
    return token

def test_url_scans(token):
    print("\n[3] Testing URL Scans on Mandatory Targets via MERN -> Python Service...")
    headers = {"Authorization": f"Bearer {token}"}

    test_cases = [
        {"url": "https://www.netflix.com/", "expected_verdict": "No Threat Detected", "typosquat": False},
        {"url": "https://netfiixgt.com/", "expected_verdict": "Suspicious", "typosquat": True},
        {"url": "https://www.google.com/", "expected_verdict": "No Threat Detected", "typosquat": False},
        {"url": "https://www.microsoft.com/", "expected_verdict": "No Threat Detected", "typosquat": False},
    ]

    for tc in test_cases:
        url = tc["url"]
        r = requests.post(f"{BASE_URL}/api/scan", json={"url": url}, headers=headers)
        assert r.status_code == 200, f"Scan failed for {url}: {r.text}"
        res = r.json()
        score = res["trust_score"]
        verdict = res["verdict"]
        threat = res["threat_analysis"]
        brand_info = threat.get("brand_assessment") or {}
        is_impersonated = brand_info.get("impersonated", False)
        target_brand = brand_info.get("target") or brand_info.get("target_brand")

        print(f"    URL: {url}")
        print(f"      Score: {score}/100 | Verdict: {verdict}")
        print(f"      Brand Impersonation Detected: {is_impersonated} (Target: {target_brand})")
        
        if tc["typosquat"]:
            assert verdict in ["Suspicious", "Confirmed Malicious"], f"Expected Suspicious/Confirmed Malicious for {url}, got {verdict}"
            assert is_impersonated == True, f"Expected brand impersonation for {url}"
            assert target_brand == "Netflix"
            assert score < 70, f"Score for {url} should be penalized, got {score}"
            print("      [PASSED] netfiixgt.com correctly penalized as Suspicious impersonator!")
        else:
            assert verdict == "No Threat Detected", f"Expected No Threat Detected for {url}, got {verdict}"
            assert is_impersonated == False, f"Unexpected impersonation flag for {url}"
            assert score >= 80, f"Score should be high for {url}, got {score}"
            print(f"      [PASSED] Genuine domain {url} verified clean!")

def test_telemetry_and_blocking(token):
    print("\n[4] Testing Updated Telemetry and Threats Blocked...")
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/api/stats", headers=headers)
    assert r.status_code == 200
    data = r.json()
    stats = data.get("stats", data)
    print(f"    -> Updated Stats after 4 scans:")
    print(f"       Websites Analyzed: {stats['totalAnalyzed']}")
    print(f"       Potential Threats: {stats['potentialThreats']}")
    print(f"       Confirmed Malicious: {stats['confirmedMalicious']}")
    print(f"       Threats Blocked: {stats['threatsBlocked']}")
    
    assert stats["totalAnalyzed"] == 4, f"Expected 4 analyzed, got {stats['totalAnalyzed']}"
    assert stats["potentialThreats"] >= 1, f"Expected at least 1 potential threat, got {stats['potentialThreats']}"

    # Now test an active block prevention action
    print("    -> Recording an active user block / prevention action...")
    r = requests.post(f"{BASE_URL}/api/scan/record-block", json={"url": "https://netfiixgt.com/"}, headers=headers)
    assert r.status_code == 200, f"Record block failed: {r.text}"
    
    r = requests.get(f"{BASE_URL}/api/stats", headers=headers)
    data = r.json()
    new_stats = data.get("stats", data)
    print(f"       Threats Blocked after prevention action: {new_stats['threatsBlocked']}")
    assert new_stats["threatsBlocked"] == 1, f"Expected 1 blocked threat, got {new_stats['threatsBlocked']}"
    print("    [PASSED] Brave-style telemetry updated dynamically and accurately!")

def test_community_threat_intelligence(token):
    print("\n[5] Testing Collaborative Threat Intelligence...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Submit a new community report
    report_data = {
        "url": "https://netfiixgt.com/",
        "category": "Brand Impersonation",
        "description": "Fake Netflix login credential harvester targeting users with phishing emails.",
        "risk_level": "High"
    }
    r = requests.post(f"{BASE_URL}/api/reports", json=report_data, headers=headers)
    assert r.status_code == 201, f"Post report failed: {r.text}"
    created = r.json()
    rep_obj = created.get("report", created)
    print(f"    -> Submitted Community Report for {rep_obj.get('domain')} (ID: {rep_obj.get('id')})")

    # Fetch all reports
    r = requests.get(f"{BASE_URL}/api/reports")
    assert r.status_code == 200
    res = r.json()
    reports = res.get("reports", res)
    assert len(reports) >= 1
    found = any(rep.get("domain") == "netfiixgt.com" for rep in reports)
    assert found, "Created report not returned in community feed"
    print(f"    -> Fetched {len(reports)} community reports. Newly submitted report present!")

    # Scan the domain again and ensure community intelligence shows the report
    r = requests.post(f"{BASE_URL}/api/scan", json={"url": "https://netfiixgt.com/"}, headers=headers)
    scan_res = r.json()
    comm_reports = scan_res.get("community_reports", [])
    count = scan_res.get("community_reports_count", len(comm_reports))
    print(f"    -> Re-scan of netfiixgt.com community reports count: {count}")
    assert count >= 1
    print("    [PASSED] Collaborative Threat Intelligence successfully retrieved and integrated!")

if __name__ == "__main__":
    print("==================================================")
    print("   UNMASKER FULL END-TO-END INTEGRATION TEST")
    print("==================================================")
    test_frontend_serving()
    token = test_auth_and_stats()
    test_url_scans(token)
    test_telemetry_and_blocking(token)
    test_community_threat_intelligence(token)
    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")
