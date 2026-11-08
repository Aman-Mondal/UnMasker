import {
  Shield,
  Sun,
  Moon,
  LogOut,
  LogIn
} from 'lucide-react';

function Navbar({
  activePage,
  setActivePage,
  theme,
  setTheme,
  user,
  handleLogout,
  setAuthMode,
  setAuthModalOpen
}) {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand" onClick={() => setActivePage('home')}>
          <div className="brand-icon">
            <Shield size={20} />
          </div>
          <div>
            <span className="brand-text">UnMasker</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            Home
          </button>

          <button
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            Dashboard
          </button>

          <button
            className={`nav-item ${activePage === 'intel' ? 'active' : ''}`}
            onClick={() => setActivePage('intel')}
          >
            Threat Intel
          </button>

          <button
            className={`nav-item ${activePage === 'history' ? 'active' : ''}`}
            onClick={() => setActivePage('history')}
          >
            History
          </button>
        </nav>

        <div className="nav-actions">
          <button
            className="btn-icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                {user.name}
              </span>

              <button
                className="btn-icon"
                onClick={handleLogout}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn-pill"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)'
              }}
              onClick={() => {
                setAuthMode('login');
                setAuthModalOpen(true);
              }}
            >
              <LogIn size={15} /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;