import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { errorMessage, formatCurrency } from '../../utils/format';

const emptyForm = {
  code: '',
  name: '',
  degree: 'B.Tech',
  duration: '4 years',
  seats: '',
  feePerYear: '',
  eligibility: '',
  description: '',
  isActive: true,
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadCourses() {
    const { data } = await api.get('/courses', { params: { all: 'true' } });
    setCourses(data.courses);
  }

  useEffect(() => {
    let active = true;

    api
      .get('/courses', { params: { all: 'true' } })
      .then(({ data }) => {
        if (active) setCourses(data.courses);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load programmes.'));
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

  function resetForm() {
    setForm(emptyForm);
    setEditingId('');
  }

  function startEdit(course) {
    setEditingId(course._id);
    setForm({
      code: course.code,
      name: course.name,
      degree: course.degree,
      duration: course.duration,
      seats: String(course.seats),
      feePerYear: String(course.feePerYear),
      eligibility: course.eligibility || '',
      description: course.description || '',
      isActive: course.isActive,
    });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.code.trim() || !form.name.trim() || !form.degree.trim()) {
      setError('Course code, programme name and degree type are required.');
      return;
    }
    if (form.seats === '' || Number(form.seats) < 0) {
      setError('Enter a valid number of seats.');
      return;
    }
    if (form.feePerYear === '' || Number(form.feePerYear) < 0) {
      setError('Enter a valid annual fee.');
      return;
    }

    const payload = {
      ...form,
      seats: Number(form.seats),
      feePerYear: Number(form.feePerYear),
    };

    setSaving(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/courses/${editingId}`, payload);
        setMessage(data.message);
      } else {
        const { data } = await api.post('/courses', payload);
        setMessage(data.message);
      }
      resetForm();
      await loadCourses();
    } catch (err) {
      setError(errorMessage(err, 'Could not save the programme.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course) {
    const confirmed = window.confirm(
      `Remove ${course.name} (${course.code}) from the programme list?`
    );
    if (!confirmed) return;

    setError('');
    setMessage('');
    try {
      const { data } = await api.delete(`/courses/${course._id}`);
      setMessage(data.message);
      if (editingId === course._id) resetForm();
      await loadCourses();
    } catch (err) {
      setError(errorMessage(err, 'Could not remove the programme.'));
    }
  }

  return (
    <div className="container section">
      <div className="page-heading">
        <p className="eyebrow">Admission cell</p>
        <h1>Manage programmes</h1>
        <p>
          Add new programmes, revise seats and fees, or mark a programme inactive when admissions
          close.
        </p>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      <section className="panel">
        <h2>{editingId ? 'Edit programme' : 'Add a programme'}</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="code">Course code</label>
              <input
                id="code"
                type="text"
                value={form.code}
                required
                placeholder="e.g. CSE"
                onChange={(event) => update('code', event.target.value.toUpperCase())}
              />
            </div>
            <div className="field">
              <label htmlFor="degree">Degree</label>
              <select
                id="degree"
                value={form.degree}
                onChange={(event) => update('degree', event.target.value)}
              >
                <option value="B.Tech">B.Tech</option>
                <option value="MBA">MBA</option>
                <option value="MCA">MCA</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field span-2">
              <label htmlFor="name">Programme name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                required
                placeholder="e.g. Computer Science & Engineering"
                onChange={(event) => update('name', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="duration">Duration</label>
              <input
                id="duration"
                type="text"
                value={form.duration}
                placeholder="4 years"
                onChange={(event) => update('duration', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="seats">Sanctioned seats</label>
              <input
                id="seats"
                type="number"
                min="0"
                value={form.seats}
                required
                onChange={(event) => update('seats', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="feePerYear">Tuition fee per year (₹)</label>
              <input
                id="feePerYear"
                type="number"
                min="0"
                step="1000"
                value={form.feePerYear}
                required
                onChange={(event) => update('feePerYear', event.target.value)}
              />
            </div>
            <div className="field">
              <label className="checkbox-row status-checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => update('isActive', event.target.checked)}
                />
                <span>Open for admission</span>
              </label>
            </div>
            <div className="field span-2">
              <label htmlFor="eligibility">Eligibility</label>
              <textarea
                id="eligibility"
                value={form.eligibility}
                placeholder="Minimum qualification, subjects and entrance exam requirements"
                onChange={(event) => update('eligibility', event.target.value)}
              />
            </div>
            <div className="field span-2">
              <label htmlFor="description">Short description</label>
              <textarea
                id="description"
                value={form.description}
                placeholder="Two or three lines about the programme"
                onChange={(event) => update('description', event.target.value)}
              />
            </div>
          </div>

          <div className="form-actions form-actions-top">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add programme'}
            </button>
            {editingId ? (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Programme list</h2>
        {loading ? <p className="muted">Loading programmes…</p> : null}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Programme</th>
                <th>Degree</th>
                <th>Seats</th>
                <th>Fee / year</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>
                    <strong>{course.code}</strong>
                  </td>
                  <td>
                    {course.name}
                    <span className="sub">{course.duration}</span>
                  </td>
                  <td>{course.degree}</td>
                  <td>{course.seats}</td>
                  <td>₹{formatCurrency(course.feePerYear)}</td>
                  <td>
                    <span className={`mini-state ${course.isActive ? 'on' : 'off'}`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => startEdit(course)}
                    >
                      Edit
                    </button>{' '}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(course)}
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
