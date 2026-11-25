import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils/format';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      const destination =
        data.user.role === 'admin'
          ? '/admin'
          : data.user.role === 'reviewer'
            ? '/reviewer'
            : location.state?.from || '/my-applications';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not log in. Please check your email and password.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-grid">
        <div className="panel auth-card">
          <h1>Portal login</h1>
          <p className="auth-sub">
            Use your student, reviewer or admission staff account to continue.
          </p>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                required
                autoComplete="email"
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            New applicant? <Link to="/register">Create an account</Link>
          </p>
          <p className="auth-switch">
            <Link to="/">Back to home</Link>
          </p>
        </div>

        <aside className="auth-side">
          <h2>Admission office</h2>
          <p>
            Applications for the 2026–27 session are open for B.Tech, MBA and MCA programmes.
            Reviewers and admission staff can use the same login form to open the review desk.
          </p>
          <ul className="ticks">
            <li>One application per programme</li>
            <li>Upload documents up to 5 MB each</li>
            <li>Track the status from your dashboard</li>
          </ul>

          <div className="demo-box">
            <p>
              <strong>Demo accounts from the seed data</strong>
            </p>
            <p>
              Student: <code>student@example.com</code> / <code>Student@123</code>
            </p>
            <p>
              Admission staff: <code>admin@abes.ac.in</code> / <code>Admin@123</code>
            </p>
            <p>
              Reviewer: <code>reviewer@abes.ac.in</code> / <code>Reviewer@123</code>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
