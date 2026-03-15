import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReports, getPatients } from '../services/api';

/* # Icons */
const Icon = {
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  reports: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  patients: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  findings: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  eye: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  upload: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  history: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.79"/>
    </svg>
  ),
  calendar: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  plus: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  clear: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  sort: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
    </svg>
  ),
  check: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

/* # Helpers */
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric',
});

const ResultBadge = ({ prediction, disease }) => {
  const isNormal = prediction === 'Normal';
  const label = disease?.replace('Diabetic Retinopathy', 'DR');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700,
      padding: '3px 9px', borderRadius: 20,
      background: isNormal ? '#f0fdf4' : '#fff5f5',
      color:      isNormal ? '#15803d' : '#dc2626',
      border:     `1px solid ${isNormal ? '#bbf7d0' : '#fecaca'}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
        background: isNormal ? '#22c55e' : '#ef4444',
      }} />
      {label}: {prediction}
    </span>
  );
};

/* # Main */
export default function DoctorPanel() {
  const navigate = useNavigate();
  const [reports,  setReports]  = useState([]);
  const [patients, setPatients] = useState([]);
  const [tab,      setTab]      = useState('reports');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sortDir,  setSortDir]  = useState('desc');

  useEffect(() => {
    Promise.all([getAllReports(), getPatients()]).then(([r, p]) => {
      const pRaw = p.data?.data ?? p.data;
      const rRaw = r.data?.data ?? r.data;
      setPatients(Array.isArray(pRaw) ? pRaw : []);
      setReports(Array.isArray(rRaw) ? rRaw : []);
      setLoading(false);
    }).catch(err => {
      console.error('DoctorPanel load error:', err);
      setLoading(false);
    });
  }, []);

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReports = reports
    .filter(r => r.patientId?.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === 'desc'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const positiveCount = reports.filter(r => r.results?.some(x => x.prediction !== 'Normal')).length;
  const clearCount    = reports.length - positiveCount;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* # Header */}
      <div style={s.header} className="dp-header">
        <div style={{ flex: '0 0 auto' }}>
          <p style={s.breadcrumb}>Overview</p>
          <h1 style={s.title}>Doctor Panel</h1>
        </div>

        <div style={s.searchWrap}>
          <span style={s.searchIcon}>{Icon.search}</span>
          <input
            style={s.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients or reports…"
            className="dp-input"
          />
          {search && (
            <button style={s.clearBtn} onClick={() => setSearch('')} className="dp-clear">
              {Icon.clear}
            </button>
          )}
        </div>

        <button
          style={s.newPatientBtn}
          onClick={() => navigate('/patients/register')}
          className="dp-primary-btn"
        >
          {Icon.plus} New Patient
        </button>
      </div>

      {/* # Stats */}
      <div style={s.statsGrid}>
        {[
          { label: 'Total Patients',    value: patients.length, icon: Icon.patients, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Total Reports',     value: reports.length,  icon: Icon.reports,  color: '#0ea5e9', bg: '#e0f2fe' },
          { label: 'Positive Findings', value: positiveCount,   icon: Icon.findings, color: '#ef4444', bg: '#fff5f5' },
          { label: 'Clear Scans',       value: clearCount,      icon: Icon.check,    color: '#10b981', bg: '#f0fdf4' },
        ].map((st, i) => (
          <div
            key={st.label}
            style={{ ...s.statCard, animationDelay: `${i * 55}ms` }}
            className="dp-stat"
          >
            <div style={{ ...s.statIconWrap, background: st.bg, color: st.color }}>
              {st.icon}
            </div>
            <div>
              <div style={{ ...s.statNum, color: st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* # Tabs */}
      <div style={s.tabBar} className="dp-tabbar">
        <div style={s.tabGroup}>
          {[
            { key: 'reports',  label: 'Reports',  icon: Icon.reports  },
            { key: 'patients', label: 'Patients', icon: Icon.patients },
          ].map(t => (
            <button
              key={t.key}
              style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
              onClick={() => setTab(t.key)}
              className={`dp-tab${tab === t.key ? ' active' : ''}`}
            >
              <span style={{ display: 'flex', opacity: tab === t.key ? 1 : 0.55 }}>{t.icon}</span>
              {t.label}
              <span style={{
                ...s.tabCount,
                background: tab === t.key ? 'rgba(255,255,255,0.22)' : '#f1f5f9',
                color:      tab === t.key ? '#fff' : '#94a3b8',
              }}>
                {t.key === 'reports' ? filteredReports.length : filteredPatients.length}
              </span>
            </button>
          ))}
        </div>

        {tab === 'reports' && (
          <button
            style={s.sortBtn}
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="dp-sort-btn"
          >
            <span style={{ display: 'flex', transform: sortDir === 'asc' ? 'scaleY(-1)' : 'none', transition: 'transform 0.2s' }}>
              {Icon.sort}
            </span>
            {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
          </button>
        )}
      </div>

      {/* # Reports Table */}
      {tab === 'reports' && (
        <div style={s.tableCard} className="dp-table-card">
          {filteredReports.length === 0 ? (
            <EmptyState title="No reports found" sub="Try adjusting your search." />
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['Patient', 'Date', 'Findings', 'Action'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r, i) => (
                  <tr
                    key={r._id}
                    style={{ ...s.tr, animationDelay: `${i * 32}ms` }}
                    className="dp-row"
                    onClick={() => navigate(`/reports/${r._id}`)}
                  >
                    <td style={s.td}>
                      <div style={s.nameCell}>{r.patientId?.name || 'Unknown'}</div>
                      <div style={s.subCell}>{r.patientId?.patientId || '—'}</div>
                    </td>
                    <td style={s.td}>
                      <div style={s.dateCell}>
                        <span style={{ display: 'flex', color: '#94a3b8' }}>{Icon.calendar}</span>
                        {fmtDate(r.createdAt)}
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {r.results?.map(x => (
                          <ResultBadge key={x.disease} prediction={x.prediction} disease={x.disease} />
                        ))}
                      </div>
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.viewBtn}
                        className="dp-view-btn"
                        onClick={e => { e.stopPropagation(); navigate(`/reports/${r._id}`); }}
                      >
                        {Icon.eye} View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* # Patients Table */}
      {tab === 'patients' && (
        <div style={s.tableCard} className="dp-table-card">
          {filteredPatients.length === 0 ? (
            <EmptyState title="No patients found" sub="Try adjusting your search or register a new patient." />
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['Patient ID', 'Name', 'Age', 'Gender', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, i) => (
                  <tr
                    key={p._id}
                    style={{ ...s.tr, animationDelay: `${i * 32}ms` }}
                    className="dp-row"
                  >
                    <td style={s.td}><code style={s.pidCode}>{p.patientId}</code></td>
                    <td style={s.td}><div style={s.nameCell}>{p.name}</div></td>
                    <td style={s.td}><span style={s.metaText}>{p.age} yrs</span></td>
                    <td style={s.td}><span style={s.metaText}>{p.gender}</span></td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 7 }}>
                        <button
                          style={s.outlineBtn}
                          className="dp-outline-btn"
                          onClick={() => navigate(`/upload/${p._id}`)}
                        >
                          {Icon.upload} New Scan
                        </button>
                        <button
                          style={s.viewBtn}
                          className="dp-view-btn"
                          onClick={() => navigate(`/patients/${p._id}/history`)}
                        >
                          {Icon.history} History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* # Empty State */
function EmptyState({ title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }} className="dp-empty">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#334155', margin: '0 0 4px' }}>{title}</p>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{sub}</p>
    </div>
  );
}

/* # Styles */
const s = {
  page:         { maxWidth: 1140, margin: '0 auto', padding: '36px 24px', fontFamily: "'DM Sans', sans-serif" },

  header:       { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  breadcrumb:   { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6366f1', margin: '0 0 3px' },
  title:        { fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' },

  searchWrap:   { position: 'relative', flex: 1, minWidth: 220, maxWidth: 380 },
  searchIcon:   { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex' },
  searchInput:  { width: '100%', padding: '10px 36px 10px 38px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#fafafa', color: '#1e293b', boxSizing: 'border-box', transition: 'all 0.15s' },
  clearBtn:     { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 3, borderRadius: 4, transition: 'color 0.15s' },

  newPatientBtn:{ display: 'flex', alignItems: 'center', gap: 7, background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap', flexShrink: 0 },

  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 },
  statCard:     { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animation: 'fadeUp 0.35s ease both', transition: 'transform 0.2s, box-shadow 0.2s' },
  statIconWrap: { width: 42, height: 42, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statNum:      { fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 2 },
  statLabel:    { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },

  tabBar:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  tabGroup:     { display: 'flex', gap: 6 },
  tab:          { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', border: '1.5px solid #e2e8f0', borderRadius: 11, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#64748b', transition: 'all 0.15s' },
  tabActive:    { background: '#6366f1', color: '#fff', borderColor: '#6366f1', boxShadow: '0 2px 10px rgba(99,102,241,0.25)' },
  tabCount:     { fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20, transition: 'all 0.15s' },
  sortBtn:      { display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fafafa', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer', transition: 'all 0.15s' },

  tableCard:    { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { textAlign: 'left', padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  tr:           { borderBottom: '1px solid #f8fafc', animation: 'fadeIn 0.25s ease both', cursor: 'default', transition: 'background 0.15s' },
  td:           { padding: '14px 18px', fontSize: 14, color: '#334155', verticalAlign: 'middle' },

  nameCell:     { fontWeight: 700, color: '#1e293b' },
  subCell:      { fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 },
  dateCell:     { display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b', fontWeight: 500 },
  metaText:     { fontSize: 13, color: '#64748b', fontWeight: 500 },
  pidCode:      { fontFamily: 'monospace', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontSize: 12, color: '#475569' },

  viewBtn:      { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#6366f1', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' },
  outlineBtn:   { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: '#6366f1', border: '1.5px solid #6366f1', padding: '6px 13px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' },
};

/* # CSS */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .dp-header    { animation: fadeDown 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .dp-tabbar    { animation: fadeUp  0.35s ease 0.12s both; }
  .dp-table-card{ animation: fadeUp  0.35s ease 0.16s both; }

  @keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px);  } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }

  .dp-stat { animation: fadeUp 0.35s ease both; }
  .dp-stat:nth-child(1) { animation-delay:0.06s; }
  .dp-stat:nth-child(2) { animation-delay:0.12s; }
  .dp-stat:nth-child(3) { animation-delay:0.18s; }
  .dp-stat:nth-child(4) { animation-delay:0.24s; }
  .dp-stat:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.09) !important; }

  .dp-tab:not(.active):hover { background:#f8fafc !important; color:#4f46e5 !important; border-color:#c7d2fe !important; }
  .dp-tab.active { box-shadow: 0 2px 12px rgba(99,102,241,0.28) !important; }

  .dp-row:hover td { background: #fafaff !important; }
  .dp-row { animation: fadeIn 0.25s ease both; }

  .dp-view-btn:hover    { background:#4f46e5 !important; transform:translateY(-1px); box-shadow:0 3px 10px rgba(99,102,241,0.3); }
  .dp-outline-btn:hover { background:#eef2ff !important; }
  .dp-sort-btn:hover    { background:#f1f5f9 !important; border-color:#c7d2fe !important; color:#4f46e5 !important; }
  .dp-primary-btn:hover { background:#4f46e5 !important; transform:translateY(-1px); box-shadow:0 4px 16px rgba(99,102,241,0.3); }
  .dp-clear:hover       { color:#ef4444 !important; }
  .dp-input:focus       { border-color:#6366f1 !important; background:#fff !important; box-shadow:0 0 0 3px rgba(99,102,241,0.12) !important; }
  .dp-empty             { animation: fadeUp 0.3s ease both; }
`;