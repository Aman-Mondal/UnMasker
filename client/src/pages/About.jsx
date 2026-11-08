
import {
  Link as LinkIcon,
  Search,
  Shield,
  BarChart2
} from 'lucide-react';
import CyberIllustration from '../../CyberIllustration';

export default function About() {
  return (
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
  );
}
