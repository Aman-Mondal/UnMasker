# 🎯 UnMasker – Hackathon Presentation & Live Demo Cheatsheet

> **Tagline:** *See Beyond the Surface.*  
> **Platform:** AI-Powered Digital Trust & Web Threat Intelligence Platform

---

## 🎙️ 30-Second Elevator Pitch

> *"Every day, millions of users fall victim to sophisticated credential phishing, deceptive brand lookalikes, and spoofed login portals that traditional antivirus tools miss. UnMasker solves this by providing a unified Digital Trust score from 0 to 100 before a user enters sensitive credentials.*
> 
> *By decoupling a scalable MERN application gateway from a specialized Python security analysis microservice, UnMasker combines multi-layer heuristic threat detection, SSL/TLS socket certificate validation, non-intrusive HTTP header audits, and real-time collaborative threat intelligence—delivering enterprise-grade threat intelligence without requiring expensive paid API subscriptions."*

---

## 🖥️ Live Demonstration Script (3-Minute Walkthrough)

### Step 1: Launch the Platform (1-Click)
- Double-click `start_unmasker.bat`.
- Point out to the judges that the launcher automatically clears port collisions, spins up both the Python Security Engine (Port 5001) and Node.js MERN Server (Port 5000), and opens the dashboard directly at `http://127.0.0.1:5000`.

### Step 2: Test a Verified Genuine Brand (`https://www.google.com`)
- Paste `https://www.google.com` into the URL search bar and click **Scan Website**.
- **Result:** **100 / 100 — No Threat Detected (Safe)**.
- **Key Talking Points:**
  - Notice that verified genuine brand domains with valid TLS certificates are not unfairly penalized for missing optional headers.
  - Switch to the **Certificate** tab to show real-time TLS 1.3 socket inspection, Google Trust Services issuer, and expiration date.

### Step 3: Test a Real Deceptive Typosquatting Attack (`https://netfiixgt.com/`)
- Paste `https://netfiixgt.com/` into the URL search bar and click **Scan Website**.
- **Result:** **Suspicious / High Risk (Score: $\le$ 20/100)**.
- **Key Talking Points:**
  - UnMasker's heuristic visual homoglyph engine identified that `netfiix` mimics `netflix` (substituting `i` for `l`) and strips deceptive affixes like `gt`.
  - The platform immediately alerts the user: *"Suspected Brand Impersonation (Target: Netflix)"*.
  - Show the **Security Assessment** tab: Missing security headers, lack of HSTS, and domain risk flags.

### Step 4: Test Banking Phishing & Raw IP Bypass
- Demonstrate additional threat vectors:
  - `https://sbi-secure-login.com` $\rightarrow$ Penalized to **15 / 100** (Brand spoofing targeting SBI + suspicious phishing keywords `login, secure`).
  - `http://185.220.101.5/bank/login` $\rightarrow$ Penalized to **5 / 100 (Confirmed Malicious)** for using raw IP connections to harvest banking credentials.

### Step 5: Community Threat Intelligence & Telemetry
- Navigate to the **Threat Intel** tab:
  - Show community reports already tracked in the database.
  - Click **Report a Website**, enter a suspicious URL and description, and submit.
  - Re-scan that URL to show how community reports instantly feed into the threat calculation!
- Point out the **Brave Browser-Style Protection Stats** (Websites Analyzed, Potential Threats Detected, Confirmed Malicious, Threats Blocked).

---

## 📋 Recommended Demo URLs Table

| Type | Test URL | Expected Score | Primary Indicator |
|:---|:---|:---:|:---|
| **Genuine Brand** | `https://www.google.com` | **100 / 100** | Verified Brand + Valid TLS 1.3 |
| **Genuine Platform** | `https://github.com` | **100 / 100** | Verified Enterprise Portal |
| **Homoglyph Typosquat** | `https://netfiixgt.com/` | **$\le$ 20 / 100** | Lookalike target: Netflix + Deceptive suffix |
| **Banking Phish** | `https://sbi-secure-login.com` | **15 / 100** | Target: SBI + Phishing keywords |
| **Homoglyph Support Scam**| `https://amaz0n-support.net` | **30 / 100** | Lookalike `0` $\rightarrow$ `o` (Target: Amazon) |
| **Raw IP Banking** | `http://185.220.101.5/bank/login` | **5 / 100** | Direct IP hostname bypass |
| **URL Shortener Masking** | `https://bit.ly/3xFakeLogin` | **59 / 100** | URL shortener obscures destination |

---

## 💡 Anticipated Judge Q&A Cheatsheet

### Q1: *"Why did you separate the architecture into Node.js and Python?"*
> **Answer:** *"Separation of concerns. Node.js with Express and MongoDB excels at asynchronous I/O, user authentication, session management, and high-concurrency dashboard serving. Python, on the other hand, provides native low-level networking and SSL socket libraries (`socket`, `ssl`, `certifi`, `urllib3`) that make deep cryptographic certificate inspection, heuristic string manipulation, and threat analysis robust and performant. Keeping them decoupled allows independent scaling and modular microservice deployments."*

### Q2: *"Does this application depend on expensive paid APIs?"*
> **Answer:** *"No! While UnMasker supports Google Safe Browsing and VirusTotal APIs if keys are provided in `.env`, the core threat detection engine is completely self-contained. It uses rule-based visual homoglyph analysis, normalized Levenshtein distance against known target brands, raw IP detection, TLD reputation heuristics, native socket TLS validation, and HTTP security header audits. If APIs are missing, it transparently indicates that external feeds are unconfigured rather than fabricating fake results."*

### Q3: *"Does a valid SSL/TLS certificate mean a website is safe?"*
> **Answer:** *"Absolutely not! One of the biggest misconceptions users have is that the padlock icon means a website is trustworthy. Today, threat actors easily obtain free Let's Encrypt certificates for phishing sites. UnMasker explicitly educates users on this: we validate the certificate for transport encryption, but pair it with brand impersonation and community reports to detect whether the site itself is malicious."*

### Q4: *"How does UnMasker protect against Server-Side Request Forgery (SSRF)?"*
> **Answer:** *"Our Python analysis microservice validates every hostname before opening sockets or making HTTP requests. It resolves DNS records and checks the destination IP against blocked internal networks—specifically blocking loopback addresses (`127.0.0.0/8`, `localhost`), link-local IPs (`169.254.0.0/16`), and private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)."*

### Q5: *"What happens if MongoDB is down or not installed?"*
> **Answer:** *"UnMasker includes a built-in hybrid data access layer. If a local MongoDB instance is unreachable, the Node.js server automatically switches to an in-memory JSON fallback store (`server/data/local_store.json`), allowing user logins, telemetry tracking, and community reporting to function smoothly without crashing or failing."*
