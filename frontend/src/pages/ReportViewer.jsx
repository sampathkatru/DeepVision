import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport, updateNotes } from '../services/api';
import { useAuth } from '../App';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, ResponsiveContainer, CartesianGrid,
} from 'recharts';

/* # SVG Icons */
const Icon = {
  back: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  download: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  save: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  check: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  warn: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  user: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  spin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="spin-anim">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
};

/* # PDF Generator */
async function generatePDF(report) {
  const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(
    () => window.jspdf
  );

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 18;
  const patient = (typeof report.patientId === 'object' && report.patientId !== null)
  ? report.patientId
  : (report.patient || {});
  const results = report.results || [];
  const date = new Date(report.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  /* # helpers */
  const hex = (h) => {
    const r = parseInt(h.slice(1,3),16)/255,
          g = parseInt(h.slice(3,5),16)/255,
          b = parseInt(h.slice(5,7),16)/255;
    return [r*255|0, g*255|0, b*255|0];
  };

  /* # COVER HEADER */
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 46, 'F');

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 42, W, 4, 'F');

  doc.setFillColor(99, 102, 241);
  doc.circle(M + 8, 22, 10, 'F');
  doc.setFillColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('EYE', M + 4.5, 23.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('DIAGNOSTIC REPORT', M + 24, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('AI-Assisted Retinal Analysis  ·  EyeAI Platform', M + 24, 26);

  doc.setFontSize(9);
  doc.text(`Generated: ${date}`, M + 24, 33);
  doc.text(`Report ID: ${report._id?.slice(-10).toUpperCase()}`, M + 24, 39);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Attending Clinician', W - M - 40, 25, { align: 'left' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(report.clinicianName || 'Not specified', W - M - 40, 31, { align: 'left' });

  let y = 58;

  /* # PATIENT INFO BLOCK */
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, W - M*2, 30, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(M, y, W - M*2, 30, 3, 3, 'S');

  const fields = [
    ['Patient Name', patient.name || '—'],
    ['Patient ID',   patient.patientId || '—'],
    ['Age',          patient.age ? `${patient.age} yrs` : '—'],
    ['Gender',       patient.gender || '—'],
  ];
  const colW = (W - M*2) / 4;
  fields.forEach(([label, val], i) => {
    const cx = M + 6 + i * colW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), cx, y + 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(val, cx, y + 20);
  });

  y += 38;

  /* # RESULTS PER DISEASE */
  for (const [idx, res] of results.entries()) {
    const isPos = res.prediction !== 'Normal';
    const conf  = ((res.confidence || 0) * 100).toFixed(1);

    doc.setFillColor(99, 102, 241);
    doc.rect(M, y, 3, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(res.disease || `Screening ${idx+1}`, M + 7, y + 9);

    if (isPos) {
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(W - M - 42, y, 42, 12, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(153, 27, 27);
      doc.text('POSITIVE FINDING', W - M - 39, y + 8);
    } else {
      doc.setFillColor(209, 250, 229);
      doc.roundedRect(W - M - 42, y, 42, 12, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(6, 95, 70);
      doc.text('NORMAL / CLEAR', W - M - 38, y + 8);
    }

    y += 18;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(M, y, W - M*2, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('MODEL CONFIDENCE', M + 5, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(isPos ? 239 : 16, isPos ? 68 : 185, isPos ? 68 : 129);
    doc.text(`${conf}%`, M + 5, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Decision Threshold: ${report.threshold || 0.5}`, M + 45, y + 14);

    y += 22;

    if (res.probabilities) {
      const entries = Object.entries(res.probabilities);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('PROBABILITY BREAKDOWN', M, y + 5);
      y += 10;

      const BAR_W = W - M*2 - 40;
      entries.forEach(([name, prob]) => {
        const pct = prob * 100;
        const filled = (BAR_W * pct / 100);
        const isNorm = name === 'Normal';

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(name, M, y + 4);

        doc.setFillColor(226, 232, 240);
        doc.roundedRect(M + 38, y - 1, BAR_W, 7, 1, 1, 'F');
        if (filled > 0) {
          if (isNorm) doc.setFillColor(16, 185, 129);
          else        doc.setFillColor(239, 68, 68);
          doc.roundedRect(M + 38, y - 1, filled, 7, 1, 1, 'F');
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(`${pct.toFixed(1)}%`, M + 38 + BAR_W + 3, y + 4);

        y += 11;
      });
    }

    if (res.gradcam) {
      try {
        const imgData = `data:image/png;base64,${res.gradcam}`;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('GRAD-CAM ATTENTION HEATMAP', M, y + 5);
        y += 9;
        const imgW = W - M*2;
        const imgH = 70;
        doc.addImage(imgData, 'PNG', M, y, imgW, imgH, '', 'FAST');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Red/yellow regions indicate highest model attention areas.', M, y + imgH + 4);
        y += imgH + 10;
      } catch (_) {}
    }

    y += 8;

    if (idx < results.length - 1) {
      doc.setDrawColor(226, 232, 240);
      doc.line(M, y, W - M, y);
      y += 10;
    }

    if (y > 255) { doc.addPage(); y = 20; }
  }

  /* # DOCTOR NOTES */
  if (report.doctorNotes) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(M, y, W - M*2, 6, 1, 1, 'F');
    doc.setFillColor(99, 102, 241);
    doc.rect(M, y, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('CLINICIAN NOTES', M + 7, y + 4.5);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(report.doctorNotes, W - M*2 - 4);
    doc.text(lines, M + 2, y);
    y += lines.length * 5 + 8;
  }

  /* # FOOTER (all pages) */
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 285, W, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('EyeAI Diagnostic Platform  ·  AI-assisted analysis is supplementary to clinical judgment.', M, 292);
    doc.text(`Page ${p} of ${pages}`, W - M, 292, { align: 'right' });
  }

  doc.save(`EyeAI-Report-${report._id?.slice(-8).toUpperCase()}.pdf`);
}

/* # Custom Tooltip */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e293b', color:'#f8fafc', padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:600, border:'none' }}>
      {payload[0].name}: <span style={{ color: payload[0].fill }}>{payload[0].value}%</span>
    </div>
  );
};

/* # Main Component */
export default function ReportViewer() {
  const { id }      = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const isDoctor    = user?.role === 'doctor';

  const [report,        setReport]        = useState(null);
  const [notes,         setNotes]         = useState('');
  const [saving,        setSaving]        = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [activeResult,  setActiveResult]  = useState(0);
  const [pdfLoading,    setPdfLoading]    = useState(false);
  const [noteSaved,     setNoteSaved]     = useState(false);

  useEffect(() => {
    getReport(id)
      .then(r => { setReport(r.data); setNotes(r.data.doctorNotes || ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveNotes = async () => {
    setSaving(true);
    await updateNotes(id, notes);
    setSaving(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try { await generatePDF(report); }
    catch (e) { console.error('PDF error:', e); }
    finally { setPdfLoading(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!report) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh', color:'#94a3b8' }}>
      Report not found.
    </div>
  );

  const patient = report.patientId || {};
  const results = report.results  || [];
  const current = results[activeResult] || {};
  const isPos   = current.prediction !== 'Normal';

  const barData = current.probabilities
    ? Object.entries(current.probabilities).map(([name, val]) => ({
        name, value: Math.round(val * 100),
      }))
    : [];

  const date = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* # Top Bar */}
      <div style={s.topBar} className="rv-topbar">
        <div style={s.topLeft}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            {Icon.back} Back
          </button>
          <div>
            <p style={s.breadcrumb}>Diagnostic Report</p>
            <h1 style={s.pageTitle}>Retinal Analysis</h1>
            <p style={s.pageMeta}>
              <span style={s.metaChip}>{Icon.user} {patient.name || '—'}</span>
              <span style={s.metaDot} />
              <span style={s.metaChip}>ID: {patient.patientId || '—'}</span>
              <span style={s.metaDot} />
              <span style={s.metaChip}>{date}</span>
            </p>
          </div>
        </div>
        <button
          style={{ ...s.pdfBtn, ...(pdfLoading ? s.pdfBtnLoading : {}) }}
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="pdf-btn"
        >
          {pdfLoading ? Icon.spin : Icon.download}
          {pdfLoading ? 'Generating…' : 'Download PDF'}
        </button>
      </div>

      {/* # Disease Tabs */}
      {results.length > 1 && (
        <div style={s.tabBar} className="rv-tabs">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => setActiveResult(i)}
              style={{ ...s.tab, ...(i === activeResult ? s.tabActive : {}) }}
              className={`rv-tab${i === activeResult ? ' active' : ''}`}
            >
              <span style={{
                ...s.tabDot,
                background: r.prediction !== 'Normal' ? '#ef4444' : '#10b981',
              }} />
              {r.disease}
            </button>
          ))}
        </div>
      )}

      {/* # Main Grid */}
      <div style={s.grid}>

        {/* # LEFT COLUMN */}
        <div style={s.leftCol}>

          {}
          <div style={{ ...s.card, ...s.resultHero, background: isPos ? 'linear-gradient(135deg,#1e0a0a,#2d1515)' : 'linear-gradient(135deg,#071a12,#0a2a1e)' }} className="result-hero">
            <div style={s.resultTopRow}>
              <div>
                <p style={s.resultLabel}>{current.disease} — Prediction</p>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:8 }}>
                  <span style={{ ...s.resultIcon, color: isPos ? '#ef4444' : '#10b981' }}>
                    {isPos ? Icon.warn : Icon.check}
                  </span>
                  <span style={{ ...s.resultText, color: isPos ? '#fca5a5' : '#6ee7b7' }}>
                    {isPos ? 'Positive Finding' : 'Normal / Clear'}
                  </span>
                </div>
              </div>
              <div style={s.confBlock}>
                <p style={s.confLabel}>Confidence</p>
                <p style={{ ...s.confVal, color: isPos ? '#fca5a5' : '#6ee7b7' }}>
                  {((current.confidence || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {}
            <div style={s.confBarTrack}>
              <div
                style={{
                  ...s.confBarFill,
                  width: `${((current.confidence || 0) * 100).toFixed(1)}%`,
                  background: isPos ? '#ef4444' : '#10b981',
                }}
                className="conf-bar"
              />
            </div>
            <div style={s.confBarLabels}>
              <span>0%</span>
              <span style={{ color:'#64748b', fontSize:11 }}>
                Threshold: {report.threshold || 0.5}
              </span>
              <span>100%</span>
            </div>
          </div>

          {}
          {barData.length > 0 && (
            <div style={s.card} className="rv-card">
              <h3 style={s.cardTitle}>Probability Breakdown</h3>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={barData} layout="vertical" margin={{ left: 68, right: 32, top: 4, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0,100]} tickFormatter={v => `${v}%`} tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize:12, fill:'#334155', fontWeight:600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(99,102,241,0.04)' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.name === 'Normal' ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {}
          {current.gradcam && (
            <div style={s.card} className="rv-card">
              <div style={s.cardTitleRow}>
                <h3 style={s.cardTitle}>Grad-CAM Heatmap</h3>
                <span style={s.heatmapBadge}>{Icon.eye} Attention Map</span>
              </div>
              <div style={s.heatmapWrap}>
                <img
                  src={`data:image/png;base64,${current.gradcam}`}
                  alt="Grad-CAM Heatmap"
                  style={s.heatmapImg}
                />
                <div style={s.heatmapLegend}>
                  <span style={s.legendItem}><span style={{ ...s.legendDot, background:'#1d4ed8' }} />Low</span>
                  <span style={s.legendItem}><span style={{ ...s.legendDot, background:'#22c55e' }} />Mid</span>
                  <span style={s.legendItem}><span style={{ ...s.legendDot, background:'#facc15' }} />High</span>
                  <span style={s.legendItem}><span style={{ ...s.legendDot, background:'#ef4444' }} />Critical</span>
                </div>
              </div>
              <p style={s.caption}>Red/yellow regions indicate highest model attention during classification.</p>
            </div>
          )}
        </div>

        {/* # RIGHT COLUMN */}
        <div style={s.rightCol}>

          {}
          <div style={s.card} className="rv-card">
            <h3 style={s.cardTitle}>Patient Information</h3>
            <div style={s.infoGrid}>
              {[
                ['Full Name',   patient.name],
                ['Patient ID',  patient.patientId],
                ['Age',         patient.age ? `${patient.age} years` : null],
                ['Gender',      patient.gender],
                ['Clinician',   report.clinicianName],
                ['Threshold',   report.threshold],
              ].map(([k, v]) => v && (
                <div key={k} style={s.infoCell}>
                  <span style={s.infoKey}>{k}</span>
                  <span style={s.infoVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {}
          {results.length > 1 && (
            <div style={s.card} className="rv-card">
              <h3 style={s.cardTitle}>All Screenings</h3>
              <div style={s.summaryList}>
                {results.map((r, i) => {
                  const pos = r.prediction !== 'Normal';
                  return (
                    <div
                      key={i}
                      style={{ ...s.summaryRow, ...(i === activeResult ? s.summaryRowActive : {}) }}
                      onClick={() => setActiveResult(i)}
                      className="summary-row"
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ ...s.summaryDot, background: pos ? '#ef4444' : '#10b981' }} />
                        <span style={s.summaryDisease}>{r.disease}</span>
                      </div>
                      <div style={s.summaryRight}>
                        <span style={{ ...s.summaryBadge, background: pos ? '#fee2e2' : '#d1fae5', color: pos ? '#991b1b' : '#065f46' }}>
                          {pos ? 'Positive' : 'Normal'}
                        </span>
                        <span style={s.summaryConf}>{((r.confidence||0)*100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {}
          <div style={s.card} className="rv-card">
            <div style={s.cardTitleRow}>
              <h3 style={s.cardTitle}>Clinician Notes</h3>
              {noteSaved && <span style={s.savedBadge}>Saved</span>}
            </div>
            {isDoctor ? (
              <>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Add clinical observations, follow-up instructions, or treatment notes…"
                  style={s.textarea}
                  className="rv-textarea"
                />
                <button
                  style={{ ...s.saveBtn, ...(saving ? s.saveBtnLoading : {}) }}
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="save-btn"
                >
                  {saving ? Icon.spin : Icon.save}
                  {saving ? 'Saving…' : 'Save Notes'}
                </button>
              </>
            ) : (
              <div style={s.notesReadOnly}>
                {notes || <span style={{ color:'#94a3b8', fontStyle:'italic' }}>No notes added by clinician yet.</span>}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* # Styles */
const s = {
  page:           { maxWidth: 1140, margin: '0 auto', padding: '32px 24px', fontFamily: "'DM Sans', sans-serif" },

  topBar:         { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  topLeft:        { display: 'flex', alignItems: 'flex-start', gap: 16 },
  backBtn:        { display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', marginTop: 8, flexShrink: 0, transition: 'all 0.15s' },
  breadcrumb:     { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6366f1', margin: '0 0 3px' },
  pageTitle:      { fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' },
  pageMeta:       { display: 'flex', alignItems: 'center', gap: 8, margin: 0 },
  metaChip:       { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b', fontWeight: 500 },
  metaDot:        { width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' },

  pdfBtn:         { display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', color: '#f8fafc', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s', letterSpacing: '0.01em' },
  pdfBtnLoading:  { opacity: 0.7, cursor: 'not-allowed' },

  tabBar:         { display: 'flex', gap: 8, marginBottom: 24 },
  tab:            { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b', transition: 'all 0.15s' },
  tabActive:      { background: '#0f172a', color: '#f8fafc', borderColor: '#0f172a' },
  tabDot:         { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },

  grid:           { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' },
  leftCol:        { display: 'flex', flexDirection: 'column', gap: 16 },
  rightCol:       { display: 'flex', flexDirection: 'column', gap: 16 },

  card:           { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  cardTitle:      { fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px' },
  cardTitleRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

  resultHero:     { padding: '24px 26px', borderRadius: 18, border: 'none' },
  resultTopRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  resultLabel:    { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', margin: '0 0 4px' },
  resultIcon:     { flexShrink: 0 },
  resultText:     { fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' },
  confBlock:      { textAlign: 'right' },
  confLabel:      { fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' },
  confVal:        { fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1 },
  confBarTrack:   { height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' },
  confBarFill:    { height: '100%', borderRadius: 6, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' },
  confBarLabels:  { display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#475569' },

  heatmapBadge:   { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#6366f1', background: '#eef2ff', padding: '3px 10px', borderRadius: 20 },
  heatmapWrap:    { position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000', marginBottom: 10 },
  heatmapImg:     { width: '100%', display: 'block', borderRadius: 12 },
  heatmapLegend:  { display: 'flex', gap: 14, justifyContent: 'center', padding: '8px 0 4px' },
  legendItem:     { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b', fontWeight: 500 },
  legendDot:      { width: 8, height: 8, borderRadius: '50%' },
  caption:        { fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: '6px 0 0', lineHeight: 1.4 },

  infoGrid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 },
  infoCell:       { padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 2 },
  infoKey:        { fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' },
  infoVal:        { fontSize: 14, color: '#1e293b', fontWeight: 600 },

  summaryList:    { display: 'flex', flexDirection: 'column', gap: 6 },
  summaryRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid transparent', transition: 'all 0.15s', background: '#f8fafc' },
  summaryRowActive:{ border: '1.5px solid #6366f1', background: '#eef2ff' },
  summaryDot:     { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  summaryDisease: { fontSize: 13, fontWeight: 600, color: '#1e293b' },
  summaryRight:   { display: 'flex', alignItems: 'center', gap: 8 },
  summaryBadge:   { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 },
  summaryConf:    { fontSize: 12, color: '#94a3b8', fontWeight: 600, minWidth: 32, textAlign: 'right' },

  textarea:       { width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, resize: 'vertical', fontFamily: "'DM Sans', sans-serif", color: '#1e293b', lineHeight: 1.6, outline: 'none', boxSizing: 'border-box', background: '#fafafa', transition: 'border-color 0.15s' },
  saveBtn:        { display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, background: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  saveBtnLoading: { opacity: 0.7, cursor: 'not-allowed' },
  savedBadge:     { fontSize: 11, fontWeight: 700, color: '#065f46', background: '#d1fae5', padding: '3px 10px', borderRadius: 20 },
  notesReadOnly:  { fontSize: 14, color: '#334155', lineHeight: 1.7, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', minHeight: 80 },
};

/* # CSS */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .rv-topbar  { animation: fadeDown 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .rv-tabs    { animation: fadeDown 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
  .result-hero { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .rv-card    { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .rv-card:nth-child(2) { animation-delay: 0.07s; }
  .rv-card:nth-child(3) { animation-delay: 0.14s; }

  @keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

  .rv-tab:not(.active):hover { background:#f8fafc !important; border-color:#c7d2fe !important; color:#4f46e5 !important; }
  .rv-tab.active { box-shadow: 0 2px 10px rgba(15,23,42,0.2); }

  .pdf-btn:not(:disabled):hover { background:#1e293b !important; transform:translateY(-1px); box-shadow:0 4px 16px rgba(15,23,42,0.25); }

  .conf-bar { animation: growBar 1s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
  @keyframes growBar { from { width:0% !important; } }

  .rv-textarea:focus { border-color:#6366f1 !important; background:#fff !important; box-shadow:0 0 0 3px rgba(99,102,241,0.15) !important; }

  .save-btn:not(:disabled):hover { background:#4f46e5 !important; transform:translateY(-1px); box-shadow:0 4px 14px rgba(99,102,241,0.35); }

  .summary-row:not([style*='border-color: rgb(99']):hover { background:#f1f5f9 !important; }

  @keyframes spin { to { transform:rotate(360deg); } }
  .spin-anim { animation:spin 0.9s linear infinite; }
`;