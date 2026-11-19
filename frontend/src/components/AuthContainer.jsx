import React from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Award, CheckCircle2, Calendar, FileText, Sparkles, Building2, Globe } from 'lucide-react';

export default function AuthContainer({ activeTab, setActiveTab, onLoginSuccess }) {
  return (
    <div className="auth-master-wrapper">
      <div className="auth-card-shell">
        {/* Left Side: College Brand & Admission Highlights */}
        <aside className="auth-sidebar-hero">
          <div className="sidebar-hero-content">
            <div className="sidebar-badge">
              <Sparkles size={14} className="sparkle-icon" /> Admissions Open 2026–2027
            </div>

            <h2 className="sidebar-title">
              Your Journey to Academic Excellence Begins Here.
            </h2>
            <p className="sidebar-desc">
              Join a vibrant community of scholars, researchers, and future leaders at ABES Engineering College. Apply online and track your admission status in real time.
            </p>

            <div className="highlight-stats-grid">
              <div className="stat-pill">
                <span className="stat-number">#14</span>
                <span className="stat-label">National NIRF Ranking</span>
              </div>
              <div className="stat-pill">
                <span className="stat-number">98.4%</span>
                <span className="stat-label">Campus Placement</span>
              </div>
              <div className="stat-pill">
                <span className="stat-number">120+</span>
                <span className="stat-label">Global Partner Unis</span>
              </div>
              <div className="stat-pill">
                <span className="stat-number">$4.2M</span>
                <span className="stat-label">Merit Scholarships</span>
              </div>
            </div>

            <div className="admission-timeline-card">
              <div className="timeline-header">
                <Calendar size={16} />
                <span>Admission Deadlines & Key Dates</span>
              </div>
              <ul className="timeline-list">
                <li>
                  <span className="dot dot-active"></span>
                  <div>
                    <strong>Phase 1 Early Bird Registration</strong>
                    <small>Closing December 15, 2026</small>
                  </div>
                </li>
                <li>
                  <span className="dot dot-pending"></span>
                  <div>
                    <strong>Merit List & Interview Screening</strong>
                    <small>Commencing January 5, 2027</small>
                  </div>
                </li>
              </ul>
            </div>

            <div className="sidebar-footer-info">
              <div className="info-item">
                <Building2 size={16} />
                <span>Campus: 19th KM Stone, NH-09, Ghaziabad (UP)</span>
              </div>
              <div className="info-item">
                <Globe size={16} />
                <span>www.abes.ac.in</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Interactive Login / Register Form */}
        <main className="auth-main-panel">
          <div className="auth-tab-nav">
            <button
              type="button"
              className={`auth-tab-link ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-link ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              New Registration
            </button>
          </div>

          {activeTab === 'login' ? (
            <LoginForm
              onLoginSuccess={onLoginSuccess}
              switchToRegister={() => setActiveTab('register')}
            />
          ) : (
            <RegisterForm
              onRegisterSuccess={onLoginSuccess}
              switchToLogin={() => setActiveTab('login')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
