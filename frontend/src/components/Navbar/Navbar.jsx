import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';

/* # Icons */
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = () => setUserMenuOpen(false);
    if (userMenuOpen) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [userMenuOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = user?.role === 'doctor'
    ? [
        { to: '/dashboard',         label: 'Dashboard' },
        { to: '/doctor',            label: 'Doctor Panel' },
        { to: '/patients/register', label: 'New Patient' },
      ]
    : [
        { to: '/dashboard',         label: 'Dashboard' },
        { to: '/patients/register', label: 'New Scan' },
      ];

  const isDoctor  = user?.role === 'doctor';
  const initials  = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <>
      <style>{css}</style>
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }} className="dv-nav">

        {/* # Brand */}
        <Link to="/dashboard" style={s.brand} className="dv-brand">
          <div style={s.logoWrap}>
            <img
              src="/styles/logo.png"
              alt="deepVision logo"
              style={s.logo}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
          <div style={s.brandText}>
            <span style={s.brandName}>deep<span style={s.brandAccent}>Vision</span></span>
          </div>
        </Link>

        {/* # Divider */}
        <div style={s.divider} />

        {/* # Nav links */}
        <div style={s.links}>
          {navLinks.map((l) => {
            const active = loc.pathname === l.to ||
              (l.to !== '/dashboard' && loc.pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                style={{ ...s.link, ...(active ? s.linkActive : {}) }}
                className={`dv-link${active ? ' active' : ''}`}
              >
                {active && <span style={s.linkDot} />}
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* # Right side */}
        <div style={s.right}>

          {}
          <span style={{ ...s.roleBadge, ...(isDoctor ? s.roleBadgeDoctor : s.roleBadgePatient) }}>
            {isDoctor ? 'Doctor' : 'Patient'}
          </span>

          {}
          <div
            style={s.userBtn}
            className="dv-user-btn"
            onClick={e => { e.stopPropagation(); setUserMenuOpen(v => !v); }}
          >
            <div style={s.avatar}>{initials}</div>
            <span style={s.userName}>{user?.name}</span>
            <span style={{ ...s.chevron, transform: userMenuOpen ? 'rotate(180deg)' : 'none' }}>
              <ChevronIcon />
            </span>
          </div>

          {}
          {userMenuOpen && (
            <div style={s.dropdown} className="dv-dropdown">
              <div style={s.dropHeader}>
                <div style={{ ...s.avatar, ...s.avatarLg }}>{initials}</div>
                <div>
                  <p style={s.dropName}>{user?.name}</p>
                  <p style={s.dropRole}>{user?.role}</p>
                </div>
              </div>
              <div style={s.dropDivider} />
              <button style={s.dropLogout} onClick={handleLogout} className="dv-logout-btn">
                <LogoutIcon />
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      {}
      <div style={{ height: 64 }} />
    </>
  );
}

/* # Styles */
const s = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
    height: 64,
    display: 'flex', alignItems: 'center',
    padding: '0 28px', gap: 0,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(226,232,240,0.8)',
    transition: 'box-shadow 0.25s ease',
    fontFamily: "'DM Sans', sans-serif",
  },
  navScrolled: {
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },

  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    textDecoration: 'none', flexShrink: 0, marginRight: 8,
  },
  logoWrap: {
    width: 34, height: 34,
    borderRadius: 10,
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#1e1b4b,#3730a3)',
    flexShrink: 0,
  },
  logo: {
    width: '100%', height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  brandText: { display: 'flex', flexDirection: 'column', lineHeight: 1 },
  brandName: {
    fontSize: 19, fontWeight: 800, color: '#0f172a',
    letterSpacing: '-0.5px', fontFamily: "'DM Sans', sans-serif",
  },
  brandAccent: { color: '#6366f1' },

  divider: {
    width: 1, height: 28, background: '#e2e8f0',
    margin: '0 20px', flexShrink: 0,
  },

  links: { display: 'flex', gap: 2, flex: 1, alignItems: 'center' },
  link:  {
    textDecoration: 'none',
    padding: '7px 14px',
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    color: '#64748b',
    transition: 'all 0.15s',
    display: 'flex', alignItems: 'center', gap: 6,
    position: 'relative',
  },
  linkActive: {
    color: '#6366f1',
    background: '#eef2ff',
  },
  linkDot: {
    width: 5, height: 5, borderRadius: '50%',
    background: '#6366f1', flexShrink: 0,
  },

  right: { display: 'flex', alignItems: 'center', gap: 10, position: 'relative' },

  roleBadge: {
    fontSize: 11, fontWeight: 700,
    padding: '3px 10px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  roleBadgeDoctor:  { background: '#ede9fe', color: '#7c3aed' },
  roleBadgePatient: { background: '#e0f2fe', color: '#0369a1' },

  userBtn: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '6px 12px 6px 6px',
    borderRadius: 12,
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    background: '#fafafa',
    transition: 'all 0.15s',
    userSelect: 'none',
  },
  avatar: {
    width: 30, height: 30, borderRadius: 8,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff', fontSize: 12, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLg: { width: 38, height: 38, borderRadius: 10, fontSize: 14 },
  userName: { fontSize: 13, fontWeight: 700, color: '#1e293b', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chevron:  { color: '#94a3b8', transition: 'transform 0.2s', display: 'flex' },

  dropdown: {
    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    minWidth: 220,
    overflow: 'hidden',
    zIndex: 300,
    animation: 'dropIn 0.18s cubic-bezier(0.16,1,0.3,1) both',
  },
  dropHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' },
  dropName:   { fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 },
  dropRole:   { fontSize: 11, color: '#94a3b8', margin: '2px 0 0', textTransform: 'capitalize' },
  dropDivider:{ height: 1, background: '#f1f5f9' },
  dropLogout: {
    display: 'flex', alignItems: 'center', gap: 9,
    width: '100%', padding: '12px 16px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, color: '#ef4444',
    textAlign: 'left', transition: 'background 0.15s',
  },
};

/* # CSS */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .dv-nav { animation: navSlide 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes navSlide { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

  .dv-brand:hover .dv-logo-wrap { transform: scale(1.05); }

  .dv-link:not(.active):hover { background:#f8fafc !important; color:#4f46e5 !important; }

  .dv-user-btn:hover { background:#f1f5f9 !important; border-color:#c7d2fe !important; }

  .dv-logout-btn:hover { background:#fff5f5 !important; }

  @keyframes dropIn { from { opacity:0; transform:translateY(-8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
`;