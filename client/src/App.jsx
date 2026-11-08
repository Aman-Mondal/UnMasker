import Navbar from './components/layout/Navbar';
import AuthModal from './components/auth/AuthModal';

import React, { useState, useEffect } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, Search, Link as LinkIcon,
  Globe, Lock, FileText, Users, Sun, Moon, Flag, AlertTriangle,
  CheckCircle, XCircle, LogIn, User, LogOut, ArrowRight, Activity,
  Share2, ExternalLink, BarChart2, Printer, Clock
} from 'lucide-react';
import CyberIllustration from './CyberIllustration';

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('unmasker_theme') || 'light');
  const [activePage, setActivePage] = useState('home');
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  // Scan History State
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unmasker_history') || '[]');
    } catch (_) {
      return [];
    }
  });

  // Auth State
  const [token, setToken] = useState(localStorage.getItem('unmasker_token') || null);
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Protection Statistics (Brave-style)
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    potentialThreats: 0,
    confirmedMalicious: 0,
    threatsBlocked: 0,
    lastScanDate: null
  });

  // Community Reports State
  const [reports, setReports] = useState([]);
  const [intelCategory, setIntelCategory] = useState('All');
  const [intelSearch, setIntelSearch] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ url: '', category: 'Phishing', description: '' });
  const [toast, setToast] = useState(null);

  // Synchronize theme with html attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('unmasker_theme', theme);
  }, [theme]);

  // Fetch current user and stats
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            if (data.user.stats) setStats(data.user.stats);
          } else {
            handleLogout();
          }
        })
        .catch(() => { });
    } else {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.stats) setStats(data.stats);
        })
        .catch(() => { });
    }
  }, [token]);

  // Fetch community reports when visiting threat intel page
  useEffect(() => {
    if (activePage === 'intel') {
      fetch('/api/reports')
        .then(res => res.json())
        .then(data => {
          if (data.success) setReports(data.reports);
        })
        .catch(() => { });
    }
  }, [activePage]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem('unmasker_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('unmasker_token', data.token);
        setToken(data.token);
        setUser(data.user);
        if (data.user.stats) setStats(data.user.stats);
        setAuthModalOpen(false);
        setAuthForm({ name: '', email: '', password: '' });
        showToast(`Welcome back, ${data.user.name}!`, 'success');
      } else {
        setAuthError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setAuthError('Network error connecting to UnMasker server.');
    }
  };

  const triggerScan = async (targetUrl) => {
    const cleanUrl = (targetUrl || urlInput).trim();
    if (!cleanUrl) {
      showToast('Please enter a website URL.', 'warning');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: cleanUrl })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setScanResult(data);
        setActivePage('results');
        setActiveTab('summary');
        if (data.updatedUserStats) setStats(data.updatedUserStats);

        // Record in scan history
        const item = {
          id: Date.now(),
          url: cleanUrl,
          domain: data.domain,
          trust_score: data.trust_score,
          risk_level: data.risk_level,
          badge_color: data.badge_color,
          date: new Date().toISOString(),
          data: data
        };
        setHistory(prev => {
          const updated = [item, ...prev.filter(h => h.url !== cleanUrl)].slice(0, 20);
          localStorage.setItem('unmasker_history', JSON.stringify(updated));
          return updated;
        });
      } else {
        showToast(data.error || 'Scan analysis failed.', 'error');
      }
    } catch (err) {
      showToast('Error communicating with backend analysis service.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRecordBlock = async () => {
    if (!token) {
      showToast('Sign in to track your personal threat prevention statistics.', 'info');
      return;
    }
    try {
      const res = await fetch('/api/scan/record-block', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        showToast('Navigation blocked. Protection statistics updated!', 'success');
      }
    } catch (_) { }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers,
        body: JSON.stringify(reportForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message, 'success');
        setReportModalOpen(false);
        setReportForm({ url: '', category: 'Phishing', description: '' });
        if (activePage === 'intel') {
          const fresh = await fetch('/api/reports').then(r => r.json());
          if (fresh.success) setReports(fresh.reports);
        }
      } else {
        showToast(data.error || 'Failed to submit report.', 'error');
      }
    } catch (err) {
      showToast('Network error submitting report.', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        theme={theme}
        setTheme={setTheme}
        user={user}
        handleLogout={handleLogout}
        setAuthMode={setAuthMode}
        setAuthModalOpen={setAuthModalOpen}
      />

      {/* Main Content */}
      <main className="main-wrapper">
        {/* VIEW: HOME */}
        {activePage === 'home' && (
          <div>
            <section className="hero-grid">
              <div>
                <div className="hero-tag">
                  <Shield size={14} /> See Beyond the Surface
                </div>
                <h1 className="hero-heading">
                  AI-Powered<br />
                  <span>Digital Trust Intelligence</span>
                </h1>
                <p className="hero-subheading">
                  Analyze websites, detect phishing and brand impersonation, validate TLS certificates, and inspect observable web vulnerabilities.
                </p>

                <div className="search-pill">
                  <LinkIcon size={18} color="var(--text-muted)" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Enter website URL (e.g., https://example.com)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && triggerScan()}
                  />
                  <button className="btn-search" onClick={() => triggerScan()} disabled={isScanning}>
                    <Search size={16} />
                    <span>{isScanning ? 'Analyzing...' : 'Scan Website'}</span>
                  </button>
                </div>

                <div className="quick-chips">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Try verified test cases:</span>
                  <button className="chip" onClick={() => { setUrlInput('https://www.netflix.com/'); triggerScan('https://www.netflix.com/'); }}>netflix.com (Genuine)</button>
                  <button className="chip" onClick={() => { setUrlInput('https://netfiixgt.com/'); triggerScan('https://netfiixgt.com/'); }}>netfiixgt.com (Impersonation)</button>
                  <button className="chip" onClick={() => { setUrlInput('https://www.google.com/'); triggerScan('https://www.google.com/'); }}>google.com (Genuine)</button>
                  <button className="chip" onClick={() => { setUrlInput('https://www.microsoft.com/'); triggerScan('https://www.microsoft.com/'); }}>microsoft.com (Genuine)</button>
                </div>
              </div>

              {/* Cybersecurity Illustration matching reference design */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CyberIllustration size={380} />
              </div>
            </section>

            {/* Feature Cards */}
            <section className="feature-grid">
              <div className="card feature-box">
                <div className="feature-icon-circle"><ShieldAlert size={24} /></div>
                <h4 className="feature-title">Threat Detection</h4>
                <p className="feature-desc">Detect typosquatting, brand spoofing, homoglyphs, and known malicious patterns.</p>
              </div>
              <div className="card feature-box">
                <div className="feature-icon-circle"><Lock size={24} /></div>
                <h4 className="feature-title">Certificate Analysis</h4>
                <p className="feature-desc">Validate TLS expiration, cryptographic authority, and domain matching on port 443.</p>
              </div>
              <div className="card feature-box">
                <div className="feature-icon-circle"><Activity size={24} /></div>
                <h4 className="feature-title">Web Security Check</h4>
                <p className="feature-desc">Audit HSTS, CSP, X-Frame-Options, nosniff, and cookie security configurations.</p>
              </div>
              <div className="card feature-box">
                <div className="feature-icon-circle"><Users size={24} /></div>
                <h4 className="feature-title">Collaborative Intel</h4>
                <p className="feature-desc">Crowdsourced scam reporting stored in MongoDB combined with external threat feeds.</p>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: DASHBOARD (Brave Browser-Style Statistics) */}
        {activePage === 'dashboard' && (
          <div>
            <div className="stats-header">
              <div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Protection Dashboard</h2>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)' }}>
                  Brave-style privacy & security statistics tracked in MongoDB.
                </p>
              </div>
              {!user && (
                <button className="btn-pill" onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}>
                  Create Free Account to Save Stats
                </button>
              )}
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Websites Analyzed</span>
                  <div className="stat-icon icon-blue"><Globe size={20} /></div>
                </div>
                <div className="stat-number">{stats.totalAnalyzed}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total domains evaluated</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Potential Threats Detected</span>
                  <div className="stat-icon icon-amber"><AlertTriangle size={20} /></div>
                </div>
                <div className="stat-number" style={{ color: 'var(--warning-text)' }}>{stats.potentialThreats}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Typosquats & suspicious indicators</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Confirmed Malicious URLs</span>
                  <div className="stat-icon icon-red"><XCircle size={20} /></div>
                </div>
                <div className="stat-number" style={{ color: 'var(--danger-text)' }}>{stats.confirmedMalicious}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Blacklisted phishing or malware</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Threats Blocked</span>
                  <div className="stat-icon icon-green"><ShieldCheck size={20} /></div>
                </div>
                <div className="stat-number" style={{ color: 'var(--safe-text)' }}>{stats.threatsBlocked}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Prevented navigations & actions</div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Protection Summary</h3>
              {stats.totalAnalyzed === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  No scanning activity recorded yet. Enter a website URL on the Home tab to begin analyzing websites and building your protection telemetry.
                </p>
              ) : (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                  UnMasker has evaluated <strong>{stats.totalAnalyzed}</strong> website(s) for your account, successfully flagging <strong>{stats.potentialThreats}</strong> suspicious candidate(s) and preventing <strong>{stats.threatsBlocked}</strong> potential attack interaction(s).
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: SCAN RESULTS */}
        {activePage === 'results' && scanResult && (
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
                <button
                  className="btn-pill"
                  style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                  onClick={() => {
                    navigator.clipboard.writeText(`UnMasker Security Audit: ${scanResult.url} - Score: ${scanResult.trust_score}/100 (${scanResult.risk_level})`);
                    showToast('Scan result summary copied to clipboard!', 'success');
                  }}
                >
                  <Share2 size={15} /> Share
                </button>

                <button
                  className="btn-pill"
                  style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                  onClick={() => window.print()}
                  title="Print or Save PDF Report"
                >
                  <Printer size={15} /> Export PDF
                </button>

                <button
                  className="btn-pill"
                  style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' }}
                  onClick={() => {
                    setReportForm({ url: scanResult.url, category: 'Phishing', description: `Flagged as ${scanResult.risk_level} during UnMasker audit.` });
                    setReportModalOpen(true);
                  }}
                >
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
        )}

        {/* VIEW: THREAT INTEL */}
        {activePage === 'intel' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldAlert size={28} color="var(--primary)" />
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Threat Intelligence</h2>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                Community-reported suspicious and malicious websites.
              </p>
            </div>

            {/* Threat Intel Controls: Search & Category Chips */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['All', 'Phishing', 'Brand Impersonation', 'Fake Payment Portal', 'Financial Fraud'].map((cat) => (
                  <button
                    key={cat}
                    className="chip"
                    style={{
                      background: intelCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                      color: intelCategory === cat ? '#ffffff' : 'var(--text-main)',
                      borderColor: intelCategory === cat ? 'var(--primary)' : 'var(--border)'
                    }}
                    onClick={() => setIntelCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter by domain or notes..."
                  value={intelSearch}
                  onChange={(e) => setIntelSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
              {/* Left Column: Reports Table */}
              <div className="card" style={{ padding: '0.5rem 1.25rem', overflowX: 'auto' }}>
                {reports.filter(r => {
                  const matchCat = intelCategory === 'All' || r.category === intelCategory;
                  const matchSearch = !intelSearch || r.domain.toLowerCase().includes(intelSearch.toLowerCase()) || (r.description && r.description.toLowerCase().includes(intelSearch.toLowerCase()));
                  return matchCat && matchSearch;
                }).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No matching threat reports found for your filter criteria.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '1rem 0' }}>Website</th>
                        <th>Risk Level</th>
                        <th>Reports</th>
                        <th>Last Reported</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.filter(r => {
                        const matchCat = intelCategory === 'All' || r.category === intelCategory;
                        const matchSearch = !intelSearch || r.domain.toLowerCase().includes(intelSearch.toLowerCase()) || (r.description && r.description.toLowerCase().includes(intelSearch.toLowerCase()));
                        return matchCat && matchSearch;
                      }).map((rep) => {
                        const count = rep.reportsCount || 1;
                        const risk = rep.riskLevel || (count >= 5 ? 'High' : 'Medium');
                        return (
                          <tr key={rep.id || rep._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="mono" style={{ padding: '0.9rem 0', fontWeight: 700, color: 'var(--text-main)' }}>
                              <span
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                title="Click to analyze domain"
                                onClick={() => {
                                  setUrlInput(rep.url || `https://${rep.domain}`);
                                  triggerScan(rep.url || `https://${rep.domain}`);
                                }}
                              >
                                {rep.domain}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: risk === 'High' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                                color: risk === 'High' ? 'var(--danger-text)' : 'var(--warning-text)'
                              }}>
                                {risk}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{count}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              {new Date(rep.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Right Column: Help Make the Web Safer CTA Card */}
              <div className="card" style={{ textAlign: 'center', padding: '2.25rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Users size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Help Make the Web Safer</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Found a suspicious website? Report it to warn others.
                </p>
                <button className="btn-pill" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem' }} onClick={() => setReportModalOpen(true)}>
                  Report a Website
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SCAN HISTORY */}
        {activePage === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Clock size={28} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Scan History</h2>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                  Prior website security evaluations and audit summaries.
                </p>
              </div>
              {history.length > 0 && (
                <button
                  className="btn-pill"
                  style={{ background: 'var(--bg-card)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' }}
                  onClick={() => {
                    localStorage.removeItem('unmasker_history');
                    setHistory([]);
                    showToast('Scan history cleared.', 'info');
                  }}
                >
                  Clear History
                </button>
              )}
            </div>

            <div className="card">
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <Clock size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Scan History Recorded Yet</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Enter any website URL on the Home tab to analyze security threats and build your audit log.
                  </p>
                  <button className="btn-pill" onClick={() => setActivePage('home')}>Go to Scanner</button>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.9rem 0' }}>Website URL</th>
                      <th>Verdict</th>
                      <th>Trust Score</th>
                      <th>Scanned On</th>
                      <th style={{ textAlign: 'right' }}>Audit Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="mono" style={{ padding: '0.9rem 0', fontWeight: 700, color: 'var(--text-main)' }}>
                          {h.url}
                        </td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: h.badge_color === 'danger' ? 'var(--danger-bg)' : (h.badge_color === 'warning' ? 'var(--warning-bg)' : 'var(--safe-bg)'),
                            color: h.badge_color === 'danger' ? 'var(--danger-text)' : (h.badge_color === 'warning' ? 'var(--warning-text)' : 'var(--safe-text)')
                          }}>
                            {h.risk_level}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: h.trust_score >= 70 ? 'var(--safe-text)' : (h.trust_score >= 40 ? 'var(--warning-text)' : 'var(--danger-text)') }}>
                            {h.trust_score} / 100
                          </strong>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(h.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-pill"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              setScanResult(h.data);
                              setActivePage('results');
                              setActiveTab('summary');
                            }}
                          >
                            View Report &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* VIEW: ABOUT */}
        {activePage === 'home' && (
          <div>
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>About UnMasker</h2>
                <p style={{ fontSize: '1rem', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  UnMasker is a unified digital trust platform that combines AI-based threat detection, certificate validation, web security assessment, and collaborative threat intelligence to help users quickly judge whether a website is safe and trustworthy.
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Built with a modern decoupled MERN + Python architecture, UnMasker provides explainable threat evaluations, transparent 0–100 Digital Trust Scoring, and proactive navigation prevention telemetry.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CyberIllustration size={280} />
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>How It Works?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', textAlign: 'center' }}>
                <div style={{ padding: '1.25rem 1rem', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <LinkIcon size={22} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>1. Enter URL</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>Paste the website link you want to check.</p>
                </div>

                <div style={{ padding: '1.25rem 1rem', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Search size={22} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>2. Multi-Layer Analysis</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>Checks for phishing, certificate, security risks and past reports.</p>
                </div>

                <div style={{ padding: '1.25rem 1rem', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Shield size={22} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>3. Trust Score</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>Calculates a digital trust score with clear reasons.</p>
                </div>

                <div style={{ padding: '1.25rem 1rem', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <BarChart2 size={22} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>4. Get the Report</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>View an easy-to-understand summary and take action.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Report Modal */}
      {reportModalOpen && (
        <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>Report Suspicious Website</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Help protect the community from fraud, phishing, and scam portals.</p>
            <form onSubmit={handleReportSubmit}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Website URL or Domain</label>
              <input
                type="text"
                className="input-field"
                placeholder="https://suspicious-portal.com"
                value={reportForm.url}
                onChange={(e) => setReportForm({ ...reportForm, url: e.target.value })}
                required
              />

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Threat Category</label>
              <select
                className="input-field"
                value={reportForm.category}
                onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
              >
                <option value="Phishing">Phishing</option>
                <option value="Financial Fraud">Financial Fraud</option>
                <option value="Fake Payment Portal">Fake Payment Portal</option>
                <option value="Brand Impersonation">Brand Impersonation</option>
                <option value="Malware">Malware</option>
                <option value="Other">Other</option>
              </select>

              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Description (Optional)</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Describe deceptive behavior or where link was found..."
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-pill" style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border)' }} onClick={() => setReportModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-pill">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authError={authError}
        setAuthError={setAuthError}
        authForm={authForm}
        setAuthForm={setAuthForm}
        handleAuthSubmit={handleAuthSubmit}
      />

      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.85rem 1.25rem', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', fontWeight: 600, fontSize: '0.88rem', zIndex: 1000 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
