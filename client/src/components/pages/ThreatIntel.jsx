
import {
  ShieldAlert,
  Search,
  Users
} from 'lucide-react';

export default function ThreatIntel({
  intelCategory,
  setIntelCategory,
  intelSearch,
  setIntelSearch,
  reports,
  setUrlInput,
  triggerScan,
  setReportModalOpen
}) {
  return (
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
  );
}
