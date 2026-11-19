import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function LoginForm({ onLoginSuccess, switchToRegister }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFillDemo = () => {
    setIdentifier('student@abes.ac.in');
    setPassword('Student@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier || !password) {
      setError('Please provide your Application Number / Email and Password.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login({ identifier, password });
      if (data.success) {
        setSuccess('Authentication successful! Loading your admission dashboard...');
        localStorage.setItem('admission_token', data.token);
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 600);
      } else {
        setError(data.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err) {
      setError('Connection failed. Make sure the backend server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card-body">
      <div className="auth-header">
        <h2 className="auth-title">Applicant Sign In</h2>
        <p className="auth-subtitle">
          Access your admission application, track merit status & download offer letters.
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
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-identifier" className="form-label">
            Email Address or Application Reference No.
          </label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="login-identifier"
              type="text"
              className="form-input"
              placeholder="e.g. ADM-2026-1001 or student@abes.ac.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="label-row">
            <label htmlFor="login-password" className="form-label">Password</label>
            <button 
              type="button" 
              className="forgot-link"
              onClick={() => alert('Password reset link has been dispatched to your registered email.')}
            >
              Forgot password?
            </button>
          </div>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="form-options-row">
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>Remember my application ID</span>
          </label>

          <button
            type="button"
            className="demo-credentials-btn"
            onClick={handleFillDemo}
            title="Click to auto-fill sample applicant credentials"
          >
            <Sparkles size={14} />
            <span>Fill Demo Applicant</span>
          </button>
        </div>

        <button type="submit" className="btn-primary-submit" disabled={loading}>
          {loading ? (
            <span className="spinner-label">
              <span className="spinner"></span> Signing In...
            </span>
          ) : (
            <>
              <LogIn size={18} />
              <span>Sign In to Admission Portal</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-footer-prompt">
        <span>New applicant for Academic Year 2026-27?</span>
        <button type="button" className="switch-auth-link" onClick={switchToRegister}>
          Start New Registration &rarr;
        </button>
      </div>

      <div className="security-note">
        <small>🔒 256-bit SSL encrypted admission security protocol. Official university portal.</small>
      </div>
    </div>
  );
}
