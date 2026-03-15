import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient, getPatientReports } from '../services/api';

/* # Icons */
const Icon = {
  back: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  calendar: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  pill: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/>
      <circle cx="18" cy="18" r="4"/><path d="m15.5 21.5 5-5"/>
    </svg>
  ),
  scan: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  empty: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#cbd5e1' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
};

/* # Helpers */
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric',
});
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-US', {
  hour: '2-digit', minute: '2-digit',
});

const FlagCard = ({ label, value, delay }) => (
  <div
    style={{
      ...s.flagCard,
      background: value ? '#fff5f5' : '#f0fdf4',
      border: `1.5px solid ${value ? '#fecaca' : '#bbf7d0'}`,
      animationDelay: `${delay}ms`,
    }}
    className="flag-card"
  >
    <div style={s.flagDot}>
      <span style={{
        ...s.flagDotInner,
        background: value ? '#ef4444' : '#22c55e',
        boxShadow: `0 0 0 3px ${value ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}`,
      }} />
    </div>
    <div>
      <div style={s.flagLabel}>{label}</div>
      <div style={{ ...s.flagVal, color: value ? '#dc2626' : '#16a34a' }}>
        {value ? 'Positive' : 'Negative'}
      </div>
    </div>
  </div>
);

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    Promise.all([getPatient(id), getPatientReports(id)]).then(([p, r]) => {
      setPatient(p.data);
      setReports(r.data || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const mhFlags = [
    ['Diabetes',        patient?.medicalHistory?.diabetes],
    ['Hypertension',    patient?.medicalHistory?.hypertension],
    ['Family Glaucoma', patient?.medicalHistory?.familyGlaucoma],
    ['Family Cataract', patient?.medicalHistory?.familyCataract],
  ];

  const filteredReports = reports.filter(r => {
    if (filter === 'positive') return r.results?.some(x => x.prediction !== 'Normal');
    if (filter === 'normal')   return r.results?.every(x => x.prediction === 'Normal');
    return true;
  });

  const positiveCount = reports.filter(r => r.results?.some(x => x.prediction !== 'Normal')).length;
  const normalCount   = reports.filter(r => r.results?.every(x => x.prediction === 'Normal')).length;

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* # Header */}
      <div style={s.header} className="ph-header">
        <div style={s.headerLeft}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            {Icon.back} Back
          </button>
          <div>
            <p style={s.breadcrumb}>Patient Record</p>
            <h1 style={s.patientName}>{patient?.name}</h1>
            <div style={s.patientMeta}>
              <span style={s.metaTag}>ID: {patient?.patientId}</span>
              <span style={s.metaDot} />
              <span style={s.metaTag}>{patient?.age} yrs</span>
              <span style={s.metaDot} />
              <span style={s.metaTag}>{patient?.gender}</span>
            </div>
          </div>
        </div>
        <button style={s.newScanBtn} onClick={() => navigate(`/upload/${id}`)} className="new-scan-btn">
          {Icon.plus} New Scan
        </button>
      </div>

      {/* # Stats Strip */}
      <div style={s.statsStrip} className="ph-stats">
        {[
          { label: 'Total Scans',    value: reports.length,  color: '#6366f1' },
          { label: 'Positive Finds', value: positiveCount,   color: '#ef4444' },
          { label: 'Normal Scans',   value: normalCount,     color: '#10b981' },
        ].map((st, i) => (
          <div key={st.label} style={s.statPill} className="stat-pill">
            <span style={{ ...s.statNum, color: st.color }}>{st.value}</span>
            <span style={s.statLabel}>{st.label}</span>
          </div>
        ))}
      </div>

      {/* # Medical History */}
      <div style={s.section} className="ph-section">
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>Medical History</h2>
        </div>
        <div style={s.flagGrid}>
          {mhFlags.map(([label, val], i) => (
            <FlagCard key={label} label={label} value={val} delay={i * 60} />
          ))}
        </div>

        {patient?.medicalHistory?.currentMeds && (
          <div style={s.medsRow} className="meds-row">
            <span style={s.medsIcon}>{Icon.pill}</span>
            <div>
              <span style={s.medsLabel}>Current Medications</span>
              <span style={s.medsVal}>{patient.medicalHistory.currentMeds}</span>
            </div>
          </div>
        )}
      </div>

      {/* # Reports */}
      <div style={s.section} className="ph-section">
        <div style={s.sectionHead}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={s.sectionTitle}>Scan Reports</h2>
            <span style={s.countBadge}>{reports.length}</span>
          </div>
          <div style={s.filterRow}>
            {[
              { key: 'all',      label: 'All' },
              { key: 'positive', label: 'Findings' },
              { key: 'normal',   label: 'Normal' },
            ].map(f => (
              <button
                key={f.key}
                style={{ ...s.filterBtn, ...(filter === f.key ? s.filterBtnActive : {}) }}
                onClick={() => setFilter(f.key)}
                className={`filter-btn${filter === f.key ? ' active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div style={s.empty} className="empty-state">
            <div style={s.emptyIcon}>{Icon.empty}</div>
            <p style={s.emptyTitle}>
              {reports.length === 0 ? 'No scans yet' : 'No matching reports'}
            </p>
            <p style={s.emptySub}>
              {reports.length === 0
                ? 'Upload the first fundus scan to begin analysis.'
                : 'Try a different filter to see results.'}
            </p>
            {reports.length === 0 && (
              <button style={s.newScanBtn} onClick={() => navigate(`/upload/${id}`)} className="new-scan-btn">
                {Icon.plus} Upload Scan
              </button>
            )}
          </div>
        ) : (
          <div style={s.reportList}>
            {filteredReports.map((r, i) => {
              const hasPositive = r.results?.some(x => x.prediction !== 'Normal');
              const diseases    = r.results || [];

              return (
                <div
                  key={r._id}
                  style={{ ...s.reportCard, animationDelay: `${i * 55}ms` }}
                  className="report-card"
                  onClick={() => navigate(`/reports/${r._id}`)}
                >
                  {}
                  <div style={{ ...s.reportAccent, background: hasPositive ? '#ef4444' : '#10b981' }} />

                  <div style={s.reportBody}>
                    <div style={s.reportTop}>
                      <div style={s.reportBadges}>
                        {diseases.map(x => {
                          const pos = x.prediction !== 'Normal';
                          return (
                            <span
                              key={x.disease}
                              style={{
                                ...s.diseaseBadge,
                                background: pos ? '#fff5f5' : '#f0fdf4',
                                color:      pos ? '#dc2626' : '#16a34a',
                                border:     `1px solid ${pos ? '#fecaca' : '#bbf7d0'}`,
                              }}
                            >
                              <span style={{
                                display: 'inline-block', width: 5, height: 5,
                                borderRadius: '50%', background: pos ? '#ef4444' : '#10b981',
                                marginRight: 5, verticalAlign: 'middle', flexShrink: 0,
                              }} />
                              {x.disease}
                              <span style={s.badgePred}>{x.prediction}</span>
                            </span>
                          );
                        })}
                      </div>

                      <div style={s.reportMeta}>
                        <span style={s.reportDateChip}>
                          {Icon.calendar}&nbsp;{fmtDate(r.createdAt)}
                        </span>
                        <span style={s.reportTime}>{fmtTime(r.createdAt)}</span>
                      </div>
                    </div>

                    {r.clinicianName && (
                      <p style={s.clinicianName}>
                        {Icon.scan}&nbsp; Analysed by {r.clinicianName}
                      </p>
                    )}
                  </div>

                  <div style={s.reportArrow} className="report-arrow">
                    {Icon.arrow}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:         { maxWidth: 960, margin: '0 auto', padding: '36px 24px', fontFamily: "'DM Sans', sans-serif" },

  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  headerLeft:   { display: 'flex', alignItems: 'flex-start', gap: 16 },
  backBtn:      { display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', marginTop: 6, transition: 'all 0.15s' },
  breadcrumb:   { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6366f1', margin: '0 0 3px' },
  patientName:  { fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 7px', letterSpacing: '-0.5px' },
  patientMeta:  { display: 'flex', alignItems: 'center', gap: 8 },
  metaTag:      { fontSize: 13, color: '#64748b', fontWeight: 500 },
  metaDot:      { width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' },

  newScanBtn:   { display: 'flex', alignItems: 'center', gap: 7, background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s' },

  statsStrip:   { display: 'flex', gap: 12, marginBottom: 24 },
  statPill:     { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '12px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  statNum:      { fontSize: 24, fontWeight: 800, lineHeight: 1 },
  statLabel:    { fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },

  section:      { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '24px 26px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  sectionHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 },
  countBadge:   { background: '#eef2ff', color: '#6366f1', fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 20 },

  flagGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 4 },
  flagCard:     { borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeUp 0.35s ease both' },
  flagDot:      { flexShrink: 0 },
  flagDotInner: { display: 'block', width: 10, height: 10, borderRadius: '50%' },
  flagLabel:    { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 3 },
  flagVal:      { fontSize: 15, fontWeight: 800 },

  medsRow:      { display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 12, border: '1px solid #e2e8f0', animation: 'fadeUp 0.3s ease 0.28s both' },
  medsIcon:     { color: '#6366f1', flexShrink: 0 },
  medsLabel:    { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', display: 'block', marginBottom: 2 },
  medsVal:      { fontSize: 13, color: '#334155', fontWeight: 500, display: 'block' },

  filterRow:    { display: 'flex', gap: 6 },
  filterBtn:    { padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' },
  filterBtnActive:{ background: '#6366f1', color: '#fff', borderColor: '#6366f1' },

  reportList:   { display: 'flex', flexDirection: 'column', gap: 10 },
  reportCard:   { display: 'flex', alignItems: 'center', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', background: '#fafafa', transition: 'all 0.2s', animation: 'fadeUp 0.3s ease both' },
  reportAccent: { width: 4, alignSelf: 'stretch', flexShrink: 0 },
  reportBody:   { flex: 1, padding: '14px 16px', minWidth: 0 },
  reportTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  reportBadges: { display: 'flex', gap: 7, flexWrap: 'wrap' },
  diseaseBadge: { display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 },
  badgePred:    { marginLeft: 5, fontWeight: 700, opacity: 0.8 },
  reportMeta:   { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  reportDateChip:{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', fontWeight: 600 },
  reportTime:   { fontSize: 11, color: '#94a3b8' },
  clinicianName:{ fontSize: 12, color: '#94a3b8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, margin: '8px 0 0' },

  reportArrow:  { padding: '0 18px', color: '#cbd5e1', transition: 'all 0.2s', flexShrink: 0 },

  empty:        { textAlign: 'center', padding: '52px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  emptyIcon:    { marginBottom: 6 },
  emptyTitle:   { fontSize: 16, fontWeight: 700, color: '#334155', margin: 0 },
  emptySub:     { fontSize: 13, color: '#94a3b8', margin: '2px 0 14px' },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .ph-header  { animation: fadeDown 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .ph-stats   { animation: fadeDown 0.4s cubic-bezier(0.16,1,0.3,1) 0.06s both; }
  .ph-section { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .ph-section:nth-of-type(2) { animation-delay: 0.1s; }
  .ph-section:nth-of-type(3) { animation-delay: 0.16s; }

  @keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

  .stat-pill  { animation: fadeUp 0.35s ease both; }
  .stat-pill:nth-child(1) { animation-delay:0.08s; }
  .stat-pill:nth-child(2) { animation-delay:0.14s; }
  .stat-pill:nth-child(3) { animation-delay:0.2s; }

  .flag-card  { animation: fadeUp 0.35s ease both; }

  .report-card { animation: fadeUp 0.3s ease both; }
  .report-card:hover { background:#fff !important; border-color:#c7d2fe !important; box-shadow:0 4px 18px rgba(99,102,241,0.1); transform:translateX(3px); }
  .report-card:hover .report-arrow { color:#6366f1 !important; transform:translateX(3px); }

  .new-scan-btn:hover { background:#4f46e5 !important; transform:translateY(-1px); box-shadow:0 4px 16px rgba(99,102,241,0.3); }

  .backBtn:hover, button[style*='background: rgb(248']:hover { background:#f1f5f9 !important; }

  .filter-btn:not(.active):hover { background:#f1f5f9 !important; border-color:#c7d2fe !important; color:#4f46e5 !important; }

  .meds-row { animation: fadeUp 0.3s ease 0.28s both; }
  .empty-state { animation: fadeUp 0.4s ease both; }
`;