import {
  Globe,
  AlertTriangle,
  XCircle,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard({
  stats,
  user,
  setAuthMode,
  setAuthModalOpen
}) {
  return (
    <div>
      <div className="stats-header">
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Protection Dashboard</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)' }}>
            Brave-style privacy & security statistics tracked in MongoDB.
          </p>
        </div>
        {!user && (
          <button className="btn-pill" onClick={() => {
            setAuthMode('register');
            setAuthModalOpen(true);
          }}>
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
  );
}
