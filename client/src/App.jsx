import Navbar from './components/layout/navbar';
import AuthModal from './components/auth/AuthModal';
import HomePage from './components/pages/HomePage';
import Dashboard from './components/pages/Dashboard';
import ScanResults from './components/pages/ScanResults';
import ThreatIntel from './components/pages/ThreatIntel';
import ScanHistory from './components/pages/ScanHistory';
import About from './components/pages/About';
import ReportModal from './components/modals/ReportModal';
import Toast from './components/common/Toast';

import React, { useState, useEffect } from 'react';

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('unmasker_theme') || 'light');
  const [activePage, setActivePage] = useState('home');
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  // Scan History State
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unmasker_history') || '[]');
    } catch (_) {
      return [];
    }
  });

  // Auth State
  const [token, setToken] = useState(localStorage.getItem('unmasker_token') || null);
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Protection Statistics (Brave-style)
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    potentialThreats: 0,
    confirmedMalicious: 0,
    threatsBlocked: 0,
    lastScanDate: null
  });

  // Community Reports State
  const [reports, setReports] = useState([]);
  const [intelCategory, setIntelCategory] = useState('All');
  const [intelSearch, setIntelSearch] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ url: '', category: 'Phishing', description: '' });
  const [toast, setToast] = useState(null);

  // Synchronize theme with html attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('unmasker_theme', theme);
  }, [theme]);

  // Fetch current user and stats
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            if (data.user.stats) setStats(data.user.stats);
          } else {
            handleLogout();
          }
        })
        .catch(() => { });
    } else {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.stats) setStats(data.stats);
        })
        .catch(() => { });
    }
  }, [token]);

  // Fetch community reports when visiting threat intel page
  useEffect(() => {
    if (activePage === 'intel') {
      fetch('/api/reports')
        .then(res => res.json())
        .then(data => {
          if (data.success) setReports(data.reports);
        })
        .catch(() => { });
    }
  }, [activePage]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem('unmasker_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('unmasker_token', data.token);
        setToken(data.token);
        setUser(data.user);
        if (data.user.stats) setStats(data.user.stats);
        setAuthModalOpen(false);
        setAuthForm({ name: '', email: '', password: '' });
        showToast(`Welcome back, ${data.user.name}!`, 'success');
      } else {
        setAuthError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setAuthError('Network error connecting to UnMasker server.');
    }
  };

  const triggerScan = async (targetUrl) => {
    const cleanUrl = (targetUrl || urlInput).trim();
    if (!cleanUrl) {
      showToast('Please enter a website URL.', 'warning');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: cleanUrl })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setScanResult(data);
        setActivePage('results');
        setActiveTab('summary');
        if (data.updatedUserStats) setStats(data.updatedUserStats);

        // Record in scan history
        const item = {
          id: Date.now(),
          url: cleanUrl,
          domain: data.domain,
          trust_score: data.trust_score,
          risk_level: data.risk_level,
          badge_color: data.badge_color,
          date: new Date().toISOString(),
          data: data
        };
        setHistory(prev => {
          const updated = [item, ...prev.filter(h => h.url !== cleanUrl)].slice(0, 20);
          localStorage.setItem('unmasker_history', JSON.stringify(updated));
          return updated;
        });
      } else {
        showToast(data.error || 'Scan analysis failed.', 'error');
      }
    } catch (err) {
      showToast('Error communicating with backend analysis service.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRecordBlock = async () => {
    if (!token) {
      showToast('Sign in to track your personal threat prevention statistics.', 'info');
      return;
    }
    try {
      const res = await fetch('/api/scan/record-block', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        showToast('Navigation blocked. Protection statistics updated!', 'success');
      }
    } catch (_) { }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers,
        body: JSON.stringify(reportForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message, 'success');
        setReportModalOpen(false);
        setReportForm({ url: '', category: 'Phishing', description: '' });
        if (activePage === 'intel') {
          const fresh = await fetch('/api/reports').then(r => r.json());
          if (fresh.success) setReports(fresh.reports);
        }
      } else {
        showToast(data.error || 'Failed to submit report.', 'error');
      }
    } catch (err) {
      showToast('Network error submitting report.', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        theme={theme}
        setTheme={setTheme}
        user={user}
        handleLogout={handleLogout}
        setAuthMode={setAuthMode}
        setAuthModalOpen={setAuthModalOpen}
      />

      {/* Main Content */}
      <main className="main-wrapper">
        {/* VIEW: HOME */}
        {activePage === 'home' && (
          <HomePage
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            triggerScan={triggerScan}
            isScanning={isScanning}
          />
        )}

        {/* VIEW: DASHBOARD */}
        {activePage === 'dashboard' && (
          <Dashboard
            stats={stats}
            user={user}
            setAuthMode={setAuthMode}
            setAuthModalOpen={setAuthModalOpen}
          />
        )}

        {/* VIEW: SCAN RESULTS */}
        {activePage === 'results' && scanResult && (
          <ScanResults
            scanResult={scanResult}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setActivePage={setActivePage}
            showToast={showToast}
            setReportForm={setReportForm}
            setReportModalOpen={setReportModalOpen}
            handleRecordBlock={handleRecordBlock}
          />
        )}

        {/* VIEW: THREAT INTEL */}
        {activePage === 'intel' && (
          <ThreatIntel
            intelCategory={intelCategory}
            setIntelCategory={setIntelCategory}
            intelSearch={intelSearch}
            setIntelSearch={setIntelSearch}
            reports={reports}
            setUrlInput={setUrlInput}
            triggerScan={triggerScan}
            setReportModalOpen={setReportModalOpen}
          />
        )}

        {/* VIEW: SCAN HISTORY */}
        {activePage === 'history' && (
          <ScanHistory
            history={history}
            setHistory={setHistory}
            showToast={showToast}
            setActivePage={setActivePage}
            setScanResult={setScanResult}
            setActiveTab={setActiveTab}
          />
        )}

        {/* VIEW: ABOUT */}
        {activePage === 'home' && <About />}
      </main>

      {/* Global Report Modal */}
      <ReportModal
        reportModalOpen={reportModalOpen}
        setReportModalOpen={setReportModalOpen}
        reportForm={reportForm}
        setReportForm={setReportForm}
        handleReportSubmit={handleReportSubmit}
      />

      {/* Auth Modal */}
      <AuthModal
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authError={authError}
        setAuthError={setAuthError}
        authForm={authForm}
        setAuthForm={setAuthForm}
        handleAuthSubmit={handleAuthSubmit}
      />

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}
