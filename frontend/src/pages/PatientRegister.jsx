import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatient } from '../services/api';

export default function PatientRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    age: '', gender: 'Male', phone: '',
    medicalHistory: {
      diabetes: false, hypertension: false,
      familyGlaucoma: false, familyCataract: false, currentMeds: '',
    },
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setMH = (field, val) => setForm(f => ({
    ...f, medicalHistory: { ...f.medicalHistory, [field]: val }
  }));

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Token in storage:', localStorage.getItem('eyeai_token'));
  console.log('Form data:', form);
  setError(''); setLoading(true);
  try {
    const res = await createPatient(form);
    const patientId = res.data.data._id;
    navigate(`/upload/${patientId}`);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to register patient');
  } finally {
    setLoading(false);
  }
};

  const checkBox = (field, label) => (
    <label key={field} style={styles.checkLabel}>
      <input type="checkbox" checked={form.medicalHistory[field]}
        onChange={e => setMH(field, e.target.checked)}
        style={{ width: 'auto', marginRight: 8 }} />
      {label}
    </label>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 className="page-title">Patient Registration</h1>
            <p style={styles.sub}>Fill in patient details before uploading the fundus scan.</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back</button>
        </div>

        <form onSubmit={handleSubmit}>
          <h3 style={styles.section}>Personal Details</h3>
          <div style={styles.grid2}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                placeholder="e.g. Full Name"
                required
              />
            </div>
            <div className="form-group">
              <label>Age *</label>
              <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 45" min={1} max={120} required />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
            </div>
          </div>

          <div className="divider" />

          <h3 style={styles.section}>Medical History</h3>
          <div style={styles.checkGrid}>
            {checkBox('diabetes',       'Diabetes')}
            {checkBox('hypertension',   'Hypertension')}
            {checkBox('familyGlaucoma', 'Family History of Glaucoma')}
            {checkBox('familyCataract', 'Family History of Cataract')}
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Current Medications</label>
            <textarea rows={2} value={form.medicalHistory.currentMeds}
              onChange={e => setMH('currentMeds', e.target.value)}
              placeholder="List any ongoing medications..." />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Register & Upload Scan →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:       { maxWidth: 760, margin: '32px auto', padding: '0 24px' },
  card:       { background: '#fff', borderRadius: 20, padding: '36px 40px', boxShadow: 'var(--shadow)' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  sub:        { color: 'var(--text-s)', fontSize: 14, marginTop: 4 },
  section:    { fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--primary)', marginBottom: 16 },
  grid2:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' },
  checkGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  checkLabel: { display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  error:      { color: 'var(--danger)', fontSize: 13, background: '#FEE2E2', padding: '10px 14px', borderRadius: 8, marginBottom: 12 },
};