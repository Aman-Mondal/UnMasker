
export default function ReportModal({
  reportModalOpen,
  setReportModalOpen,
  reportForm,
  setReportForm,
  handleReportSubmit
}) {
  if (!reportModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Report Suspicious Website
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Help protect the community from fraud, phishing, and scam portals.
        </p>

        <form onSubmit={handleReportSubmit}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Website URL or Domain
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="https://suspicious-portal.com"
            value={reportForm.url}
            onChange={(e) => setReportForm({ ...reportForm, url: e.target.value })}
            required
          />

          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Threat Category
          </label>
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

          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Description (Optional)
          </label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Describe deceptive behavior or where link was found..."
            value={reportForm.description}
            onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-pill"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
              onClick={() => setReportModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-pill">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
