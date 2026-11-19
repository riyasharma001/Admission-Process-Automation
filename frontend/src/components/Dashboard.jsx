import React, { useState } from 'react';
import { 
  GraduationCap, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Download, 
  UploadCloud, 
  PhoneCall, 
  Mail, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  RefreshCw,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import AdmissionSlip from './AdmissionSlip';

const STEPS = [
  { id: 1, title: 'Application Form', desc: 'Personal & Academic Info Submitted' },
  { id: 2, title: 'Application Fee', desc: 'Processing & Assessment Fee' },
  { id: 3, title: 'Document Verification', desc: 'Academic Records Review' },
  { id: 4, title: 'Merit Assessment', desc: 'Rank & Department Allocation' },
  { id: 5, title: 'Provisional Admission', desc: 'Offer Letter & Enrollment' }
];

export default function Dashboard({ user, onUpdateUser, onLogout }) {
  const [showSlip, setShowSlip] = useState(false);
  const [payingFee, setPayingFee] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Determine current active step based on status
  const getStepStatus = (stepIndex) => {
    if (stepIndex === 0) return 'completed';
    if (stepIndex === 1) return user.applicationFeeStatus === 'Paid' ? 'completed' : 'current';
    
    if (user.admissionStatus === 'Admission Confirmed') return 'completed';
    if (user.admissionStatus === 'Offer Letter Issued') {
      return stepIndex <= 3 ? 'completed' : 'current';
    }
    if (user.admissionStatus === 'Documents Verified') {
      return stepIndex <= 2 ? 'completed' : stepIndex === 3 ? 'current' : 'pending';
    }
    if (user.admissionStatus === 'Under Review') {
      return stepIndex === 2 ? 'current' : 'pending';
    }
    return 'pending';
  };

  const handlePayFee = async () => {
    setPayingFee(true);
    setActionMessage('');
    try {
      const res = await api.payFee();
      if (res.success && res.user) {
        onUpdateUser(res.user);
        setActionMessage('✅ Application fee ($50.00) paid successfully! Status updated.');
      }
    } catch (err) {
      setActionMessage('Failed to process fee payment.');
    } finally {
      setPayingFee(false);
    }
  };

  const handleNextStatus = async () => {
    setUpdatingStatus(true);
    const flow = [
      'Application Submitted',
      'Under Review',
      'Documents Verified',
      'Offer Letter Issued',
      'Admission Confirmed'
    ];
    const currentIndex = flow.indexOf(user.admissionStatus);
    const nextStatus = flow[(currentIndex + 1) % flow.length];

    try {
      const res = await api.updateStatus(nextStatus);
      if (res.success && res.user) {
        onUpdateUser(res.user);
        setActionMessage(`ℹ️ Status updated to "${nextStatus}".`);
      }
    } catch (err) {
      setActionMessage('Failed to update admission status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <section className="dashboard-welcome-banner">
        <div className="banner-details">
          <div className="applicant-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="banner-tag">
              <GraduationCap size={14} /> Official Applicant Portal 2026-27
            </div>
            <h2 className="applicant-name">Welcome back, {user.name}</h2>
            <p className="applicant-meta">
              <span>Application No: <strong>{user.applicationNumber}</strong></span>
              <span className="dot-sep">•</span>
              <span>Degree: <strong>{user.course}</strong></span>
              <span className="dot-sep">•</span>
              <span>Registered on: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="banner-actions">
          <button className="btn-banner-action" onClick={() => setShowSlip(true)}>
            <FileText size={16} />
            <span>Admission Slip</span>
          </button>
          <button className="btn-banner-action btn-cycle" onClick={handleNextStatus} disabled={updatingStatus}>
            <RefreshCw size={16} className={updatingStatus ? 'spin' : ''} />
            <span>Advance Status</span>
          </button>
        </div>
      </section>

      {actionMessage && (
        <div className="alert-box alert-success" style={{ margin: '16px 0' }}>
          <CheckCircle size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Admission Stepper */}
      <section className="dashboard-card progress-card">
        <div className="card-header">
          <h3>Admission Evaluation Progress</h3>
          <span className="current-status-pill">
            Current Status: <strong>{user.admissionStatus}</strong>
          </span>
        </div>

        <div className="stepper-horizontal">
          {STEPS.map((step, idx) => {
            const state = getStepStatus(idx);
            return (
              <div key={step.id} className={`step-item step-${state}`}>
                <div className="step-indicator">
                  {state === 'completed' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="step-content">
                  <span className="step-title">{step.title}</span>
                  <small className="step-desc">{step.desc}</small>
                </div>
                {idx < STEPS.length - 1 && <div className="step-connector"></div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Grid: Applicant Profile & Fee Status & Documents */}
      <div className="dashboard-grid-cards">
        {/* Profile Summary Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Applicant Details</h3>
            <span className="sub-badge">Verified Identity</span>
          </div>

          <div className="details-list">
            <div className="detail-item">
              <span className="detail-label">Full Legal Name</span>
              <span className="detail-val">{user.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Registered Email</span>
              <span className="detail-val">{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Primary Mobile</span>
              <span className="detail-val">{user.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date of Birth</span>
              <span className="detail-val">{user.dob || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Applied Program</span>
              <span className="detail-val">{user.course}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Qualifying Exam Score</span>
              <span className="detail-val highlight-score">{user.qualifyingScore || 'Pending'}</span>
            </div>
          </div>
        </div>

        {/* Application Fee & Next Steps Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Fee & Processing</h3>
            <span className={`status-badge-inline ${user.applicationFeeStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>
              {user.applicationFeeStatus === 'Paid' ? 'Fee Paid' : 'Fee Due'}
            </span>
          </div>

          <div className="fee-card-body">
            <div className="fee-display-box">
              <div className="fee-amount">
                <span className="currency">$</span>
                <span className="val">50.00</span>
                <span className="fee-type">USD (One-time Admission Processing Fee)</span>
              </div>
              <p className="fee-note">
                Covers academic evaluation, transcript verification, and merit seat reservation.
              </p>
            </div>

            {user.applicationFeeStatus === 'Paid' ? (
              <div className="fee-success-box">
                <CheckCircle size={20} className="text-success" />
                <div>
                  <strong>Payment Acknowledged</strong>
                  <p>Receipt #TXN-2026-{user.applicationNumber.replace('ADM-', '')} is generated.</p>
                </div>
              </div>
            ) : (
              <button 
                className="btn-pay-fee" 
                onClick={handlePayFee} 
                disabled={payingFee}
              >
                <CreditCard size={18} />
                <span>{payingFee ? 'Processing Payment...' : 'Pay Application Fee Online'}</span>
              </button>
            )}

            <div className="helpdesk-box">
              <h4>Admissions Counseling Office</h4>
              <p>Mon - Fri: 9:00 AM - 6:00 PM EST</p>
              <div className="helpdesk-links">
                <a href="mailto:admissions@abes.ac.in"><Mail size={14} /> admissions@abes.ac.in</a>
                <a href="tel:+18004273900"><PhoneCall size={14} /> +1 (800) 427-3900</a>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="dashboard-card grid-full-width">
          <div className="card-header">
            <h3>Mandatory Document Verification Checklist</h3>
            <span className="sub-badge">Academic Records</span>
          </div>

          <div className="docs-table-wrapper">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Document Requirement</th>
                  <th>Format</th>
                  <th>Verification Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Secondary School Certificate (Grade 10)</td>
                  <td>PDF / JPEG</td>
                  <td><span className="status-badge-inline badge-paid">Verified</span></td>
                  <td><button className="btn-table-action" onClick={() => alert('Document is already verified by admissions.')}>View File</button></td>
                </tr>
                <tr>
                  <td>Higher Secondary (Grade 12 / 10+2) Marksheet</td>
                  <td>PDF / JPEG</td>
                  <td>
                    <span className="status-badge-inline badge-status">
                      {user.admissionStatus === 'Application Submitted' ? 'Pending Review' : 'Verified'}
                    </span>
                  </td>
                  <td><button className="btn-table-action" onClick={() => alert('Uploaded file preview available.')}>View File</button></td>
                </tr>
                <tr>
                  <td>Government Photo Identity (Passport / National ID)</td>
                  <td>PDF / PNG</td>
                  <td><span className="status-badge-inline badge-paid">Verified</span></td>
                  <td><button className="btn-table-action" onClick={() => alert('ID verified.')}>View File</button></td>
                </tr>
                <tr>
                  <td>Transfer / Migration Certificate</td>
                  <td>PDF</td>
                  <td><span className="status-badge-inline badge-pending">Submission Pending</span></td>
                  <td><button className="btn-table-action btn-upload" onClick={() => alert('Please submit original transfer certificate at the campus registry.')}><UploadCloud size={14} /> Upload</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admission Slip Modal */}
      {showSlip && (
        <AdmissionSlip user={user} onClose={() => setShowSlip(false)} />
      )}
    </div>
  );
}
