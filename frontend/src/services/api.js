import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eyeai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register      = (data) => API.post('/auth/register', data);
export const login         = (data) => API.post('/auth/login', data);
export const firebaseLogin = (data) => API.post('/auth/firebase', data);
export const getMe         = ()     => API.get('/auth/me');

export const getMyPatientRecord = ()         => API.get('/patients/me');
export const getPatients        = ()         => API.get('/patients');
export const createPatient      = (data)     => API.post('/patients', data);
export const getPatient         = (id)       => API.get(`/patients/${id}`);
export const updatePatient      = (id, data) => API.put(`/patients/${id}`, data);

export const uploadScan = (formData) =>
  API.post('/scans/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120_000,
  });

export const getPatientScans = (pid) => API.get(`/scans/patient/${pid}`);

export const getAllReports      = ()         => API.get('/reports');
export const getReport         = (id)       => API.get(`/reports/${id}`);
export const getPatientReports = (pid)      => API.get(`/reports/patient/${pid}`);
export const updateNotes       = (id, note) => API.put(`/reports/${id}/notes`, { doctorNotes: note });
export const downloadPDF       = (id)       => API.get(`/reports/${id}/pdf`, { responseType: 'blob' });