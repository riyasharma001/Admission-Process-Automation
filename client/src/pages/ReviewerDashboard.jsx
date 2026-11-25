import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { errorMessage, formatDate } from '../utils/format';

const ACTIONABLE_STATUSES = ['Submitted', 'Under Review', 'Documents Pending'];

export default function ReviewerDashboard() {
  const [stats, setStats] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([api.get('/applications/stats'), api.get('/applications')])
      .then(([statsResponse, applicationsResponse]) => {
        if (!active) return;
        setStats(statsResponse.data);

        const actionable = (applicationsResponse.data.applications || [])
          .filter((application) => ACTIONABLE_STATUSES.includes(application.status))
          .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt))
          .slice(0, 8);

        setQueue(actionable);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load the review queue.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container section">
      <div className="page-heading page-heading-row">
        <div>
          <p className="eyebrow">Review desk · 2026–27</p>
          <h1>Applications waiting for review</h1>
          <p>
            Open each form, compare the details with the uploaded documents, complete the
            verification checklist and record a decision for the applicant.
          </p>
        </div>
        <Link to="/reviewer/applications" className="btn">
          Open review queue
        </Link>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading the review desk…</p> : null}

      {stats ? (
        <>
          <div className="stat-grid">
            <div className="stat-card stat-warn">
              <div className="stat-label">Awaiting first review</div>
              <div className="stat-value">{stats.statusCounts.Submitted}</div>
              <div className="stat-note">Newly submitted applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Under review</div>
              <div className="stat-value">{stats.statusCounts['Under Review']}</div>
              <div className="stat-note">Applications currently being checked</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Documents pending</div>
              <div className="stat-value">{stats.statusCounts['Documents Pending']}</div>
              <div className="stat-note">Waiting for applicants to respond</div>
            </div>
            <div className="stat-card stat-ok">
              <div className="stat-label">Approved</div>
              <div className="stat-value">{stats.statusCounts.Approved}</div>
              <div className="stat-note">Eligibility and documents confirmed</div>
            </div>
            <div className="stat-card stat-danger">
              <div className="stat-label">Rejected</div>
              <div className="stat-value">{stats.statusCounts.Rejected}</div>
              <div className="stat-note">Closed with a recorded reason</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total applications</div>
              <div className="stat-value">{stats.totalApplications}</div>
              <div className="stat-note">All programmes for this session</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="section-heading">
                <h2>Needs action</h2>
                <Link to="/reviewer/applications" className="text-link">
                  View all applications
                </Link>
              </div>

              {queue.length === 0 ? (
                <div className="empty-state">
                  <h2>Review queue is clear</h2>
                  <p>There are no submitted or pending applications right now.</p>
                </div>
              ) : (
                <>
                  <p className="small muted queue-note">Oldest applications are shown first.</p>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Application</th>
                          <th>Applicant</th>
                          <th>Programme</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {queue.map((application) => (
                          <tr key={application._id}>
                            <td>
                              <strong>{application.applicationNo}</strong>
                            </td>
                            <td>
                              {application.personal.fullName}
                              <span className="sub">
                                {application.applicant?.email || application.personal.email}
                              </span>
                            </td>
                            <td>
                              {application.course ? application.course.name : '—'}
                              <span className="sub">{application.course?.code}</span>
                            </td>
                            <td>
                              <StatusBadge status={application.status} />
                            </td>
                            <td>{formatDate(application.createdAt)}</td>
                            <td className="actions">
                              <Link
                                to={`/applications/${application._id}`}
                                className="btn btn-outline btn-sm"
                              >
                                Review
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            <aside>
              <section className="panel">
                <h2>How to review</h2>
                <ol className="review-steps">
                  <li>Open the application and read every section of the form.</li>
                  <li>Open the photograph, marksheets and ID proof.</li>
                  <li>Tick the four verification checks once each item matches.</li>
                  <li>Add a note, then request documents, approve or reject.</li>
                </ol>
              </section>

              <section className="panel">
                <h2>Your access</h2>
                <p className="small">
                  Reviewers can view every application, download the CSV list and record decisions.
                  Programme and notice management stays with the admission administrator.
                </p>
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
