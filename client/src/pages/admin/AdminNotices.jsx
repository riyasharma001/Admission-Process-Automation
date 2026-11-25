import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { errorMessage, formatDate } from '../../utils/format';

const emptyForm = { title: '', body: '', category: 'Admission' };

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/notices', { params: { all: 'true' } })
      .then(({ data }) => {
        if (active) setNotices(data.notices);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load notices.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.title.trim() || !form.body.trim()) {
      setError('Please enter both a title and the notice details.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post('/notices', form);
      setMessage(data.message);
      setForm(emptyForm);
      const response = await api.get('/notices', { params: { all: 'true' } });
      setNotices(response.data.notices);
    } catch (err) {
      setError(errorMessage(err, 'Could not publish the notice.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleNotice(notice) {
    setError('');
    setMessage('');
    try {
      const { data } = await api.put(`/notices/${notice._id}`, { isActive: !notice.isActive });
      setNotices((current) =>
        current.map((item) => (item._id === notice._id ? data.notice : item))
      );
      setMessage(data.message);
    } catch (err) {
      setError(errorMessage(err, 'Could not update the notice.'));
    }
  }

  async function deleteNotice(notice) {
    const confirmed = window.confirm(`Delete the notice "${notice.title}"?`);
    if (!confirmed) return;

    setError('');
    setMessage('');
    try {
      const { data } = await api.delete(`/notices/${notice._id}`);
      setNotices((current) => current.filter((item) => item._id !== notice._id));
      setMessage(data.message);
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the notice.'));
    }
  }

  return (
    <div className="container section">
      <div className="page-heading">
        <p className="eyebrow">Admission cell</p>
        <h1>Manage notices</h1>
        <p>Publish announcements for applicants. Unpublished notices stay hidden from the website.</p>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      <section className="panel">
        <h2>Publish a notice</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="noticeTitle">Title</label>
              <input
                id="noticeTitle"
                type="text"
                value={form.title}
                required
                placeholder="Short heading shown on the notice board"
                onChange={(event) => update('title', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="noticeCategory">Category</label>
              <select
                id="noticeCategory"
                value={form.category}
                onChange={(event) => update('category', event.target.value)}
              >
                <option value="Admission">Admission</option>
                <option value="Examination">Examination</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="field span-2">
              <label htmlFor="noticeBody">Notice details</label>
              <textarea
                id="noticeBody"
                value={form.body}
                required
                rows={5}
                placeholder="Write the complete notice. Include dates and reporting instructions where applicable."
                onChange={(event) => update('body', event.target.value)}
              />
            </div>
          </div>
          <div className="form-actions form-actions-top">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Publishing…' : 'Publish notice'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Published notices</h2>
        {loading ? <p className="muted">Loading notices…</p> : null}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Published on</th>
                <th>Notice</th>
                <th>Category</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!loading && notices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty">
                    No notices have been published yet.
                  </td>
                </tr>
              ) : null}

              {notices.map((notice) => (
                <tr key={notice._id}>
                  <td>{formatDate(notice.date)}</td>
                  <td>
                    <strong>{notice.title}</strong>
                    <span className="sub notice-preview">
                      {notice.body.length > 110 ? `${notice.body.slice(0, 110)}…` : notice.body}
                    </span>
                  </td>
                  <td>{notice.category}</td>
                  <td>
                    <span className={`mini-state ${notice.isActive ? 'on' : 'off'}`}>
                      {notice.isActive ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => toggleNotice(notice)}
                    >
                      {notice.isActive ? 'Unpublish' : 'Publish'}
                    </button>{' '}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteNotice(notice)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
