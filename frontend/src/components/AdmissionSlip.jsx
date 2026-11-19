import React from 'react';
import { GraduationCap, Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

export default function AdmissionSlip({ user, onClose }) {
  if (!user) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header-actions no-print">
          <button className="btn-action-print" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Acknowledgment Slip</span>
          </button>
          <button className="btn-action-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Admission Slip Content */}
        <div className="admission-slip-sheet">
          <div className="slip-top-border"></div>

          <div className="slip-institution-header">
            <div className="slip-logo-badge">
              <GraduationCap size={44} />
            </div>
            <div className="slip-title-block">
              <h2>ABES ENGINEERING COLLEGE</h2>
              <h3>OFFICE OF ADMISSIONS & REGISTRAR</h3>
              <p>Approved by AICTE, Affiliated to Dr. A.P.J. Abdul Kalam Technical University</p>
              <span className="slip-academic-badge">Academic Session 2026 – 2027</span>
            </div>
          </div>

          <div className="slip-divider"></div>

          <div className="slip-subject-bar">
            <span>PROVISIONAL ADMISSION APPLICATION ACKNOWLEDGMENT SLIP</span>
          </div>

          <div className="slip-main-grid">
            <div className="slip-fields-column">
              <table className="slip-table">
                <tbody>
                  <tr>
                    <td className="field-title">Application Reference No:</td>
                    <td className="field-value highlight-id">{user.applicationNumber}</td>
                  </tr>
                  <tr>
                    <td className="field-title">Candidate Full Name:</td>
                    <td className="field-value"><strong>{user.name}</strong></td>
                  </tr>
                  <tr>
                    <td className="field-title">Applied Degree Program:</td>
                    <td className="field-value"><strong>{user.course}</strong></td>
                  </tr>
                  <tr>
                    <td className="field-title">Candidate Email:</td>
                    <td className="field-value">{user.email}</td>
                  </tr>
                  <tr>
                    <td className="field-title">Contact Mobile:</td>
                    <td className="field-value">{user.phone}</td>
                  </tr>
                  <tr>
                    <td className="field-title">Date of Birth:</td>
                    <td className="field-value">{user.dob || 'On Record'}</td>
                  </tr>
                  <tr>
                    <td className="field-title">Qualifying Exam Score:</td>
                    <td className="field-value">{user.qualifyingScore || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="field-title">Application Fee:</td>
                    <td className="field-value">
                      <span className={`status-badge-inline ${user.applicationFeeStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>
                        {user.applicationFeeStatus}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="field-title">Current Status:</td>
                    <td className="field-value">
                      <span className="status-badge-inline badge-status">
                        {user.admissionStatus}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="field-title">Registration Timestamp:</td>
                    <td className="field-value">{new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="slip-photo-column">
              <div className="slip-photo-frame">
                <div className="photo-placeholder-text">
                  <span>Candidate Photo</span>
                  <small>Affixed / Digital ID</small>
                </div>
              </div>
              <div className="slip-barcode-box">
                <div className="fake-barcode"></div>
                <span className="barcode-number">*{user.applicationNumber}*</span>
              </div>
            </div>
          </div>

          <div className="slip-guidelines">
            <h4>Important Instructions for Candidates:</h4>
            <ol>
              <li>This acknowledgment slip serves as proof of submission for Academic Session 2026-27.</li>
              <li>Please quote your Application Reference Number ({user.applicationNumber}) in all future correspondence with the Admissions Office.</li>
              <li>Document verification and personal interviews will be scheduled sequentially according to merit rank.</li>
              <li>Keep original marksheets, identity credentials, and transfer certificates ready for physical verification.</li>
            </ol>
          </div>

          <div className="slip-signatures">
            <div className="sig-block">
              <div className="sig-line"></div>
              <span>Candidate Signature</span>
            </div>
            <div className="sig-block verified-stamp">
              <div className="digital-seal">
                <ShieldCheck size={28} />
                <span>OFFICIALLY VERIFIED</span>
              </div>
            </div>
            <div className="sig-block">
              <div className="sig-line"></div>
              <span>Dean of Admissions</span>
              <small>ABES Engineering College</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
