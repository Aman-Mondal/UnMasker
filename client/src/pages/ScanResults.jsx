
import {
  Globe,
  ExternalLink,
  Share2,
  Printer,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  CheckCircle
} from 'lucide-react';

export default function ScanResults({
  scanResult,
  activeTab,
  setActiveTab,
  setActivePage,
  showToast,
  setReportForm,
  setReportModalOpen,
  handleRecordBlock
}) {
  if (!scanResult) return null;

  return (
    <div>
      <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }} onClick={() => setActivePage('home')}>
            &larr; Scan Result
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Globe size={20} color="var(--primary)" />
            <a href={scanResult.url} target="_blank" rel="noopener noreferrer" className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              {scanResult.url} <ExternalLink size={14} color="var(--text-muted)" />
            </a>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Scanned on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} • Resolved IP: <span className="mono">{scanResult.ip_address}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn-pill" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }} onClick={() => {
            navigator.clipboard.writeText(`UnMasker Security Audit: ${scanResult.url} - Score: ${scanResult.trust_score}/100 (${scanResult.risk_level})`);
            showToast('Scan result summary copied to clipboard!', 'success');
          }}>
            <Share2 size={15} /> Share
          </button>

          <button className="btn-pill" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }} onClick={() => window.print()} title="Print or Save PDF Report">
            <Printer size={15} /> Export PDF
          </button>

          <button className="btn-pill" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' }} onClick={() => {
            setReportForm({ url: scanResult.url, category: 'Phishing', description: `Flagged as ${scanResult.risk_level} during UnMasker audit.` });
            setReportModalOpen(true);
          }}>
            <AlertTriangle size={15} /> Report as Malicious
          </button>

          {(scanResult.risk_level === 'Suspicious' || scanResult.risk_level === 'Confirmed Malicious') && (
            <button className="btn-pill" onClick={handleRecordBlock} style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              <ShieldAlert size={15} /> Prevent Access
            </button>
          )}
        </div>
      </div>

      {/* Score & Risk Cards */}
      <div className="score-row">
        <div className={`risk-card ${scanResult.badge_color === 'danger' ? 'danger' : (scanResult.badge_color === 'warning' ? 'warning' : 'safe')}`}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {scanResult.risk_level === 'No Threat Detected' ? <ShieldCheck size={28} color="var(--safe-text)" /> : <AlertTriangle size={28} color="var(--danger-text)" />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>{scanResult.risk_level}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>{scanResult.statement}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Digital Trust Score ⓘ</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.45rem 0' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{scanResult.trust_score}</span>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ height: '8px', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${scanResult.trust_score}%`, background: scanResult.trust_score >= 70 ? 'var(--safe-text)' : (scanResult.trust_score >= 40 ? 'var(--warning-text)' : 'var(--danger-text)') }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
        <button className={`tab-btn ${activeTab === 'certificate' ? 'active' : ''}`} onClick={() => setActiveTab('certificate')}>Certificate</button>
        <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</button>
        <button className={`tab-btn ${activeTab === 'intel' ? 'active' : ''}`} onClick={() => setActiveTab('intel')}>Threat Intel ({scanResult.community_reports_count})</button>
      </div>

      {/* Tab: Summary */}
      {activeTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              {scanResult.risk_level === 'No Threat Detected' ? 'Security & Trust Observations' : 'Why is this website risky?'}
            </h3>
            {scanResult.reasons && scanResult.reasons.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {scanResult.reasons.map((r, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <XCircle size={18} color="var(--danger-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--safe-text)' }}>
                <CheckCircle size={18} />
                <span>No active phishing indicators, typosquatting patterns, or high-risk warnings detected.</span>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>SSL Certificate</span>
                <span style={{ padding: '0.2rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: scanResult.certificate_info?.is_valid ? 'var(--safe-bg)' : 'var(--danger-bg)', color: scanResult.certificate_info?.is_valid ? 'var(--safe-text)' : 'var(--danger-text)' }}>
                  {scanResult.certificate_info?.status || 'Unavailable'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Domain Age</span>
                <strong style={{ fontWeight: 700 }}>{scanResult.threat_analysis?.domain_age || 'Active Domain'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Security Headers</span>
                <span style={{ padding: '0.2rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: scanResult.security_assessment?.status === 'Configured' ? 'var(--safe-bg)' : 'var(--warning-bg)', color: scanResult.security_assessment?.status === 'Configured' ? 'var(--safe-text)' : 'var(--warning-text)' }}>
                  {scanResult.security_assessment?.status || 'Partially Configured'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Community Reports</span>
                <strong>{scanResult.community_reports_count} reports</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Certificate */}
      {activeTab === 'certificate' && (
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>SSL/TLS Certificate Inspection</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Validated via cryptographic handshake on port 443.
          </p>

          <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            <strong>Security Note:</strong> {scanResult.certificate_info?.note}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Status:</span> <strong>{scanResult.certificate_info?.status}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Domain Match:</span> <strong>{scanResult.certificate_info?.domain_match ? 'Matched' : 'Mismatch'}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Issuer:</span> <span>{scanResult.certificate_info?.issuer}</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Subject:</span> <span>{scanResult.certificate_info?.subject}</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Valid Until:</span> <span>{scanResult.certificate_info?.valid_until}</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Days Until Expiry:</span> <strong>{scanResult.certificate_info?.days_until_expiry ?? 'N/A'} days</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>TLS Protocol:</span> <span className="mono">{scanResult.certificate_info?.tls_version}</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Cipher Suite:</span> <span className="mono">{scanResult.certificate_info?.cipher_suite}</span></div>
          </div>
        </div>
      )}

      {/* Tab: Web Security */}
      {activeTab === 'security' && (
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>HTTP Security Headers & Cookies</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.65rem 0' }}>Security Header</th>
                <th>Status</th>
                <th>Observed Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scanResult.security_assessment?.headers || {}).map(([name, h]) => (
                <tr key={name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="mono" style={{ padding: '0.65rem 0', color: 'var(--primary)' }}>{name}</td>
                  <td>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: h.present ? 'var(--safe-bg)' : 'var(--danger-bg)', color: h.present ? 'var(--safe-text)' : 'var(--danger-text)' }}>
                      {h.status}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{h.value || 'Not Configured'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Threat Intel */}
      {activeTab === 'intel' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>MongoDB Community Reports ({scanResult.community_reports_count})</h3>
            {scanResult.community_reports && scanResult.community_reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {scanResult.community_reports.map((r, i) => (
                  <div key={i} style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '3px solid var(--danger-text)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <strong style={{ color: 'var(--danger-text)' }}>{r.category}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{r.description || 'No additional comments.'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No community reports currently on file for this domain.</p>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>External Threat Feeds</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <strong>Google Safe Browsing:</strong>
                <p style={{ marginTop: '0.25rem', color: 'var(--text-sub)' }}>{scanResult.external_intelligence?.google_safe_browsing?.message}</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <strong>VirusTotal Intelligence:</strong>
                <p style={{ marginTop: '0.25rem', color: 'var(--text-sub)' }}>{scanResult.external_intelligence?.virustotal?.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
