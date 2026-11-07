import socket
import ssl
from datetime import datetime, timezone

try:
    import certifi
    CA_FILE = certifi.where()
except ImportError:
    CA_FILE = None


def _parse_name_components(components):
    if not components:
        return "Unknown"
    parsed = {}
    for rdn in components:
        for k, v in rdn:
            parsed[k] = v
    cn = parsed.get("commonName", "")
    org = parsed.get("organizationName", "")
    return f"{cn} ({org})" if (cn and org) else (cn or org or "Unknown")


def check_ssl_certificate(domain, timeout=2.0):
    result = {
        "status": "Unavailable",
        "is_valid": False,
        "issuer": "Not Available",
        "subject": "Not Available",
        "valid_from": "Not Available",
        "valid_until": "Not Available",
        "days_until_expiry": None,
        "san": [],
        "domain_match": False,
        "tls_version": "Not Available",
        "cipher_suite": "Not Available",
        "error_message": None,
        "penalty": 0,
        "note": "A valid SSL/TLS certificate only encrypts transport; it does not guarantee website legitimacy."
    }

    clean_domain = domain.split(":")[0].strip()
    if CA_FILE:
        ctx = ssl.create_default_context(cafile=CA_FILE)
    else:
        ctx = ssl.create_default_context()

    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED

    try:
        with socket.create_connection((clean_domain, 443), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=clean_domain) as ssock:
                cert = ssock.getpeercert()
                tls_ver = ssock.version()
                cipher = ssock.cipher()

                result["tls_version"] = tls_ver or "TLSv1.2+"
                if cipher:
                    result["cipher_suite"] = f"{cipher[0]} ({cipher[1]})"

                result["issuer"] = _parse_name_components(cert.get("issuer", ()))
                result["subject"] = _parse_name_components(cert.get("subject", ()))

                # Parse validity dates
                not_before = cert.get("notBefore")
                not_after = cert.get("notAfter")
                if not_before and not_after:
                    dt_fmt = "%b %d %H:%M:%S %Y %Z"
                    try:
                        valid_from = datetime.strptime(not_before, dt_fmt).replace(tzinfo=timezone.utc)
                        valid_until = datetime.strptime(not_after, dt_fmt).replace(tzinfo=timezone.utc)
                        now = datetime.now(timezone.utc)

                        result["valid_from"] = valid_from.strftime("%d %b %Y, %H:%M UTC")
                        result["valid_until"] = valid_until.strftime("%d %b %Y, %H:%M UTC")

                        days_left = (valid_until - now).days
                        result["days_until_expiry"] = days_left

                        if now > valid_until:
                            result["status"] = "Expired"
                            result["is_valid"] = False
                            result["error_message"] = f"Certificate expired {abs(days_left)} days ago."
                            result["penalty"] = 25
                            return result
                        elif now < valid_from:
                            result["status"] = "Invalid"
                            result["is_valid"] = False
                            result["error_message"] = "Certificate is not yet valid."
                            result["penalty"] = 20
                            return result
                        elif days_left < 7:
                            result["status"] = "Valid (Expiring Soon)"
                            result["is_valid"] = True
                            result["penalty"] = 5
                        else:
                            result["status"] = "Valid"
                            result["is_valid"] = True
                    except Exception:
                        result["status"] = "Valid"
                        result["is_valid"] = True

                # SANs and domain matching
                sans = [entry[1] for entry in cert.get("subjectAltName", ()) if entry[0].lower() == "dns"]
                result["san"] = sans[:10]

                common_name = ""
                for rdn in cert.get("subject", ()):
                    for k, v in rdn:
                        if k == "commonName":
                            common_name = v

                matched = (clean_domain.lower() == common_name.lower())
                if not matched:
                    for s in sans:
                        if s.startswith("*.") and clean_domain.endswith(s[2:]):
                            matched = True
                            break
                        elif s.lower() == clean_domain.lower():
                            matched = True
                            break

                result["domain_match"] = matched
                if not matched and result["status"].startswith("Valid"):
                    result["status"] = "Invalid"
                    result["is_valid"] = False
                    result["error_message"] = f"Certificate hostname mismatch for {clean_domain}."
                    result["penalty"] = 25

                return result

    except ssl.SSLCertVerificationError as e:
        err = str(e).lower()
        if "expired" in err:
            result["status"] = "Expired"
            result["error_message"] = "Certificate has expired."
            result["penalty"] = 25
        elif "hostname" in err or "doesn't match" in err:
            result["status"] = "Invalid"
            result["error_message"] = "Hostname does not match certificate."
            result["penalty"] = 25
        else:
            result["status"] = "Invalid"
            result["error_message"] = "Untrusted certificate authority or self-signed."
            result["penalty"] = 20
        return result

    except (socket.timeout, TimeoutError):
        result["status"] = "Unavailable"
        result["error_message"] = "TLS handshake timed out on port 443."
        result["penalty"] = 15
        return result

    except Exception as e:
        result["status"] = "Unavailable"
        result["error_message"] = "HTTPS connection could not be established."
        result["penalty"] = 15
        return result
