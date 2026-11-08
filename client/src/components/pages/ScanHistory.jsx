
import { Clock } from 'lucide-react';

export default function ScanHistory({
  history,
  setHistory,
  showToast,
  setActivePage,
  setScanResult,
  setActiveTab
}) {
  return (
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
  );
}
