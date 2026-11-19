import React from 'react';
import { GraduationCap, Phone, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ user, onLogout, activeTab, setActiveTab }) {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand" onClick={() => !user && setActiveTab('login')}>
          <div className="logo-box">
            <GraduationCap className="logo-icon" size={28} />
          </div>
          <div className="brand-text">
            <h1 className="college-name">ABES ENGINEERING COLLEGE</h1>
            <span className="college-subtext">Approved by AICTE, Affiliated to AKTU • Admission Portal 2026-27</span>
          </div>
        </div>

        <div className="nav-badges">
          <span className="accreditation-pill">
            <ShieldCheck size={14} className="shield-icon" /> NAAC A++ Accredited
          </span>
          <span className="helpline-pill">
            <Phone size={14} /> Helpline: +1 (800) 427-3900
          </span>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-profile-widget">
              <div className="user-avatar-chip">
                <UserIcon size={16} />
                <span className="user-chip-name">{user.name.split(' ')[0]}</span>
                <span className="user-chip-id">({user.applicationNumber})</span>
              </div>
              <button className="btn-logout" onClick={onLogout} title="Sign Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Sign In
              </button>
              <button 
                className={`tab-btn register-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                Apply Now
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
