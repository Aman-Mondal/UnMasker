
import React from 'react';

export default function AuthModal({
  authModalOpen,
  setAuthModalOpen,
  authMode,
  setAuthMode,
  authError,
  setAuthError,
  authForm,
  setAuthForm,
  handleAuthSubmit
}) {
  if (!authModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          <button
            style={{ background: 'none', border: 'none', padding: '0.5rem 0', fontWeight: 700, color: authMode === 'login' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: authMode === 'login' ? '2px solid var(--primary)' : 'none', cursor: 'pointer' }}
            onClick={() => { setAuthMode('login'); setAuthError(''); }}
          >
            Sign In
          </button>
          <button
            style={{ background: 'none', border: 'none', padding: '0.5rem 0', fontWeight: 700, color: authMode === 'register' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: authMode === 'register' ? '2px solid var(--primary)' : 'none', cursor: 'pointer' }}
            onClick={() => { setAuthMode('register'); setAuthError(''); }}
          >
            Register
          </button>
        </div>

        {authError && (
          <div style={{ padding: '0.5rem 0.75rem', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {authError}
          </div>
        )}

        <form onSubmit={handleAuthSubmit}>
          {authMode === 'register' && (
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Alex Morgan"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
              />
            </div>
          )}

          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
          <input
            type="email"
            className="input-field"
            placeholder="name@example.com"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            required
          />

          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            required
          />

          <button type="submit" className="btn-pill" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {authMode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
