
import React from 'react';
import {
  Shield,
  ShieldAlert,
  Search,
  Link as LinkIcon,
  Lock,
  Users,
  Activity
} from 'lucide-react';
import CyberIllustration from '../../CyberIllustration';

export default function HomePage({
  urlInput,
  setUrlInput,
  triggerScan,
  isScanning
}) {
  return (
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
            <button
              className="btn-search"
              onClick={() => triggerScan()}
              disabled={isScanning}
            >
              <Search size={16} />
              <span>{isScanning ? 'Analyzing...' : 'Scan Website'}</span>
            </button>
          </div>

          <div className="quick-chips">
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Try verified test cases:
            </span>
            <button className="chip" onClick={() => {
              setUrlInput('https://www.netflix.com/');
              triggerScan('https://www.netflix.com/');
            }}>
              netflix.com (Genuine)
            </button>
            <button className="chip" onClick={() => {
              setUrlInput('https://netfiixgt.com/');
              triggerScan('https://netfiixgt.com/');
            }}>
              netfiixgt.com (Impersonation)
            </button>
            <button className="chip" onClick={() => {
              setUrlInput('https://www.google.com/');
              triggerScan('https://www.google.com/');
            }}>
              google.com (Genuine)
            </button>
            <button className="chip" onClick={() => {
              setUrlInput('https://www.microsoft.com/');
              triggerScan('https://www.microsoft.com/');
            }}>
              microsoft.com (Genuine)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CyberIllustration size={380} />
        </div>
      </section>

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
  );
}
