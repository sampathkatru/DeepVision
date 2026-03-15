import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadScan } from '../services/api';
import { useAuth } from '../App';

const UploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const ScanIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const ImageIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#cbd5e1' }}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-icon">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const DISEASES = [
  { id: 'All', label: 'All Diseases', desc: 'Screen for all conditions' },
  { id: 'Glaucoma', label: 'Glaucoma', desc: 'Optic nerve damage' },
  { id: 'Cataract', label: 'Cataract', desc: 'Lens opacity' },
  { id: 'Diabetic Retinopathy', label: 'Diabetic Retinopathy', desc: 'Retinal damage from diabetes' },
];

export default function UploadScan() {
  const { patientId: paramPatientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const resolvedPatientId = paramPatientId
    || (user?.role === 'patient' ? (user?.patientId ?? user?._id) : null);

  const isPatientSelf = !paramPatientId && user?.role === 'patient';

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [diseases, setDiseases] = useState(['All']);
  const [threshold, setThreshold] = useState(0.5);
  const [clinician, setClinician] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const toggleDisease = (d) => {
    if (d === 'All') { setDiseases(['All']); return; }
    setDiseases(prev => {
      const without = prev.filter(x => x !== 'All');
      const next = without.includes(d) ? without.filter(x => x !== d) : [...without, d];
      return next.length === 0 ? ['All'] : next;
    });
  };

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Please select a fundus image before running analysis.');
      return;
    }
    if (!resolvedPatientId) {
      setError('Patient ID could not be resolved. Please contact support.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', image);
      fd.append('patientId', resolvedPatientId);
      fd.append('diseaseTypes', JSON.stringify(diseases));
      fd.append('threshold', threshold);
      fd.append('clinicianName', clinician);
      const res = await uploadScan(fd);
      navigate(`/reports/${res.data.report._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Upload and analysis failed. Ensure the ML service is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const thresholdLabel =
    threshold <= 0.3 ? 'High Sensitivity' :
      threshold <= 0.6 ? 'Balanced' : 'High Specificity';

  return (
    <div style={s.page}>
      <style>{css}</style>

      <div style={s.card} className="upload-card">

        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeftIcon /> Back
          </button>
          <div style={s.titleBlock}>
            <p style={s.breadcrumb}>Retinal Analysis</p>
            <h1 style={s.title}>Upload Fundus Scan</h1>
            <p style={s.subtitle}>
              {isPatientSelf
                ? 'Upload your retinal image for AI-powered screening.'
                : 'Configure screening parameters and upload the retinal image for AI analysis.'}
            </p>
          </div>
        </div>

        <div style={s.divider} />

        <section style={s.section}>
          <label style={s.sectionLabel}>Screening Type</label>
          <p style={s.sectionHint}>Select one or more conditions to screen for.</p>
          <div style={s.diseaseGrid}>
            {DISEASES.map((d) => {
              const active = diseases.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDisease(d.id)}
                  style={{ ...s.dCard, ...(active ? s.dCardActive : {}) }}
                  className={`disease-card${active ? ' active' : ''}`}
                >
                  <div style={s.dCardTop}>
                    <span style={s.dLabel}>{d.label}</span>
                    <span style={{ ...s.dCheck, ...(active ? s.dCheckActive : {}) }}>
                      {active && <CheckIcon />}
                    </span>
                  </div>
                  <span style={s.dDesc}>{d.desc}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div style={s.divider} />

        <section style={s.section}>
          <div style={s.twoCol}>
            {!isPatientSelf && (
              <div style={s.fieldGroup}>
                <label style={s.label}>Attending Clinician</label>
                <input
                  style={s.input}
                  value={clinician}
                  onChange={e => setClinician(e.target.value)}
                  placeholder="Dr. Full Name"
                />
              </div>
            )}

            <div style={{ ...s.fieldGroup, gridColumn: isPatientSelf ? '1 / -1' : 'auto' }}>
              <label style={s.label}>
                Decision Threshold
                <span style={s.thresholdBadge}>{thresholdLabel}</span>
              </label>
              <div style={s.sliderWrap}>
                <span style={s.sliderTick}>0.1</span>
                <input
                  type="range"
                  min={0.1} max={0.9} step={0.05}
                  value={threshold}
                  onChange={e => setThreshold(parseFloat(e.target.value))}
                  style={s.slider}
                  className="threshold-slider"
                />
                <span style={s.sliderTick}>0.9</span>
              </div>
              <div style={s.sliderVal}>{threshold.toFixed(2)}</div>
            </div>
          </div>
        </section>

        <div style={s.divider} />

        <section style={s.section}>
          <label style={s.sectionLabel}>Fundus Image</label>
          <p style={s.sectionHint}>JPEG, PNG, or BMP — ideally a high-resolution retinal fundus photograph.</p>

          <div
            style={{
              ...s.dropzone,
              ...(dragging ? s.dropzoneDrag : {}),
              ...(preview ? s.dropzoneHasImage : {}),
            }}
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current.click()}
          >
            {preview ? (
              <div style={s.previewWrap}>
                <img src={preview} alt="Fundus preview" style={s.preview} />
                <div style={s.previewOverlay} className="preview-overlay">
                  <span style={s.previewChangeBtn}>Change Image</span>
                </div>
              </div>
            ) : (
              <div style={s.dropContent} className={dragging ? 'drag-active' : ''}>
                <div style={s.uploadIconWrap} className="upload-icon-wrap">
                  <UploadIcon />
                </div>
                <p style={s.dropTitle}>
                  {dragging ? 'Release to upload' : 'Drop image here'}
                </p>
                <p style={s.dropSub}>or <span style={s.browseLink}>browse files</span></p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />

          {image && (
            <div style={s.fileInfo} className="file-info">
              <ImageIcon style={{ width: 14, height: 14 }} />
              <span style={s.fileName}>{image.name}</span>
              <span style={s.fileSize}>({(image.size / 1024).toFixed(1)} KB)</span>
              <button style={s.removeBtn} onClick={e => { e.stopPropagation(); setImage(null); setPreview(null); }}>
                Remove
              </button>
            </div>
          )}
        </section>

        {error && (
          <div style={s.errorBox} className="error-box">
            <span style={s.errorDot} />
            {error}
          </div>
        )}

        <button
          style={{ ...s.submitBtn, ...(loading || !image ? s.submitDisabled : {}) }}
          className={`submit-btn${loading ? ' loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading || !image}
        >
          {loading ? (
            <><SpinnerIcon /> Analysing with AI…</>
          ) : (
            <><ScanIcon /> Run AI Analysis</>
          )}
        </button>

      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 780, margin: '40px auto', padding: '0 24px', fontFamily: "'DM Sans', sans-serif" },
  card: { background: '#fff', borderRadius: 24, padding: '40px 44px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' },

  header: { display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 28 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, marginTop: 4 },
  titleBlock: { flex: 1 },
  breadcrumb: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6366f1', margin: '0 0 4px' },
  title: { fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#94a3b8', margin: 0, lineHeight: 1.5 },

  divider: { height: 1, background: '#f1f5f9', margin: '24px 0' },

  section: { marginBottom: 4 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 },
  sectionHint: { fontSize: 13, color: '#94a3b8', margin: '0 0 16px' },

  diseaseGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  dCard: { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 14px 12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', display: 'flex', flexDirection: 'column', gap: 6 },
  dCardActive: { background: '#eef2ff', borderColor: '#6366f1' },
  dCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dLabel: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
  dDesc: { fontSize: 11, color: '#94a3b8', lineHeight: 1.4 },
  dCheck: { width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' },
  dCheckActive: { background: '#6366f1', borderColor: '#6366f1', color: '#fff' },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8 },
  input: { padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', color: '#1e293b', background: '#fafafa', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.15s' },

  thresholdBadge: { fontSize: 11, fontWeight: 600, color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: 20, textTransform: 'none', letterSpacing: 0 },
  sliderWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  slider: { flex: 1, height: 4, cursor: 'pointer', accentColor: '#6366f1' },
  sliderTick: { fontSize: 11, color: '#94a3b8', fontWeight: 600 },
  sliderVal: { fontSize: 22, fontWeight: 800, color: '#6366f1', marginTop: 2 },

  dropzone: { border: '2px dashed #e2e8f0', borderRadius: 16, minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', background: '#fafafa', overflow: 'hidden', position: 'relative' },
  dropzoneDrag: { borderColor: '#6366f1', background: '#eef2ff' },
  dropzoneHasImage: { border: '2px solid #e2e8f0', background: '#000' },
  dropContent: { textAlign: 'center', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  uploadIconWrap: { color: '#94a3b8', transition: 'transform 0.2s, color 0.2s' },
  dropTitle: { fontSize: 16, fontWeight: 700, color: '#334155', margin: 0 },
  dropSub: { fontSize: 13, color: '#94a3b8', margin: 0 },
  browseLink: { color: '#6366f1', fontWeight: 600, textDecoration: 'underline' },

  previewWrap: { width: '100%', height: '100%', position: 'relative', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  preview: { maxHeight: 300, maxWidth: '100%', objectFit: 'contain', display: 'block' },
  previewOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' },
  previewChangeBtn: { color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.02em', padding: '8px 18px', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 8 },

  fileInfo: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' },
  fileName: { fontSize: 13, fontWeight: 600, color: '#334155', flex: 1 },
  fileSize: { fontSize: 12, color: '#94a3b8' },
  removeBtn: { fontSize: 12, fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' },

  errorBox: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff5f5', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, padding: '12px 16px', borderRadius: 10, marginBottom: 16 },
  errorDot: { width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 },

  submitBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 12, padding: '15px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 24, transition: 'all 0.18s', letterSpacing: '0.01em' },
  submitDisabled: { opacity: 0.5, cursor: 'not-allowed' },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .upload-card { animation: cardIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .disease-card { animation: fadeUp 0.3s ease both; }
  .disease-card:nth-child(1) { animation-delay: 0.05s; }
  .disease-card:nth-child(2) { animation-delay: 0.1s; }
  .disease-card:nth-child(3) { animation-delay: 0.15s; }
  .disease-card:nth-child(4) { animation-delay: 0.2s; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .disease-card:not(.active):hover { background: #f1f5f9 !important; border-color: #c7d2fe !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.1); }
  .disease-card.active { box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }

  .dropzone:hover .upload-icon-wrap { color: #6366f1 !important; transform: translateY(-4px); }
  .dropzone:hover { border-color: #a5b4fc !important; background: #f5f3ff !important; }
  .dropzone:hover .preview-overlay { opacity: 1 !important; }

  .threshold-slider { -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #6366f1 var(--val, 50%), #e2e8f0 var(--val, 50%)); height: 4px; border-radius: 4px; outline: none; }
  .threshold-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #6366f1; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; transition: transform 0.15s; }
  .threshold-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }

  input[type="text"]:focus, input:not([type="range"]):focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; background: #fff !important; }

  .submit-btn:not(:disabled):hover { background: #4f46e5 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.35); }
  .submit-btn:not(:disabled):active { transform: translateY(0); }
  .submit-btn.loading { background: #818cf8 !important; }

  .file-info { animation: fadeUp 0.2s ease both; }

  .error-box { animation: shake 0.3s ease both; }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin-icon { animation: spin 0.9s linear infinite; }
`;