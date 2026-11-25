import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { errorMessage, formatDate } from '../../utils/format';

const STATUS_OPTIONS = ['Submitted', 'Under Review', 'Documents Pending', 'Approved', 'Rejected'];

export default function AdminApplications({ reviewerMode = false }) {
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('');
  const [course, setCourse] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api
      .get('/courses', { params: { all: 'true' } })
      .then(({ data }) => setCourses(data.courses))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const timer = setTimeout(() => {
      const params = {};
      if (status) params.status = status;
      if (course) params.course = course;
      if (search.trim()) params.q = search.trim();

      api
        .get('/applications', { params })
        .then(({ data }) => {
          if (!active) return;
          setApplications(data.applications);
          setError('');
        })
        .catch((err) => {
          if (active) setError(errorMessage(err, 'Could not load applications.'));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [status, course, search]);

  function resetFilters() {
    setStatus('');
    setCourse('');
    setSearch('');
  }

  async function exportCsv() {
    setExporting(true);
    setError('');
    try {
      const response = await api.get('/applications/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'abes-applications.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorMessage(err, 'Could not prepare the CSV file.'));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="container section">
      <div className="page-heading">
        <p className="eyebrow">{reviewerMode ? 'Review desk' : 'Admission cell'}</p>
        <h1>{reviewerMode ? 'Review queue' : 'Applications'}</h1>
        <p>
          {reviewerMode
            ? 'Open any form to verify details, inspect documents and record a decision.'
            : 'Search, filter and review all admission applications received for the session.'}
        </p>
      </div>

      <div className="panel filter-panel">
        <div className="field">
          <label htmlFor="filterStatus">Status</label>
          <select id="filterStatus" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filterCourse">Programme</label>
          <select id="filterCourse" value={course} onChange={(event) => setCourse(event.target.value)}>
            <option value="">All programmes</option>
            {courses.map((item) => (
              <option key={item._id} value={item._id}>
                {item.code} — {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filterSearch">Search</label>
          <input
            id="filterSearch"
            type="search"
            value={search}
            placeholder="Application no., name or email"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>
            Reset
          </button>
          <button type="button" className="btn btn-sm" onClick={exportCsv} disabled={exporting}>
            {exporting ? 'Preparing…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="list-meta">
        <span>
          {loading
            ? 'Loading applications…'
            : `${applications.length} application${applications.length === 1 ? '' : 's'} found`}
        </span>
      </div>

      <div className="panel table-panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application no.</th>
                <th>Applicant</th>
                <th>Programme</th>
                <th>Submitted on</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!loading && applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No applications match these filters.
                  </td>
                </tr>
              ) : null}

              {applications.map((application) => (
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
                  <td>{formatDate(application.createdAt)}</td>
                  <td>
                    <StatusBadge status={application.status} />
                  </td>
                  <td className="actions">
                    <Link
                      to={`/applications/${application._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      {reviewerMode ? 'Review' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="small muted">
        {reviewerMode
          ? 'Tip: complete the verification checklist before approving a form. Notes are shown to the applicant when a decision is recorded.'
          : 'Tip: open an application to complete the review checklist, record a decision and add remarks for the applicant.'}
      </p>
    </div>
  );
}
