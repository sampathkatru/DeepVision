import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/theme.css';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UploadScan from './pages/UploadScan';
import ReportViewer from './pages/ReportViewer';
import PatientHistory from './pages/PatientHistory';
import DoctorPanel from './pages/DoctorPanel';
import PatientRegister from './pages/PatientRegister';
import Navbar from './components/Navbar/Navbar';

// ── Auth Context ─────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eyeai_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('eyeai_user');
    if (saved && token) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('eyeai_token', jwt);
    localStorage.setItem('eyeai_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eyeai_token');
    localStorage.removeItem('eyeai_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Protected Route ──────────────────────────────────────────────────────────
function Protected({ children, doctorOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (doctorOnly && user.role !== 'doctor') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/*" element={
            <Protected>
              <Navbar />
              <div style={{ paddingTop: 70 }}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/upload" element={<UploadScan />} />
                  <Route path="/upload/:patientId" element={<UploadScan />} />
                  <Route path="/patients/register" element={<PatientRegister />} /> 
                  <Route path="/patients/me" element={<PatientHistory />} />       
                  <Route path="/profile/setup" element={<PatientRegister selfRegister />} /> 
                  <Route path="/reports/:id" element={<ReportViewer />} />
                  <Route path="/doctor" element={<Protected doctorOnly><DoctorPanel /></Protected>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Protected>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
