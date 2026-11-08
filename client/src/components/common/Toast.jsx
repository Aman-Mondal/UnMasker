
export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        padding: '0.85rem 1.25rem',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-lg)',
        fontWeight: 600,
        fontSize: '0.88rem',
        zIndex: 1000
      }}
    >
      {toast.msg}
    </div>
  );
}
