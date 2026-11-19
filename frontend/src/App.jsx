import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthContainer from './components/AuthContainer';
import Dashboard from './components/Dashboard';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const token = localStorage.getItem('admission_token');
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('admission_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('admission_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('admission_token');
    setUser(null);
    setActiveTab('login');
  };

  const handleUpdateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  if (loading) {
    return (
      <div className="app-loader-screen">
        <div className="loader-box">
          <div className="pulse-ring"></div>
          <h3>Connecting to Admission Portal...</h3>
          <p>ABES Engineering College</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="main-content">
        {user ? (
          <Dashboard
            user={user}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        ) : (
          <AuthContainer
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </main>

      <footer className="portal-footer">
        <div className="footer-container">
          <div className="footer-left">
            <p className="footer-inst">
              <strong>ABES Engineering College</strong>
            </p>
            <p className="footer-sub">
              Approved by AICTE, Affiliated to Dr. A.P.J. Abdul Kalam Technical University (AKTU) • College Code: 032
            </p>
          </div>
          <div className="footer-right">
            <span>Admissions Helpdesk: <strong>admissions@abes.ac.in</strong></span>
            <span>Toll-Free: <strong>+1 (800) 427-3900</strong></span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
