import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils/format';

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const destination =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'reviewer'
          ? '/reviewer'
          : '/my-applications';
    return <Navigate to={destination} replace />;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      login(data.user, data.token);
      navigate('/apply', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not create your account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-grid">
        <div className="panel auth-card">
          <h1>Create a student account</h1>
          <p className="auth-sub">
            Register to fill and submit the admission form. You will use this account to check
            your application status.
          </p>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                required
                autoComplete="name"
                placeholder="As written in your Class 12 certificate"
                onChange={(event) => updateField('name', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={form.email}
                required
                autoComplete="email"
                placeholder="you@example.com"
                onChange={(event) => updateField('email', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="phone">Mobile number</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, ''))}
              />
              <span className="field-note">Optional, but useful for admission-related calls.</span>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                onChange={(event) => updateField('password', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                required
                autoComplete="new-password"
                placeholder="Enter the password again"
                onChange={(event) => updateField('confirmPassword', event.target.value)}
              />
            </div>

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Login here</Link>
          </p>
        </div>

        <aside className="auth-side">
          <h2>Documents to keep ready</h2>
          <ul className="ticks">
            <li>Passport size photograph</li>
            <li>Class 10 marksheet</li>
            <li>Class 12 marksheet</li>
            <li>Aadhaar, PAN or passport as ID proof</li>
          </ul>
          <p>
            You will need to upload these at the end of the admission form. The whole form usually
            takes 10 to 15 minutes.
          </p>
          <p className="small muted">
            If you face a problem while registering, write to admission.portal@abes.ac.in with your
            name and mobile number.
          </p>
        </aside>
      </div>
    </div>
  );
}
