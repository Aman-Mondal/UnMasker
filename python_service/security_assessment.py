import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 UnMasker-Scanner/2.0"

_session = requests.Session()
_adapter = HTTPAdapter(max_retries=Retry(total=0, connect=0, read=0))
_session.mount("http://", _adapter)
_session.mount("https://", _adapter)


def assess_web_security(target_url, domain, timeout=(1.5, 2.0)):
    findings = []
    headers_eval = {}
    cookie_eval = []
    server_exposure = []
    penalty = 0

    fetch_url = target_url if target_url.startswith("http") else f"https://{domain}"
    resp_headers = {}
    resp_cookies = []
    https_enforced = False

    # 1. Fetch main response headers & cookies
    host_reachable = True
    try:
        resp = _session.get(fetch_url, headers={"User-Agent": USER_AGENT}, timeout=timeout, allow_redirects=True, verify=False)
        resp_headers = {k.lower(): v for k, v in resp.headers.items()}
        resp_cookies = resp.cookies
        if resp.url.startswith("https://"):
            https_enforced = True
    except Exception:
        # If HTTPS fetch failed, try plaintext HTTP once only if fetch_url was HTTPS
        if fetch_url.startswith("https://"):
            try:
                resp = _session.get(f"http://{domain}", headers={"User-Agent": USER_AGENT}, timeout=timeout, allow_redirects=True)
                resp_headers = {k.lower(): v for k, v in resp.headers.items()}
                resp_cookies = resp.cookies
                if resp.url.startswith("https://"):
                    https_enforced = True
            except Exception:
                host_reachable = False
        else:
            host_reachable = False

    # 2. Check HTTP to HTTPS redirect enforcement if host is reachable and not already confirmed
    if host_reachable and not https_enforced:
        try:
            r_http = _session.get(f"http://{domain}", headers={"User-Agent": USER_AGENT}, timeout=(1.0, 1.5), allow_redirects=False)
            loc = r_http.headers.get("location", "")
            if loc.startswith("https://") or r_http.status_code in (301, 302, 307, 308):
                https_enforced = True
        except Exception:
            pass

    if https_enforced:
        findings.append({
            "type": "safe",
            "title": "HTTPS Enforced",
            "description": "Unencrypted HTTP requests automatically redirect to encrypted HTTPS."
        })
    else:
        findings.append({
            "type": "warning",
            "title": "Unencrypted HTTP Not Upgraded",
            "description": "Website accepts plaintext HTTP without automatically enforcing HTTPS."
        })
        penalty += 8

    # 3. Security Headers Evaluation
    # HSTS
    hsts = resp_headers.get("strict-transport-security")
    headers_eval["Strict-Transport-Security"] = {
        "present": bool(hsts),
        "status": "Configured" if hsts else "Missing",
        "value": hsts,
        "description": "Forces browser to exclusively use HTTPS, mitigating man-in-the-middle attacks."
    }
    if not hsts: penalty += 4

    # CSP
    csp = resp_headers.get("content-security-policy")
    headers_eval["Content-Security-Policy"] = {
        "present": bool(csp),
        "status": "Configured" if csp else "Missing",
        "value": (csp[:70] + "...") if (csp and len(csp) > 70) else csp,
        "description": "Restricts external script and asset sources to defend against Cross-Site Scripting (XSS)."
    }
    if not csp: penalty += 5

    # X-Frame-Options
    xfo = resp_headers.get("x-frame-options")
    headers_eval["X-Frame-Options"] = {
        "present": bool(xfo),
        "status": "Configured" if xfo else "Missing",
        "value": xfo,
        "description": "Prevents unauthorized iframe embedding, protecting users from Clickjacking."
    }
    if not xfo: penalty += 4

    # X-Content-Type-Options
    xcto = resp_headers.get("x-content-type-options")
    headers_eval["X-Content-Type-Options"] = {
        "present": bool(xcto and "nosniff" in xcto.lower()),
        "status": "Configured" if (xcto and "nosniff" in xcto.lower()) else "Missing",
        "value": xcto,
        "description": "Prevents browsers from MIME-type sniffing non-script files as scripts."
    }
    if not xcto: penalty += 3

    # Referrer-Policy
    ref = resp_headers.get("referrer-policy")
    headers_eval["Referrer-Policy"] = {
        "present": bool(ref),
        "status": "Configured" if ref else "Missing",
        "value": ref,
        "description": "Controls how much sensitive URL referrer information is transmitted."
    }

    # Permissions-Policy
    perm = resp_headers.get("permissions-policy") or resp_headers.get("feature-policy")
    headers_eval["Permissions-Policy"] = {
        "present": bool(perm),
        "status": "Configured" if perm else "Not Configured",
        "value": (perm[:60] + "...") if (perm and len(perm) > 60) else perm,
        "description": "Restricts browser device APIs (geolocation, microphone, camera)."
    }

    # 4. Cookie Security Attributes (Observable)
    raw_cookie_headers = [v for k, v in resp_headers.items() if "set-cookie" in k]
    for c in resp_cookies:
        c_flags = []
        if c.secure: c_flags.append("Secure")
        if c.has_nonstandard_attr("HttpOnly") or c._rest.get("HttpOnly") is not None: c_flags.append("HttpOnly")
        samesite = c._rest.get("SameSite", "")
        if samesite: c_flags.append(f"SameSite={samesite}")

        cookie_eval.append({
            "name": c.name,
            "secure": c.secure,
            "flags": c_flags or ["Missing Secure/HttpOnly"]
        })

    # 5. Server Information Disclosure
    if "server" in resp_headers and any(char.isdigit() for char in resp_headers["server"]):
        server_exposure.append(f"Server: {resp_headers['server']}")
    if "x-powered-by" in resp_headers:
        server_exposure.append(f"X-Powered-By: {resp_headers['x-powered-by']}")

    if server_exposure:
        findings.append({
            "type": "warning",
            "title": "Server Software Banners Exposed",
            "description": f"Reveals backend version details ({', '.join(server_exposure)}), aiding automated exploit scanners."
        })
        penalty += 3

    configured_count = sum(1 for h in headers_eval.values() if h["present"])
    status = "Configured" if configured_count >= 4 else ("Partially Configured" if configured_count >= 2 else "Missing")

    penalty = min(20, penalty)

    return {
        "status": status,
        "https_enforced": https_enforced,
        "headers": headers_eval,
        "cookies": cookie_eval[:5],
        "server_exposure": server_exposure,
        "findings": findings,
        "penalty": penalty
    }
