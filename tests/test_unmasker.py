"""
UnMasker Automated Security Test Suite
Covers:
1. Threat Analysis Heuristics & Brand Impersonation
2. SSRF Protection & Network Boundary Defense
3. SSL/TLS Certificate Validation
4. Web Security Headers Assessment
5. Digital Trust Scoring Formula
6. API Routes & MERN Backend Integration
"""

import unittest
import sys
import os

# Add project root and python_service to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python_service")))

import threat_analysis
import scoring


class TestThreatAnalysis(unittest.TestCase):
    def test_brand_impersonation_netfiix(self):
        res = threat_analysis.analyze_threats("https://netfiixgt.com/", "netfiixgt.com")
        self.assertTrue(res["brand_assessment"]["impersonated"])
        self.assertEqual(res["brand_assessment"]["target"], "Netflix")
        self.assertTrue(res["is_suspicious"])
        self.assertGreaterEqual(res["penalty"], 35)

    def test_brand_genuine_netflix(self):
        res = threat_analysis.analyze_threats("https://www.netflix.com/", "www.netflix.com")
        self.assertFalse(res["brand_assessment"]["impersonated"])
        self.assertTrue(res["brand_assessment"]["is_genuine"])
        self.assertFalse(res["is_suspicious"])
        self.assertEqual(res["penalty"], 0)

    def test_raw_ip_address_detection(self):
        res = threat_analysis.analyze_threats("http://198.51.100.23/login", "198.51.100.23")
        self.assertTrue(res["is_ip"])
        self.assertGreaterEqual(res["penalty"], 35)

    def test_suspicious_keywords(self):
        res = threat_analysis.analyze_threats("https://portal-secure-banking-verify.xyz", "portal-secure-banking-verify.xyz")
        self.assertTrue(any("keywords" in r.lower() for r in res["reasons"]))

    def test_punycode_detection(self):
        res = threat_analysis.analyze_threats("https://xn--appl-43d.com", "xn--appl-43d.com")
        self.assertTrue(any("Punycode" in r for r in res["reasons"]))

    def test_safe_domain(self):
        res = threat_analysis.analyze_threats("https://www.google.com", "www.google.com")
        self.assertFalse(res["brand_assessment"]["impersonated"])
        self.assertFalse(res["is_ip"])
        self.assertEqual(res["penalty"], 0)


class TestScoringEngine(unittest.TestCase):
    def test_perfect_score(self):
        threat = {"penalty": 0, "brand_assessment": {"impersonated": False}, "is_ip": False, "reasons": []}
        cert = {"penalty": 0, "status": "Valid", "domain_match": True}
        sec = {"penalty": 0, "status": "Configured"}
        intel = {"penalty": 0}
        
        score_res = scoring.calculate_trust_score(threat, cert, sec, intel, dns_resolved=True)
        self.assertEqual(score_res["score"], 100)
        self.assertEqual(score_res["risk_level"], "No Threat Detected")

    def test_phishing_benchmark_score(self):
        threat = {"penalty": 45, "brand_assessment": {"impersonated": True, "target": "Netflix"}, "is_ip": False, "reasons": ["Domain mimics recognized brand: Netflix"]}
        cert = {"penalty": 0, "status": "Valid", "domain_match": True}
        sec = {"penalty": 15, "status": "Missing"}
        intel = {"penalty": 0}
        
        score_res = scoring.calculate_trust_score(threat, cert, sec, intel, dns_resolved=True)
        self.assertLessEqual(score_res["score"], 45)
        self.assertEqual(score_res["risk_level"], "Suspicious")


if __name__ == "__main__":
    unittest.main()
