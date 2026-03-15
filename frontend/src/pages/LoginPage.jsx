import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { login as apiLogin, register as apiRegister, firebaseLogin } from '../services/api';
import { useAuth } from '../App';
import deepVisionLogo from '../styles/logo.png';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await apiRegister({ name, email, password, role });
        login(res.data.user, res.data.token);
      } else {
        const res = await apiLogin({ email, password });
        login(res.data.user, res.data.token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const res = await firebaseLogin({
        firebaseUid: fbUser.uid,
        name: fbUser.displayName,
        email: fbUser.email,
        role,
      });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --navy-950: #00101f;
          --navy-900: #00152b;
          --navy-700: #002B5B;
          --navy-500: #00509E;
          --navy-300: #3b82c4;
          --accent: #38bdf8;
          --accent-glow: rgba(56, 189, 248, 0.35);
          --white: #ffffff;
          --slate-50: #f8fafc;
          --slate-100: #f1f5f9;
          --slate-200: #e2e8f0;
          --slate-400: #94a3b8;
          --slate-500: #64748b;
          --slate-700: #334155;
          --red-light: #fef2f2;
          --red: #dc2626;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'Sora', sans-serif; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.6; }
          70%  { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes scan-line {
          0%   { top: 15%; opacity: 0.9; }
          50%  { opacity: 0.6; }
          100% { top: 85%; opacity: 0.9; }
        }
        @keyframes rotate-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes counter-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }

        .dv-page {
          display: flex;
          min-height: 100vh;
          font-family: 'Sora', sans-serif;
          background: var(--navy-950);
        }

        /* # LEFT PANEL */
        .dv-left {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          overflow: hidden;
          background: linear-gradient(145deg, var(--navy-950) 0%, var(--navy-900) 45%, #001f40 100%);
        }

        .dv-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(56,189,248,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .dv-left::after {
          content: '';
          position: absolute;
          bottom: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 300px;
          background: radial-gradient(ellipse at center, rgba(0,80,158,0.4) 0%, transparent 70%);
          pointer-events: none;
        }

        .dv-hero {
          position: relative;
          z-index: 2;
          max-width: 460px;
          color: var(--white);
          animation: fadeIn 1s ease-out forwards;
        }

        .dv-logo {
  width: 120px;
  height: 120px;
  border-radius: 80%;
  object-fit: cover;
  border: 3px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
}

        .dv-brand {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.28em;
          color: var(--accent);
          font-family: 'DM Mono', monospace;
          text-transform: uppercase;
          margin-bottom: 12px;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }

        .dv-title {
          font-size: 52px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: var(--white);
          margin-bottom: 20px;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s both;
        }

        .dv-title span {
          color: var(--accent);
        }

        .dv-sub {
          font-size: 15px;
          font-weight: 300;
          color: rgba(255,255,255,0.6);
          line-height: 1.7;
          margin-bottom: 40px;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s both;
        }

        .dv-pills {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.45s both;
        }

        .dv-pill {
          background: rgba(56,189,248,0.08);
          border: 1px solid rgba(56,189,248,0.25);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.05em;
          backdrop-filter: blur(8px);
        }

        .dv-eye-wrap {
          position: absolute;
          right: -80px;
          top: 50%;
          transform: translateY(-50%);
          width: 380px;
          height: 380px;
          opacity: 0.18;
          pointer-events: none;
        }

        .dv-eye-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid var(--accent);
        }

        .dv-eye-ring.r1 { inset: 0; animation: rotate-ring 18s linear infinite; }
        .dv-eye-ring.r2 { inset: 30px; border-style: dashed; animation: counter-rotate 12s linear infinite; }
        .dv-eye-ring.r3 { inset: 60px; animation: rotate-ring 25s linear infinite; }
        .dv-eye-ring.r4 { inset: 90px; border-style: dashed; opacity: 0.5; animation: counter-rotate 20s linear infinite; }

        .dv-eye-center {
          position: absolute;
          inset: 130px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.4) 0%, transparent 70%);
          animation: pulse-ring 3s ease-in-out infinite;
        }

        .dv-scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          animation: scan-line 3.5s ease-in-out infinite;
        }

        /* # RIGHT PANEL */
        .dv-right {
          width: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: var(--slate-100);
          position: relative;
        }

        .dv-card {
          width: 100%;
          max-width: 440px;
          background: var(--white);
          border-radius: 28px;
          padding: 48px 44px;
          box-shadow: 0 24px 80px rgba(0,21,43,0.10), 0 4px 16px rgba(0,21,43,0.06);
          animation: fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }

        .dv-card-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--navy-500);
          text-align: center;
          margin-bottom: 8px;
          animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }

        .dv-card-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--navy-700);
          text-align: center;
          margin-bottom: 32px;
          letter-spacing: -0.02em;
          animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both;
        }

        .dv-role-row {
          display: flex;
          gap: 10px;
          margin-bottom: 28px;
          background: var(--slate-100);
          border-radius: 14px;
          padding: 5px;
          animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }

        .dv-role-btn {
          flex: 1;
          padding: 10px 0;
          border: none;
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          color: var(--slate-400);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .dv-role-btn:hover:not(.active) {
          color: var(--slate-700);
          background: rgba(0,0,0,0.03);
        }

        .dv-role-btn.active {
          background: var(--white);
          color: var(--navy-700);
          box-shadow: 0 2px 8px rgba(0,21,43,0.10);
        }

        .dv-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 13px 0;
          border: 1.5px solid var(--slate-200);
          border-radius: 14px;
          background: var(--white);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          color: var(--slate-700);
          margin-bottom: 22px;
          transition: all 0.2s ease;
          animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both;
        }

        .dv-google-btn:hover:not(:disabled) {
          border-color: #aac4e0;
          background: var(--slate-50);
          box-shadow: 0 2px 8px rgba(0,43,91,0.08);
          transform: translateY(-1px);
        }

        .dv-or {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
          animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both;
        }

        .dv-or-line {
          flex: 1;
          height: 1px;
          background: var(--slate-200);
        }

        .dv-or-text {
          font-size: 12px;
          color: var(--slate-400);
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.05em;
        }

        .dv-form { animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.45s both; }

        .dv-form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .dv-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--slate-500);
          letter-spacing: 0.04em;
          font-family: 'DM Mono', monospace;
          text-transform: uppercase;
        }

        .dv-input-wrap {
          position: relative;
        }

        .dv-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--slate-200);
          font-size: 14px;
          font-family: 'Sora', sans-serif;
          background: var(--slate-50);
          color: var(--slate-700);
          transition: all 0.2s ease;
        }

        .dv-input:focus {
          border-color: var(--navy-500);
          box-shadow: 0 0 0 3.5px rgba(0,80,158,0.10);
          outline: none;
          background: var(--white);
        }

        .dv-input::placeholder {
          color: var(--slate-400);
        }

        .dv-pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--slate-400);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }

        .dv-pw-toggle:hover { color: var(--navy-700); }

        .dv-error {
          font-size: 13px;
          color: var(--red);
          background: var(--red-light);
          padding: 11px 16px;
          border-radius: 10px;
          border: 1px solid #fca5a5;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dv-submit {
          width: 100%;
          padding: 14px 0;
          margin-top: 8px;
          background: linear-gradient(135deg, var(--navy-700) 0%, var(--navy-500) 100%);
          color: var(--white);
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          min-height: 52px;
          letter-spacing: 0.01em;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(0,43,91,0.25);
        }

        .dv-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,43,91,0.30);
        }

        .dv-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0,43,91,0.2);
        }

        .dv-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .dv-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .dv-toggle {
          margin-top: 24px;
          font-size: 14px;
          color: var(--slate-500);
          text-align: center;
          animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both;
        }

        .dv-toggle-btn {
          background: none;
          border: none;
          color: var(--navy-500);
          font-weight: 700;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          margin-left: 4px;
          transition: color 0.15s;
        }

        .dv-toggle-btn:hover { color: var(--navy-700); }

        @media (max-width: 860px) {
          .dv-left { display: none; }
          .dv-right { width: 100%; }
        }
      `}</style>

      <div className="dv-page">
        {}
        <div className="dv-left">
          {}
          <div className="dv-eye-wrap">
            <div className="dv-eye-ring r1" />
            <div className="dv-eye-ring r2" />
            <div className="dv-eye-ring r3" />
            <div className="dv-eye-ring r4" />
            <div className="dv-eye-center" />
            <div className="dv-scan-line" />
          </div>

          <div className="dv-hero">
            <img src={deepVisionLogo} alt="DeepVision Logo" className="dv-logo" />
            <p className="dv-brand">Ocular AI Platform</p>
            <h1 className="dv-title">
              Deep<span>Vision</span>
            </h1>
            <p className="dv-sub">
              Advanced AI-powered detection for Glaucoma,
              Cataract, and Diabetic Retinopathy — powered by
              EfficientNet-B3 with Grad-CAM visualization.
            </p>
            <div className="dv-pills">
              {['EfficientNet-B3', 'Grad-CAM', 'Multi-Disease', 'HIPAA'].map((t) => (
                <span key={t} className="dv-pill">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {}
        <div className="dv-right">
          <div className="dv-card">
            <p className="dv-card-eyebrow">
              {mode === 'login' ? 'Secure Access' : 'New Account'}
            </p>
            <h2 className="dv-card-title">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>

            {}
            <div className="dv-role-row">
              {[
                { value: 'patient', label: 'Patient', icon: '👤' },
                { value: 'doctor', label: 'Doctor', icon: '🩺' },
              ].map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`dv-role-btn${role === r.value ? ' active' : ''}`}
                >
                  <span>{r.icon}</span> {r.label}
                </button>
              ))}
            </div>

            {}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="dv-google-btn"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                width={18}
              />
              Continue with Google
            </button>

            {}
            <div className="dv-or">
              <div className="dv-or-line" />
              <span className="dv-or-text">or</span>
              <div className="dv-or-line" />
            </div>

            {}
            <form onSubmit={handleEmail} className="dv-form">
              {mode === 'register' && (
                <div className="dv-form-group">
                  <label className="dv-label">Full Name</label>
                  <div className="dv-input-wrap">
                    <input
                      className="dv-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Dr. Jane Smith"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="dv-form-group">
                <label className="dv-label">Email Address</label>
                <div className="dv-input-wrap">
                  <input
                    type="email"
                    className="dv-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="dv-form-group">
                <label className="dv-label">Password</label>
                <div className="dv-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="dv-input"
                    style={{ paddingRight: 44 }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="dv-pw-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="dv-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="dv-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="dv-spinner" />
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <p className="dv-toggle">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                className="dv-toggle-btn"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}