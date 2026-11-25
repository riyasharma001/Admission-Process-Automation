import { useEffect, useState } from 'react';
import api from '../api/axios';
import { errorMessage, formatDate } from '../utils/format';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/notices')
      .then(({ data }) => {
        if (active) setNotices(data.notices);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load the notices.'));
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
      <div className="page-heading">
        <p className="eyebrow">Notice board</p>
        <h1>Admission notices</h1>
        <p>
          Important announcements about applications, document verification, merit lists and fee
          payment are published here.
        </p>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading notices…</p> : null}

      {!loading && !error && notices.length === 0 ? (
        <div className="empty-state">
          <h2>No notices right now</h2>
          <p>New announcements from the admission cell will appear here.</p>
        </div>
      ) : null}

      <div className="notice-board">
        {notices.map((notice) => (
          <article className="notice-item" key={notice._id}>
            <div className="notice-item-head">
              <h2>{notice.title}</h2>
              <span className="tag">{notice.category}</span>
            </div>
            <p className="notice-date-long">Published on {formatDate(notice.date)}</p>
            <p className="body">{notice.body}</p>
          </article>
        ))}
      </div>

      <p className="small muted notice-footnote">
        Notices are published by the admission cell. For any query, call +91 120 713 5111 or write
        to admissions@abes.ac.in.
      </p>
    </div>
  );
}
