import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { errorMessage, formatDate } from '../../utils/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/applications/stats')
      .then(({ data }) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load the dashboard data.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const highestCourseCount =
    stats && stats.byCourse.length > 0 ? Math.max(...stats.byCourse.map((row) => row.count)) : 1;

  return (
    <div className="container section">
      <div className="page-heading page-heading-row">
        <div>
          <p className="eyebrow">Admission cell · 2026–27</p>
          <h1>Dashboard</h1>
          <p>Overview of applications received through the admission portal.</p>
        </div>
        <Link to="/admin/applications" className="btn">
          Review applications
        </Link>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading dashboard…</p> : null}

      {stats ? (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total applications</div>
              <div className="stat-value">{stats.totalApplications}</div>
              <div className="stat-note">All programmes, current session</div>
            </div>
            <div className="stat-card stat-warn">
              <div className="stat-label">Pending review</div>
              <div className="stat-value">{stats.pendingApplications}</div>
              <div className="stat-note">Submitted, under review or documents pending</div>
            </div>
            <div className="stat-card stat-ok">
              <div className="stat-label">Approved</div>
              <div className="stat-value">{stats.statusCounts.Approved}</div>
              <div className="stat-note">Eligibility confirmed</div>
            </div>
            <div className="stat-card stat-danger">
              <div className="stat-label">Rejected</div>
              <div className="stat-value">{stats.statusCounts.Rejected}</div>
              <div className="stat-note">Closed by the admission cell</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Registered students</div>
              <div className="stat-value">{stats.totalStudents}</div>
              <div className="stat-note">Student accounts on the portal</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active programmes</div>
              <div className="stat-value">{stats.activeCourses}</div>
              <div className="stat-note">Open for admission</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="section-heading">
                <h2>Recent applications</h2>
                <Link to="/admin/applications" className="text-link">
                  View all
                </Link>
              </div>

              {stats.recentApplications.length === 0 ? (
                <p className="muted">No applications have been received yet.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Application</th>
                        <th>Applicant</th>
                        <th>Programme</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentApplications.map((application) => (
                        <tr key={application._id}>
                          <td>
                            <strong>{application.applicationNo}</strong>
                            <span className="sub">{formatDate(application.createdAt)}</span>
                          </td>
                          <td>
                            {application.personal.fullName}
                            <span className="sub">{application.applicant?.email}</span>
                          </td>
                          <td>{application.course ? application.course.code : '—'}</td>
                          <td>
                            <StatusBadge status={application.status} />
                          </td>
                          <td className="actions">
                            <Link
                              to={`/applications/${application._id}`}
                              className="btn btn-outline btn-sm"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <aside>
              <section className="panel">
                <h2>Applications by programme</h2>
                {stats.byCourse.length === 0 ? (
                  <p className="muted">No applications yet.</p>
                ) : (
                  stats.byCourse.map((row) => (
                    <div className="bar-row" key={row.code + row.name}>
                      <span title={row.name}>{row.code}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${(row.count / highestCourseCount) * 100}%` }}
                        />
                      </div>
                      <span>{row.count}</span>
                    </div>
                  ))
                )}
              </section>

              <section className="panel">
                <h2>Status summary</h2>
                <dl className="compact-list">
                  {Object.entries(stats.statusCounts).map(([label, count]) => (
                    <div key={label}>
                      <dt>
                        <StatusBadge status={label} />
                      </dt>
                      <dd>{count}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="panel">
                <h2>Quick links</h2>
                <ul className="quick-links">
                  <li>
                    <Link to="/admin/courses">Add or edit programmes</Link>
                  </li>
                  <li>
                    <Link to="/admin/notices">Publish a notice</Link>
                  </li>
                  <li>
                    <Link to="/admin/applications">Search and export applications</Link>
                  </li>
                </ul>
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
