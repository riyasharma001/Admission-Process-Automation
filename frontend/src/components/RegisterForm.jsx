import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, BookOpen, Award, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_COURSES = [
  { id: 'btech-cse', name: 'B.Tech - Computer Science & Engineering (4 Years)' },
  { id: 'btech-ai', name: 'B.Tech - Artificial Intelligence & Data Science (4 Years)' },
  { id: 'btech-ece', name: 'B.Tech - Electronics & Communication (4 Years)' },
  { id: 'bba', name: 'BBA - Business Analytics & Marketing (3 Years)' },
  { id: 'mtech-cs', name: 'M.Tech - Cloud & Cyber Security (2 Years)' }
];

export default function RegisterForm({ onRegisterSuccess, switchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    course: 'B.Tech - Computer Science & Engineering (4 Years)',
    qualifyingScore: '',
    password: '',
    confirmPassword: ''
  });

  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdApplicant, setCreatedApplicant] = useState(null);

  useEffect(() => {
    // Attempt to load live programs from backend
    api.getPrograms()
      .then((res) => {
        if (res.success && res.programs && res.programs.length > 0) {
          setCourses(res.programs.map(p => ({
            id: p.id,
            name: `${p.name} (${p.duration})`
          })));
        }
      })
      .catch(() => {
        // Fallback to default
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Please enter your full name as printed on school certificates.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid personal email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide your active mobile phone number for SMS alerts.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }
    if (!agreed) {
      setError('Please accept the admission declaration before submitting.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        course: formData.course,
        qualifyingScore: formData.qualifyingScore || 'Pending Verification',
        password: formData.password
      });

      if (data.success) {
        setCreatedApplicant(data.user);
        setSuccess(`Application registered successfully! Application ID: ${data.user.applicationNumber}`);
        localStorage.setItem('admission_token', data.token);
        setTimeout(() => {
          onRegisterSuccess(data.user, data.token);
        }, 1200);
      } else {
        setError(data.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setError('Failed to reach backend server. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card-body">
      <div className="auth-header">
        <h2 className="auth-title">New Applicant Registration</h2>
        <p className="auth-subtitle">
          Submit your official candidate profile for Academic Year 2026-27 admission consideration.
        </p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-box alert-success">
          <CheckCircle size={18} />
          <div>
            <strong>{success}</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Redirecting to your Admission Status Dashboard...
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form register-form-grid">
        {/* Full Name */}
        <div className="form-group grid-col-2">
          <label htmlFor="reg-name" className="form-label">Full Name (as per Grade 10 Marksheet) *</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              id="reg-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">Email Address *</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="applicant@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="reg-phone" className="form-label">Mobile Number *</label>
          <div className="input-wrapper">
            <Phone className="input-icon" size={18} />
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label htmlFor="reg-dob" className="form-label">Date of Birth</label>
          <div className="input-wrapper">
            <Calendar className="input-icon" size={18} />
            <input
              id="reg-dob"
              name="dob"
              type="date"
              className="form-input"
              value={formData.dob}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Qualifying Score */}
        <div className="form-group">
          <label htmlFor="reg-score" className="form-label">Qualifying Exam Score / %</label>
          <div className="input-wrapper">
            <Award className="input-icon" size={18} />
            <input
              id="reg-score"
              name="qualifyingScore"
              type="text"
              className="form-input"
              placeholder="e.g. 92.4% or GPA 3.8"
              value={formData.qualifyingScore}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Desired Program / Course */}
        <div className="form-group grid-col-2">
          <label htmlFor="reg-course" className="form-label">Select Degree Program *</label>
          <div className="input-wrapper">
            <BookOpen className="input-icon" size={18} />
            <select
              id="reg-course"
              name="course"
              className="form-input form-select"
              value={formData.course}
              onChange={handleChange}
              disabled={loading}
              required
            >
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="reg-pass" className="form-label">Create Password *</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="reg-pass"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="reg-conf-pass" className="form-label">Confirm Password *</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="reg-conf-pass"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Declaration */}
        <div className="form-group grid-col-2">
          <label className="checkbox-label declaration-label">
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
              required
            />
            <span>
              I declare that all entries made in this application are true and correct. I accept ABES Engineering College's admission guidelines and code of conduct.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="form-group grid-col-2">
          <button type="submit" className="btn-primary-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-label">
                <span className="spinner"></span> Creating Application Profile...
              </span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Submit Admission Application</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="auth-footer-prompt">
        <span>Already have an existing application or credentials?</span>
        <button type="button" className="switch-auth-link" onClick={switchToLogin}>
          Sign In to Portal &rarr;
        </button>
      </div>
    </div>
  );
}
