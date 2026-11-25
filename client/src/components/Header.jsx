import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Admission helpline: +91 120 713 5111</span>
          <span className="topbar-right">
            <a href="mailto:admissions@abes.ac.in">admissions@abes.ac.in</a>
            <span className="topbar-separator">|</span>
            <span>Session 2026–27</span>
          </span>
        </div>
      </div>

      <div className="brandbar">
        <div className="container brand-inner">
          <Link to="/" className="brand">
            <img src="/assets/logo.png" alt="ABES Engineering College" className="brand-logo" />
            <span className="brand-text">
              <span className="brand-name">ABES Engineering College</span>
              <span className="brand-sub">
                Ghaziabad, Uttar Pradesh &middot; NAAC A+ &middot; Affiliated to AKTU
              </span>
            </span>
          </Link>
          <div className="brand-note">
            Admission Management Portal
            <span>Online applications for the 2026–27 session</span>
          </div>
        </div>
      </div>

      <nav className="main-nav">
        <div className="container nav-inner">
          <div className="nav-links">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/courses">Programmes</NavLink>
            <NavLink to="/notices">Notices</NavLink>

            {user?.role === 'student' && <NavLink to="/my-applications">My applications</NavLink>}
            {user?.role === 'student' && <NavLink to="/apply">Apply online</NavLink>}

            {user?.role === 'reviewer' && (
              <NavLink to="/reviewer" end>
                Review desk
              </NavLink>
            )}
            {user?.role === 'reviewer' && (
              <NavLink to="/reviewer/applications">All applications</NavLink>
            )}

            {user?.role === 'admin' && (
              <NavLink to="/admin" end>
                Dashboard
              </NavLink>
            )}
            {user?.role === 'admin' && <NavLink to="/admin/applications">Applications</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin/courses">Manage programmes</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin/notices">Manage notices</NavLink>}
          </div>

          <div className="nav-account">
            {user ? (
              <>
                <span className="nav-user">
                  Signed in as <strong>{user.name}</strong>
                  {user.role !== 'student' ? (
                    <span className="nav-role">
                      {user.role === 'admin' ? 'Administrator' : 'Reviewer'}
                    </span>
                  ) : null}
                </span>
                <button type="button" className="nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-login">
                  Login
                </Link>
                <Link to="/register" className="nav-register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
