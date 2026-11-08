
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
      <div
        className="modal-content auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-header">
          <div className="auth-icon">
            🛡️
          </div>
          <h2>{authMode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
          <p>
            {authMode === 'register'
              ? 'Join UnMasker and take control of your digital safety.'
              : 'Sign in to continue to UnMasker.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={authMode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setAuthMode('login'); setAuthError(''); }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={authMode === 'register' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setAuthMode('register'); setAuthError(''); }}
            type="button"
          >
            Create Account
          </button>
        </div>

        {authError && (
          <div className="auth-error">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="auth-form">
          {authMode === 'register' && (
            <div className="auth-field">
              <label>Full Name</label>
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

          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-pill auth-submit">
            {authMode === 'register' ? 'Create Account' : 'Sign In'}
            <span>→</span>
          </button>
        </form>

        <div className="auth-footer">
          <span>🛡️</span> Your security matters. Your credentials are protected.
        </div>
      </div>
    </div>
  );

}
