# UnMasker – Web Threat Intelligence & Digital Trust Platform

> **Tagline:** *See Beyond the Surface.*

## Hosted Demo & Troubleshooting

- **Main application:** https://unmasker.onrender.com
- **Python security analysis service:** https://unmasker-python.onrender.com

### If scanning fails or a Python service error appears

The main website depends on the separate Python security analysis service. If a scan fails, the backend reports an error, or you see a Python-related error:

1. Open the Python service directly: https://unmasker-python.onrender.com
2. Wait for the service to respond. If it is starting from an idle state, give it a little time to wake up.
3. Return to the main application: https://unmasker.onrender.com
4. Refresh the page and try the URL scan again.

If the issue continues, the hosted service may be temporarily unavailable. Try again later.


UnMasker is an independent, lightweight web security analysis system designed to evaluate the safety, authenticity, and digital trust of URLs. It detects phishing campaigns, brand impersonation, deceptive homoglyph domains, SSL/TLS certificate misconfigurations, missing defensive HTTP headers, and correlates community fraud reports in real time.

---

## Architecture Overview

UnMasker uses a decoupled microservice architecture separating web gateway responsibilities from security analysis routines:

```
[ User Browser / Chrome Extension ]
                 |
                 v (Port 5000)
+-------------------------------------------------+
|         MERN Backend Gateway (Node.js)          |
|  - Serves React Client (`client/dist`)          |
|  - User Auth (JWT + bcrypt)                     |
|  - Brave-Style Privacy & Threat Telemetry       |
|  - Community Fraud Reports (MongoDB + Fallback) |
+------------------------+------------------------+
                         | (Internal POST /analyze)
                         v (Port 5001)
+-------------------------------------------------+
|      Python Security Engine (Flask API)         |
|  - Typosquatting & Visual Homoglyph Detection   |
|  - Native TLS Socket Handshake (Port 443)       |
|  - Non-Intrusive HTTP Security Header Audit     |
|  - SSRF Protection (Blocks RFC1918 / Loopback)  |
|  - Digital Trust Score Computation (0 - 100)    |
+-------------------------------------------------+
```

### Why Decoupled?
- **Node.js Gateway (`server/`)**: Handles authentication, user protection telemetry, database operations, rate limiting, and static React asset delivery.
- **Python Security Engine (`python_service/`)**: Dedicated exclusively to deep network inspection, socket operations, cryptographic certificate analysis, and lexical URL heuristics. Node.js never handles raw socket scanning, keeping both tiers clean and isolated.

---

## Directory Structure

```text
UnMasker/
├── client/                     # React 18 User Interface
│   ├── dist/                   # Production build pre-compiled for instant serving
│   ├── src/                    # UI source code (Vite + React + Lucide Icons)
│   │   ├── components/         # Gauge charts, summary breakdown, risk cards
│   │   ├── App.jsx             # Main dashboard, scan views & telemetry
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML template
│   └── package.json            # Client-side dependencies
│
├── server/                     # MERN Web Server & Gateway (Port 5000)
│   ├── config/
│   │   └── db.js               # MongoDB connection with zero-downtime JSON store fallback
│   ├── middleware/
│   │   └── auth.js             # JWT verification and bearer token parser
│   ├── models/
│   │   ├── User.js             # User account schema and protective scan telemetry
│   │   └── Report.js           # Community fraud reporting schema
│   ├── routes/
│   │   ├── auth.js             # Registration & login endpoints (/api/auth)
│   │   ├── scan.js             # Proxy scanner calling Python engine (/api/scan)
│   │   ├── reports.js          # Community threat submission & list (/api/reports)
│   │   └── stats.js            # User protection telemetry counter (/api/stats)
│   ├── index.js                # Express entrypoint & static build host
│   └── package.json            # Server dependencies (Express, Mongoose, Axios, bcrypt)
│
├── python_service/             # URL Security Analysis Engine (Port 5001)
│   ├── app.py                  # Flask entrypoint with SSRF network protection
│   ├── certificate_check.py    # Native TLS socket inspection on port 443 (Certifi CA)
│   ├── config.py               # Port binding and environment settings
│   ├── scoring.py              # Transparent 0-100 Digital Trust Score formula
│   ├── security_assessment.py  # Non-intrusive HTTP response header and cookie auditing
│   ├── threat_analysis.py      # Homoglyphs, brand spoofing, typosquats, keywords
│   └── threat_intelligence.py  # External threat feed queries & community lookup
│
├── extension/                  # Chrome / Brave / Edge Browser Extension (Manifest V3)
│   ├── manifest.json           # Extension metadata and host permissions
│   ├── popup.html              # Extension popup layout
│   ├── popup.css               # Clean styling matching the dashboard
│   └── popup.js                # One-click scan integration with UnMasker API
│
├── tests/                      # Automated Verification & Benchmark Suites
│   ├── test_real_urls.py       # 21-URL benchmark (10 genuine + 11 fraud targets)
│   ├── test_unmasker.py        # Python unit tests for heuristic detectors
│   └── verify_e2e.py           # Full end-to-end integration and telemetry test
│
├── .env.example                # Template for configuration and optional API keys
├── .gitignore                  # Git ignore rules (node_modules, .env, pycache)
├── package.json                # Root orchestration (install:all, start commands)
├── requirements.txt            # Python dependencies (Flask, Requests, Certifi, Urllib3)
├── start_unmasker.bat          # 1-Click launcher for Windows Explorer
└── start_unmasker.ps1          # 1-Click launcher for PowerShell
```

---

## Setup & Installation Guide

### Prerequisites
Before running UnMasker, make sure you have installed:
- **Node.js** (v18 or higher recommended) – [Download Node.js](https://nodejs.org/)
- **Python** (v3.10 or higher) – [Download Python](https://python.org/)

---

### Step 1: First-Time Setup (From Scratch)

1. **Clone the Repository & Switch to the Branch:**
   ```bash
   git clone -b UnMasker-type-1 https://github.com/Aman-Mondal/UnMasker.git
   cd UnMasker
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to create your local `.env`:
   ```bash
   # On Windows (cmd)
   copy .env.example .env

   # On Linux / macOS / PowerShell
   cp .env.example .env
   ```
   *Note: Optional external threat API keys (Google Safe Browsing, VirusTotal) can be added to `.env`. If left empty, UnMasker uses its internal heuristic detection engine.*

3. **Install Dependencies:**
   Run the unified installer to set up both Node services and the Python environment:
   ```bash
   # Install server and client Node dependencies in one command
   npm run install:all

   # Install Python security engine dependencies
   pip install -r requirements.txt
   ```

---

### Step 2: Running UnMasker (Daily Usage)

Once dependencies are installed, you can launch the platform using either of the following methods:

#### Method A: 1-Click Auto-Launcher (Recommended for Windows)
Double-click `start_unmasker.bat` (or execute `.\start_unmasker.ps1` in PowerShell).

The launcher will:
- Terminate any dangling processes on ports 5000 and 5001.
- Boot the Python Security Engine on `http://127.0.0.1:5001`.
- Boot the Node.js Express Server on `http://127.0.0.1:5000`.
- Automatically open `http://127.0.0.1:5000` in your default browser.

#### Method B: Manual Startup (Two Terminals)

**Terminal 1 — Python Security Engine (Port 5001):**
```bash
python python_service/app.py
```

**Terminal 2 — Node.js Express Gateway (Port 5000):**
```bash
node server/index.js
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

### Step 3: Browser Extension Setup (Optional)

UnMasker includes a Chromium-compatible extension for Chrome, Brave, and Edge:

1. Open your browser and navigate to the Extensions management page:
   - Chrome / Brave: `chrome://extensions/`
   - Edge: `edge://extensions/`
2. Toggle **Developer mode** on (top-right corner).
3. Click **Load unpacked**.
4. Select the `extension/` directory inside `UnMasker`.
5. Pin the UnMasker icon to your toolbar. Clicking the extension analyzes the active browser tab directly through your local UnMasker server.

---

## Security Verification & Test Benchmarks

UnMasker includes a test suite verifying both genuine popular platforms and real-world fraud patterns.

With the server running, execute:
```bash
python tests/test_real_urls.py
```

### Verified Benchmark Results (21 / 21 Passing):

| Target URL | Expected Category | Trust Score | Classification | Primary Indicators Observed |
|:---|:---:|:---:|:---:|:---|
| `https://www.google.com` | Genuine | **100 / 100** | No Threat Detected | Official Google domain, valid TLS, clean record |
| `https://github.com` | Genuine | **100 / 100** | No Threat Detected | Official developer platform, strict security headers |
| `https://www.apple.com` | Genuine | **100 / 100** | No Threat Detected | Official Apple portal, valid TLS |
| `https://www.netflix.com` | Genuine | **100 / 100** | No Threat Detected | Verified genuine brand domain |
| `https://www.amazon.com` | Genuine | **100 / 100** | No Threat Detected | Official retail domain, valid TLS |
| `https://www.chase.com` | Genuine | **100 / 100** | No Threat Detected | JPMorgan Chase banking, valid EV TLS |
| `https://en.wikipedia.org` | Genuine | **95 / 100** | No Threat Detected | Wikimedia Foundation, valid TLS |
| `https://netfiixgt.com/` | Fraud | **20 / 100** | Suspicious | Homoglyph lookalike (`netfiix` $\rightarrow$ Netflix), suffix `gt` |
| `https://sbi-secure-login.com` | Fraud | **15 / 100** | Suspicious | Mimics SBI Banking, phishing keywords `secure, login` |
| `https://amaz0n-support.net` | Fraud | **30 / 100** | Suspicious | Homoglyph spoofing (`0` $\rightarrow$ `o`), fake tech support lure |
| `https://paypa1-verification.com`| Fraud | **15 / 100** | Suspicious | Homoglyph spoofing (`1` $\rightarrow$ `l`), credential harvest |
| `https://flipkart-offers-login.in`| Fraud | **15 / 100** | Suspicious | Fake shopping festive lure, phishing keyword `login` |
| `https://govt-schemes-apply.com` | Fraud | **65 / 100** | Suspicious | Subsidy grant fee lure, unverified domain |
| `http://185.220.101.5/bank/login`| Fraud | **5 / 100** | Confirmed Malicious | Raw IP address used as hostname, banking path |

To run the full end-to-end integration suite (testing auth, Brave telemetry, report submissions, and scan pipelines):
```bash
python tests/verify_e2e.py
```

---

## API Reference

### 1. Website Scan (`POST /api/scan`)
Proxies the security analysis request to the Python engine and blends user telemetry and community intelligence.
```json
// Request
POST http://127.0.0.1:5000/api/scan
Content-Type: application/json

{
  "url": "https://netfiixgt.com/"
}

// Response
{
  "success": true,
  "domain": "netfiixgt.com",
  "trust_score": 20,
  "risk_level": "Suspicious",
  "verdict": "Suspicious",
  "threat_analysis": {
    "brand_assessment": {
      "impersonated": true,
      "target": "Netflix"
    }
  },
  "certificate_info": {
    "status": "Unavailable",
    "is_valid": false
  },
  "community_intel": {
    "has_reports": true,
    "report_count": 5
  }
}
```

### 2. Community Threat Reports (`GET /api/reports`, `POST /api/reports`)
- `GET /api/reports`: Lists recently reported suspicious domains.
- `POST /api/reports`: Submits a user report with category, domain, and description.

### 3. User Protection Telemetry (`GET /api/stats`, `POST /api/stats/block`)
- `GET /api/stats`: Returns current user telemetry (Analyzed, Potential Threats, Malicious, Blocked).
- `POST /api/stats/block`: Records an active user prevention action when a user chooses to block or avoid a flagged site.

---

## Development Notes & Best Practices
- **No Intrusive Testing**: Scans perform passive reconnaissance (DNS lookup, SSL handshake, HTTP header audit). No active penetration testing or payload injection is performed.
- **SSRF Hardening**: The Python engine strictly denies queries resolving to private IPv4 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`) and IPv6 loopbacks.
- **In-Memory Resiliency**: If MongoDB is not running locally, the server automatically activates an in-memory fallback store to ensure zero downtime during evaluations.
