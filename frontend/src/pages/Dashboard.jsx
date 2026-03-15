import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getMyPatientRecord, getPatients, getPatientReports, getAllReports } from '../services/api';

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtRelative = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso);
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return fmt(iso);
};

function PatientDashboard({ user }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const pRes = await getMyPatientRecord();
        const pData = pRes.data?.data ?? pRes.data;
        setPatientInfo(pData);

        const patientId = pData?._id;
        if (patientId) {
          const rRes = await getPatientReports(patientId);
          const raw = rRes.data?.data || rRes.data || [];
          const sorted = [...raw].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setReports(sorted);
        }
      } catch (e) {
        if (e.response?.status === 404) {
          setNoProfile(true);
        } else {
          console.error('Dashboard load error:', e);
          setError('Failed to load your data.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalScans    = reports.length;
  const positiveScans = reports.filter(r => r.results?.some(x => x.prediction !== 'Normal')).length;
  const normalScans   = reports.filter(r => r.results?.every(x => x.prediction === 'Normal')).length;
  const lastScan      = reports[0]?.createdAt;
  const initials      = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'P';

  if (loading) return <Loader />;

  if (noProfile) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: '0 24px', fontFamily: 'Sora, sans-serif' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}></div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Complete your profile</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
          You haven't set up your patient profile yet. Fill in your details to get started.
        </p>
        <button
          onClick={() => navigate('/patients/register')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
            border: 'none', padding: '12px 32px', borderRadius: 14, fontSize: 15,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
          }}
        >
          Set Up Profile →
        </button>
      </div>
    );
  }

  return (
    <div className="pd-root">
      <GlobalStyles />

      <header className="pd-hero">
        <div className="pd-hero-noise" />
        <div className="pd-hero-content">
          <div className="pd-avatar">{initials}</div>
          <div className="pd-hero-text">
            <span className="pd-greeting">Welcome back</span>
            <h1 className="pd-name">{user?.name}</h1>
            {patientInfo && (
              <div className="pd-meta">
                <span className="pd-chip">ID {patientInfo.patientId}</span>
                <span className="pd-chip">{patientInfo.age} yrs</span>
                <span className="pd-chip">{patientInfo.gender}</span>
              </div>
            )}
          </div>
        </div>

        <button
          className="pd-cta"
          onClick={() => navigate(patientInfo ? `/upload/${patientInfo._id}` : `/upload`)}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          New Scan
        </button>
      </header>

      {error && (
        <div className="pd-error">
          <WarningIcon /> {error}
        </div>
      )}

      {!error && (
        <div className="pd-stats">
          {[
            { label: 'Total Scans',    value: totalScans,    accent: '#60a5fa', icon: ScanIcon },
            { label: 'Normal',         value: normalScans,   accent: '#34d399', icon: CheckIcon },
            { label: 'Findings Found', value: positiveScans, accent: '#f87171', icon: AlertIcon },
            { label: 'Last Scan',      value: fmtRelative(lastScan), accent: '#a78bfa', icon: CalIcon, small: true },
          ].map((s, i) => (
            <div className="pd-stat-card" key={s.label} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="pd-stat-icon" style={{ color: s.accent, background: s.accent + '18' }}>
                <s.icon />
              </div>
              <div className="pd-stat-val" style={{ color: s.accent, fontSize: s.small ? 20 : 36 }}>
                {s.value}
              </div>
              <div className="pd-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {!error && (
        <section className="pd-section">
          <div className="pd-section-head">
            <h2 className="pd-section-title">Scan History</h2>
            <span className="pd-badge-count">{totalScans} report{totalScans !== 1 ? 's' : ''}</span>
          </div>

          {reports.length === 0 ? (
            <div className="pd-empty">
              <div className="pd-empty-icon"><ScanIcon /></div>
              <p className="pd-empty-title">No scans uploaded yet</p>
              <p className="pd-empty-sub">Your scan reports will appear here once uploaded.</p>
              <button
                className="pd-cta"
                style={{ marginTop: 20 }}
                onClick={() => navigate(patientInfo ? `/upload/${patientInfo._id}` : `/upload`)}
              >
                Upload First Scan
              </button>
            </div>
          ) : (
            <div className="pd-report-list">
              {reports.map((r, i) => {
                const hasFindings = r.results?.some(x => x.prediction !== 'Normal');
                return (
                  <div
                    key={r._id}
                    className="pd-report-card"
                    style={{ animationDelay: `${i * 55}ms` }}
                    onClick={() => navigate(`/reports/${r._id}`)}
                  >
                    <div className={`pd-scan-dot ${hasFindings ? 'findings' : 'normal'}`} />
                    <div className="pd-report-info">
                      <span className="pd-report-id">#{r._id?.slice(-6).toUpperCase()}</span>
                      <span className="pd-report-date">{fmtRelative(r.createdAt)} · {fmt(r.createdAt)}</span>
                    </div>
                    <div className="pd-report-tags">
                      {r.results?.slice(0, 3).map((res, j) => (
                        <span key={j} className={`pd-result-badge ${res.prediction === 'Normal' ? 'normal' : 'finding'}`}>
                          {res.prediction}
                        </span>
                      ))}
                      {r.results?.length > 3 && (
                        <span className="pd-result-more">+{r.results.length - 3}</span>
                      )}
                    </div>
                    <svg className="pd-report-arrow" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function DoctorDashboard({ user }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('patients');

  useEffect(() => {
    async function load() {
      try {
        const [pRes, rRes] = await Promise.all([getPatients(), getAllReports()]);
        const pRaw = pRes.data?.data ?? pRes.data;
        const rRaw = rRes.data?.data ?? rRes.data;
        setPatients(Array.isArray(pRaw) ? pRaw : []);
        const rArr = Array.isArray(rRaw) ? rRaw : [];
        setReports([...rArr].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = patients.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(search.toLowerCase())
  );
  const recentReports = reports.slice(0, 20);
  const positiveCount = reports.filter(r => r.results?.some(x => x.prediction !== 'Normal')).length;
  const normalCount = reports.filter(r => r.results?.every(x => x.prediction === 'Normal')).length;

  if (loading) return <Loader />;

  return (
    <div className="dd-root">
      <GlobalStyles />

      <header className="dd-header">
        <div>
          <span className="dd-overline">Doctor Portal</span>
          <h1 className="dd-title">Dr. {user?.name}</h1>
        </div>
        <button className="dd-primary-btn" onClick={() => navigate('/patients/register')}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Register Patient
        </button>
      </header>

      <div className="dd-stats">
        {[
          { label: 'Total Patients', value: patients.length, accent: '#818cf8', icon: PatientsIcon },
          { label: 'Total Reports', value: reports.length, accent: '#38bdf8', icon: ReportsIcon },
          { label: 'Findings Found', value: positiveCount, accent: '#fb7185', icon: AlertIcon },
          { label: 'Clear Scans', value: normalCount, accent: '#4ade80', icon: CheckIcon },
        ].map((s, i) => (
          <div className="dd-stat-card" key={s.label} style={{ animationDelay: `${i * 80}ms` }}>
            <div className="dd-stat-icon" style={{ color: s.accent, background: s.accent + '20' }}>
              <s.icon />
            </div>
            <div className="dd-stat-val" style={{ color: s.accent }}>{s.value}</div>
            <div className="dd-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dd-tabs">
        {[
          { key: 'patients', label: 'Patients', count: patients.length },
          { key: 'reports', label: 'Recent Reports', count: recentReports.length },
        ].map(t => (
          <button key={t.key} className={`dd-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
            <span className="dd-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'patients' && (
        <div className="dd-card">
          <div className="dd-card-head">
            <h2 className="dd-card-title">All Patients</h2>
            <div className="dd-search-wrap">
              <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input className="dd-search" placeholder="Search name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="dd-empty">No patients found.</div>
          ) : (
            <table className="dd-table">
              <thead>
                <tr>{['Patient ID', 'Name', 'Age', 'Gender', 'Actions'].map(h => <th key={h} className="dd-th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p._id} className="dd-tr" style={{ animationDelay: `${i * 35}ms` }}>
                    <td className="dd-td"><code className="dd-code">{p.patientId || p._id?.slice(-6).toUpperCase()}</code></td>
                    <td className="dd-td"><strong>{p.fullName}</strong></td>
                    <td className="dd-td">{p.age}</td>
                    <td className="dd-td">{p.gender}</td>
                    <td className="dd-td dd-actions">
                      <button className="dd-ghost-btn" onClick={() => navigate(`/upload/${p._id}`)}>Upload Scan</button>
                      <button className="dd-primary-btn" style={{ padding: '5px 14px', fontSize: 12 }} onClick={() => navigate(`/patients/${p._id}/history`)}>History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="dd-card">
          <div className="dd-card-head">
            <h2 className="dd-card-title">Recent Reports</h2>
          </div>
          {recentReports.length === 0 ? (
            <div className="dd-empty">No reports yet.</div>
          ) : (
            <table className="dd-table">
              <thead>
                <tr>{['Report ID', 'Patient', 'Date', 'Result', 'Action'].map(h => <th key={h} className="dd-th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {recentReports.map((r, i) => {
                  const hasFindings = r.results?.some(x => x.prediction !== 'Normal');
                  return (
                    <tr key={r._id} className="dd-tr" style={{ animationDelay: `${i * 35}ms` }}>
                      <td className="dd-td"><code className="dd-code">#{r._id?.slice(-6).toUpperCase()}</code></td>
                      <td className="dd-td">{r.patientId?.fullName || r.patientName || '—'}</td>
                      <td className="dd-td">{fmt(r.createdAt)}</td>
                      <td className="dd-td">
                        <span className={`pd-result-badge ${hasFindings ? 'finding' : 'normal'}`}>
                          {hasFindings ? 'Findings' : 'Normal'}
                        </span>
                      </td>
                      <td className="dd-td">
                        <button className="dd-primary-btn" style={{ padding: '5px 14px', fontSize: 12 }} onClick={() => navigate(`/reports/${r._id}`)}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'doctor'
    ? <DoctorDashboard user={user} />
    : <PatientDashboard user={user} />;
}

function Loader() {
  return (
    <div className="loader-wrap">
      <div className="loader-ring" />
    </div>
  );
}

const ScanIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 3v18" strokeLinecap="round" /></svg>;
const CheckIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const AlertIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const CalIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" /></svg>;
const PatientsIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" /></svg>;
const ReportsIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" /></svg>;
const WarningIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>;

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .pd-root { max-width: 900px; margin: 0 auto; padding: 32px 24px; font-family: 'Sora', sans-serif; }
      .pd-hero {
        position: relative; overflow: hidden;
        display: flex; justify-content: space-between; align-items: center;
        background: linear-gradient(135deg, #0c1a2e 0%, #0f2d4a 50%, #0a1628 100%);
        border-radius: 24px; padding: 32px 36px; margin-bottom: 24px; color: #fff;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        animation: heroIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
      }
      .pd-hero-noise {
        position: absolute; inset: 0; border-radius: 24px; pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      }
      .pd-hero::before {
        content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px;
        border-radius: 50%; background: radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%); pointer-events: none;
      }
      .pd-hero-content { display: flex; align-items: center; gap: 20px; position: relative; }
      .pd-avatar {
        width: 64px; height: 64px; border-radius: 18px; flex-shrink: 0;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        display: flex; align-items: center; justify-content: center;
        font-size: 24px; font-weight: 700; box-shadow: 0 8px 24px rgba(59,130,246,0.4);
      }
      .pd-greeting { display: block; font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
      .pd-name     { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; margin-top: 2px; }
      .pd-meta     { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
      .pd-chip     { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; color: #94a3b8; }
      .pd-cta {
        display: flex; align-items: center; gap: 8px;
        background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none;
        padding: 12px 24px; border-radius: 14px; font-size: 14px; font-weight: 600;
        cursor: pointer; white-space: nowrap; font-family: 'Sora', sans-serif;
        box-shadow: 0 4px 16px rgba(59,130,246,0.45); transition: transform 0.15s, box-shadow 0.15s;
      }
      .pd-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,0.5); }

      .pd-error {
        display: flex; align-items: center; gap: 10px;
        background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
        border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 14px; font-weight: 500;
      }

      .pd-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
      .pd-stat-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px 16px;
        text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both; transition: transform 0.2s, box-shadow 0.2s;
      }
      .pd-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
      .pd-stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
      .pd-stat-val  { font-size: 36px; font-weight: 800; line-height: 1; letter-spacing: -1px; }
      .pd-stat-lbl  { font-size: 11px; color: #94a3b8; margin-top: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }

      .pd-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 22px; padding: 26px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
      .pd-section-head  { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
      .pd-section-title { font-size: 17px; font-weight: 700; color: #0f172a; }
      .pd-badge-count   { background: #eff6ff; color: #3b82f6; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }

      .pd-report-list { display: flex; flex-direction: column; gap: 8px; }
      .pd-report-card {
        display: flex; align-items: center; gap: 14px; padding: 15px 18px;
        border: 1px solid #e2e8f0; border-radius: 14px; background: #fafafa; cursor: pointer;
        animation: slideIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
      }
      .pd-report-card:hover { background: #f0f7ff; border-color: #93c5fd; box-shadow: 0 4px 16px rgba(59,130,246,0.1); }
      .pd-report-card:hover .pd-report-arrow { transform: translateX(3px); color: #3b82f6; }
      .pd-scan-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
      .pd-scan-dot.normal   { background: #10b981; box-shadow: 0 0 0 3px #d1fae5; }
      .pd-scan-dot.findings { background: #ef4444; box-shadow: 0 0 0 3px #fee2e2; }
      .pd-report-info  { flex: 1; min-width: 0; }
      .pd-report-id    { display: block; font-size: 14px; font-weight: 600; color: #1e293b; font-family: 'JetBrains Mono', monospace; }
      .pd-report-date  { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }
      .pd-report-tags  { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
      .pd-report-arrow { color: #cbd5e1; flex-shrink: 0; transition: transform 0.15s, color 0.15s; }
      .pd-result-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; }
      .pd-result-badge.normal  { background: #d1fae5; color: #065f46; }
      .pd-result-badge.finding { background: #fee2e2; color: #991b1b; }
      .pd-result-more { font-size: 11px; color: #94a3b8; font-weight: 600; }
      .pd-empty { text-align: center; padding: 52px 24px; color: #94a3b8; }
      .pd-empty-icon  { width: 56px; height: 56px; border-radius: 16px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #94a3b8; }
      .pd-empty-title { font-size: 16px; font-weight: 600; color: #475569; }
      .pd-empty-sub   { font-size: 13px; margin-top: 6px; }

      .dd-root { max-width: 1100px; margin: 0 auto; padding: 32px 24px; font-family: 'Sora', sans-serif; }
      .dd-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; animation: heroIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      .dd-overline { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #818cf8; margin-bottom: 4px; }
      .dd-title    { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.7px; }
      .dd-primary-btn {
        display: flex; align-items: center; gap: 7px;
        background: #6366f1; color: #fff; border: none; padding: 10px 22px; border-radius: 12px;
        font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Sora', sans-serif;
        box-shadow: 0 4px 16px rgba(99,102,241,0.35); transition: transform 0.15s, box-shadow 0.15s;
      }
      .dd-primary-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99,102,241,0.4); }
      .dd-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
      .dd-stat-card {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px 18px;
        text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both; transition: transform 0.2s, box-shadow 0.2s;
      }
      .dd-stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); }
      .dd-stat-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
      .dd-stat-val  { font-size: 38px; font-weight: 800; line-height: 1; letter-spacing: -1px; }
      .dd-stat-lbl  { font-size: 11px; color: #94a3b8; margin-top: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
      .dd-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
      .dd-tab {
        display: flex; align-items: center; gap: 8px; padding: 9px 20px; border-radius: 12px;
        border: 1px solid #e2e8f0; background: #fff; font-size: 14px; font-weight: 600;
        cursor: pointer; color: #64748b; font-family: 'Sora', sans-serif; transition: all 0.15s;
      }
      .dd-tab:hover:not(.active) { border-color: #c7d2fe; color: #6366f1; }
      .dd-tab.active { background: #6366f1; color: #fff; border-color: #6366f1; }
      .dd-tab-count { background: rgba(255,255,255,0.2); padding: 1px 7px; border-radius: 10px; font-size: 11px; font-weight: 700; }
      .dd-tab:not(.active) .dd-tab-count { background: #f1f5f9; color: #64748b; }
      .dd-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 26px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); animation: cardIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
      .dd-card-head  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .dd-card-title { font-size: 16px; font-weight: 700; color: #0f172a; }
      .dd-search-wrap { display: flex; align-items: center; gap: 8px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 12px; background: #f8fafc; }
      .dd-search { padding: 9px 0; border: none; background: transparent; font-size: 13px; outline: none; width: 200px; font-family: 'Sora', sans-serif; color: #334155; }
      .dd-table   { width: 100%; border-collapse: collapse; }
      .dd-th      { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; border-bottom: 2px solid #f1f5f9; }
      .dd-tr      { border-bottom: 1px solid #f8fafc; animation: fadeRow 0.25s ease both; }
      .dd-tr:hover td { background: #fafaff; }
      .dd-td      { padding: 13px 14px; font-size: 14px; color: #334155; }
      .dd-actions { display: flex; align-items: center; gap: 8px; }
      .dd-code    { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; font-size: 12px; color: #475569; }
      .dd-ghost-btn { background: transparent; color: #6366f1; border: 1px solid #c7d2fe; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Sora', sans-serif; transition: all 0.15s; }
      .dd-ghost-btn:hover { background: #eef2ff; }
      .dd-empty { text-align: center; padding: 40px 0; color: #94a3b8; font-size: 14px; }

      .loader-wrap { display: flex; justify-content: center; align-items: center; height: 60vh; }
      .loader-ring { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #e2e8f0; border-top-color: #6366f1; animation: spin 0.75s linear infinite; }

      @keyframes heroIn  { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes cardIn  { from { opacity: 0; transform: translateY(12px);  } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideIn { from { opacity: 0; transform: translateX(-8px);  } to { opacity: 1; transform: translateX(0); } }
      @keyframes fadeRow { from { opacity: 0; }                               to { opacity: 1; } }
      @keyframes spin    { to   { transform: rotate(360deg); } }

      @media (max-width: 640px) {
        .pd-stats, .dd-stats { grid-template-columns: repeat(2,1fr); }
        .pd-hero, .dd-header { flex-direction: column; gap: 16px; align-items: flex-start; }
      }
    `}</style>
  );
}