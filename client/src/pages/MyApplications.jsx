import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { errorMessage, formatDate } from '../utils/format';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/applications/my')
      .then(({ data }) => {
        if (active) setApplications(data.applications);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load your applications.'));
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
          <p className="eyebrow">Applicant dashboard</p>
          <h1>My applications</h1>
          <p>Check the status of your admission applications or apply for another programme.</p>
        </div>
        <Link to="/apply" className="btn">
          Apply for a programme
        </Link>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading your applications…</p> : null}

      {!loading && !error && applications.length === 0 ? (
        <div className="empty-state">
          <h2>You have not applied yet</h2>
          <p>Fill the online admission form to apply for a programme.</p>
          <Link to="/apply" className="btn">
            Start your application
          </Link>
        </div>
      ) : null}

      {applications.length > 0 ? (
        <div className="panel table-panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application no.</th>
                  <th>Programme</th>
                  <th>Submitted on</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <strong>{application.applicationNo}</strong>
                    </td>
                    <td>
                      {application.course ? application.course.name : 'Programme removed'}
                      <span className="sub">{application.course?.code}</span>
                    </td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="actions">
                      <Link to={`/applications/${application._id}`} className="btn btn-outline btn-sm">
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <p className="small muted">
        Applications are usually reviewed within 3 to 5 working days. Keep your application number
        safe for all future correspondence with the admission cell.
      </p>
    </div>
  );
}
