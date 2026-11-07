# UnMasker – AI-Powered Digital Trust & Web Threat Intelligence Platform

> **Tagline:** *See Beyond the Surface.*

UnMasker is an independent, intelligent website security analysis platform that evaluates the trustworthiness and threat risk of any submitted URL by unifying four security mechanisms across a decoupled MERN + Python architecture:

1. **Threat Detection & Brand Impersonation** – Deep heuristic inspection, visual homoglyph lookalikes (e.g., detecting `netfiixgt.com` targeting Netflix), raw IP detection, and phishing keyword flags.
2. **TLS/SSL Certificate Analysis** – Native socket inspection on port 443 verifying expiration dates, certificate authorities, domain matching, and protocol versions.
3. **Web Security Assessment** – Non-intrusive HTTP header audit (HSTS, CSP, X-Frame-Options, nosniff, Referrer, Permissions) and cookie security flag analysis.
4. **Collaborative Threat Intelligence** – Persistent community fraud reports stored in MongoDB integrated with external threat intelligence feeds.

---

## 🏗️ System Architecture

UnMasker separates backend responsibilities into two independent, scalable services:

```
                  +----------------------------------+
                  |         UnMasker Client          |
                  |     React.js + Lucide Icons      |
                  +-----------------+----------------+
                                    |
                            (REST / JSON API)
                                    |
                                    v
                  +-----------------+----------------+
                  |    MERN Backend Server (Port 5000)
                  |     Node.js + Express + Mongoose |
                  +---------+--------------+---------+
                            |              |
         +------------------+              +------------------+
         | (Users, Telemetry, Reports)     | (Security Audit Request)
         v                                 v
+--------+-------+               +---------+------------------+
|    MongoDB     |               | Python Analysis Engine     |
| (or In-Memory) |               | Flask API (Port 5001)      |
+----------------+               +----------------------------+
                                 | - Typosquatting & Homoglyphs
                                 | - SSL Socket (Port 443)
                                 | - Non-intrusive HTTP Audit
                                 | - External Threat Feeds
```

### A. MERN Application (`server/` & `client/`)
- **Port:** `5000`
- User registration, bcrypt password hashing, and JWT authentication.
- **Brave Browser-Style Protection Statistics:**
  - Websites Analyzed
  - Potential Threats Detected
  - Confirmed Malicious URLs
  - Threats Blocked (strictly increments only upon an actual user block/prevention action)
  - Last scan timestamp
- Community threat report submission, persistence, and retrieval.
- Production hosting of the compiled React frontend (`client/dist`).

### B. Python Security Analysis API (`python_service/`)
- **Port:** `5001`
- Specialized URL security evaluation (strictly decoupled from Node.js).
- SSRF network protection blocking loopback and private subnets (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`).
- Transparent 0–100 scoring based on concrete, observable findings without hardcoded or simulated scores.
- Clear status classification: `Confirmed Malicious`, `Suspicious`, `No Threat Detected`, `Inconclusive`.

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Windows)
Double-click `start_unmasker.bat` (or run `.\start_unmasker.ps1` in PowerShell).
The application will open automatically in your browser at:
```
http://127.0.0.1:5000
```

### Option 2: Manual Startup (Two Terminals)

#### Terminal 1 — Python Security Engine (Port 5001)
```bash
python python_service/app.py
```

#### Terminal 2 — Node.js Express Gateway (Port 5000)
```bash
node server/index.js
```

---

## 🧪 Verified Benchmark Targets

| Target URL | Expected Result | Score | Detection Rationale |
|:---|:---|:---:|:---|
| `https://www.google.com/` | **No Threat Detected** | **100 / 100** | Official verified Google domain; valid TLS; safe. |
| `https://netfiixgt.com/` | **Suspicious** | **20 / 100** | Homoglyph typosquat (`netfiix` $\rightarrow$ `netflix`) + deceptive suffix (`gt`). |
| `https://www.netflix.com/` | **No Threat Detected** | **95–100 / 100** | Official domain for Netflix; valid TLS. |
| `https://www.apple.com/` | **No Threat Detected** | **100 / 100** | Official Apple domain; enterprise security. |
| `https://sbi-secure-login.com` | **Suspicious** | **15 / 100** | Mimics brand SBI; phishing keywords `login, secure`. |
| `https://amaz0n-support.net` | **Suspicious** | **30 / 100** | Mimics Amazon (homoglyph `0` $\rightarrow$ `o`). |
| `https://paypa1-verification.com` | **Suspicious** | **15 / 100** | Mimics PayPal (homoglyph `1` $\rightarrow$ `l`). |
| `http://185.220.101.5/bank/login` | **Confirmed Malicious** | **5 / 100** | Direct raw IP connection; banking `login`. |

---

## 🔬 Running Automated Tests

Run the test suites directly from `UnMasker`:

```bash
# 1. Real Genuine & Fraud Benchmark Suite (19 target URLs)
python tests/test_real_urls.py

# 2. End-to-End System Integration Suite (Auth, Stats, Scans, Reports)
python tests/verify_e2e.py
```
