import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { errorMessage, formatCurrency } from '../utils/format';

const documentFields = [
  {
    field: 'photo',
    label: 'Passport size photograph',
    hint: 'JPG or PNG, up to 5 MB',
    accept: '.jpg,.jpeg,.png',
  },
  {
    field: 'marksheet10',
    label: 'Class 10 marksheet',
    hint: 'JPG, PNG or PDF, up to 5 MB',
    accept: '.jpg,.jpeg,.png,.pdf',
  },
  {
    field: 'marksheet12',
    label: 'Class 12 marksheet',
    hint: 'JPG, PNG or PDF, up to 5 MB',
    accept: '.jpg,.jpeg,.png,.pdf',
  },
  {
    field: 'idProof',
    label: 'Photo ID proof',
    hint: 'Aadhaar, PAN or passport. JPG, PNG or PDF, up to 5 MB',
    accept: '.jpg,.jpeg,.png,.pdf',
  },
];

export default function Apply() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillCourse = searchParams.get('course') || '';

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [personal, setPersonal] = useState(() => ({
    fullName: user?.name || '',
    dob: '',
    gender: '',
    category: '',
    fatherName: '',
    motherName: '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: 'Uttar Pradesh',
    pincode: '',
  }));
  const [academics, setAcademics] = useState({
    tenth: { board: '', school: '', passingYear: '', percentage: '' },
    twelfth: { board: '', school: '', passingYear: '', percentage: '', stream: '' },
    entrance: { exam: '', rollNumber: '', score: '', rank: '' },
  });
  const [files, setFiles] = useState({});
  const [declaration, setDeclaration] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get('/courses')
      .then(({ data }) => {
        if (!active) return;
        setCourses(data.courses);
        if (prefillCourse && data.courses.some((course) => course._id === prefillCourse)) {
          setCourseId(prefillCourse);
        }
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load the programme list.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [prefillCourse]);

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const selectedCourse = courses.find((course) => course._id === courseId) || null;
  const today = new Date().toISOString().split('T')[0];

  function updatePersonal(field, value) {
    setPersonal((current) => ({ ...current, [field]: value }));
  }

  function updateAcademic(section, field, value) {
    setAcademics((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  }

  function handleFile(field, label, file) {
    if (!file) {
      setFiles((current) => ({ ...current, [field]: null }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(`${label} must be 5 MB or smaller.`);
      return;
    }
    setError('');
    setFiles((current) => ({ ...current, [field]: file }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!courseId) {
      setError('Please select the programme you want to apply for.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const missing = documentFields.filter((document) => !files[document.field]);
    if (missing.length) {
      setError(`Please upload: ${missing.map((document) => document.label).join(', ')}.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!declaration) {
      setError('Please accept the declaration before submitting your application.');
      return;
    }

    const formData = new FormData();
    formData.append('course', courseId);
    formData.append('personal', JSON.stringify(personal));
    formData.append('academics', JSON.stringify(academics));
    documentFields.forEach((document) => {
      formData.append(document.field, files[document.field]);
    });

    setSubmitting(true);
    try {
      const { data } = await api.post('/applications', formData);
      navigate(`/applications/${data.application._id}`, {
        replace: true,
        state: { justSubmitted: true },
      });
    } catch (err) {
      setError(
        errorMessage(err, 'Could not submit your application. Please check the details and try again.')
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section">
      <div className="page-heading">
        <p className="eyebrow">Admission form · 2026–27</p>
        <h1>Online admission application</h1>
        <p>
          Fill all the sections below. Fields marked with an asterisk (*) are required. One student
          can submit one application per programme.
        </p>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <form className="apply-form" onSubmit={handleSubmit}>
        <section className="panel form-panel">
          <h2>1. Programme</h2>
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="course">
                Select programme <span className="required">*</span>
              </label>
              <select
                id="course"
                value={courseId}
                required
                onChange={(event) => setCourseId(event.target.value)}
              >
                <option value="">Select a programme</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
              {loading ? <span className="field-note">Loading programmes…</span> : null}
            </div>
          </div>

          {selectedCourse ? (
            <div className="selected-course">
              <p>
                <strong>{selectedCourse.name}</strong> · {selectedCourse.duration} ·{' '}
                {selectedCourse.seats} seats
              </p>
              <p>Tuition fee: ₹{formatCurrency(selectedCourse.feePerYear)} per year</p>
              <p className="muted small">{selectedCourse.eligibility}</p>
            </div>
          ) : null}
        </section>

        <section className="panel form-panel">
          <h2>2. Personal details</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="fullName">
                Full name <span className="required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={personal.fullName}
                required
                onChange={(event) => updatePersonal('fullName', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="dob">
                Date of birth <span className="required">*</span>
              </label>
              <input
                id="dob"
                type="date"
                value={personal.dob}
                max={today}
                required
                onChange={(event) => updatePersonal('dob', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="gender">
                Gender <span className="required">*</span>
              </label>
              <select
                id="gender"
                value={personal.gender}
                required
                onChange={(event) => updatePersonal('gender', event.target.value)}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                value={personal.category}
                required
                onChange={(event) => updatePersonal('category', event.target.value)}
              >
                <option value="">Select</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="fatherName">
                Father&apos;s name <span className="required">*</span>
              </label>
              <input
                id="fatherName"
                type="text"
                value={personal.fatherName}
                required
                onChange={(event) => updatePersonal('fatherName', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="motherName">
                Mother&apos;s name <span className="required">*</span>
              </label>
              <input
                id="motherName"
                type="text"
                value={personal.motherName}
                required
                onChange={(event) => updatePersonal('motherName', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">
                Mobile number <span className="required">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={personal.phone}
                required
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                onChange={(event) =>
                  updatePersonal('phone', event.target.value.replace(/\D/g, ''))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="email">
                Email address <span className="required">*</span>
              </label>
              <input id="email" type="email" value={personal.email} readOnly />
              <span className="field-note">This is the email on your account.</span>
            </div>
            <div className="field span-2">
              <label htmlFor="address">
                Address <span className="required">*</span>
              </label>
              <textarea
                id="address"
                value={personal.address}
                required
                placeholder="House number, street and locality"
                onChange={(event) => updatePersonal('address', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="city">
                City / town <span className="required">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={personal.city}
                required
                onChange={(event) => updatePersonal('city', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="state">
                State <span className="required">*</span>
              </label>
              <input
                id="state"
                type="text"
                value={personal.state}
                required
                onChange={(event) => updatePersonal('state', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="pincode">
                PIN code <span className="required">*</span>
              </label>
              <input
                id="pincode"
                type="text"
                value={personal.pincode}
                required
                inputMode="numeric"
                maxLength={6}
                onChange={(event) =>
                  updatePersonal('pincode', event.target.value.replace(/\D/g, ''))
                }
              />
            </div>
          </div>
        </section>

        <section className="panel form-panel">
          <h2>3. Academic details</h2>
          <p className="form-section-note">
            Enter the marks as printed on your marksheet. For a grading system, convert the grade
            to an equivalent percentage if available.
          </p>

          <h3 className="form-subhead">Class 10</h3>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="tenthBoard">
                Board <span className="required">*</span>
              </label>
              <input
                id="tenthBoard"
                type="text"
                value={academics.tenth.board}
                required
                placeholder="CBSE, ICSE, UP Board…"
                onChange={(event) => updateAcademic('tenth', 'board', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="tenthSchool">
                School name <span className="required">*</span>
              </label>
              <input
                id="tenthSchool"
                type="text"
                value={academics.tenth.school}
                required
                onChange={(event) => updateAcademic('tenth', 'school', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="tenthYear">
                Passing year <span className="required">*</span>
              </label>
              <input
                id="tenthYear"
                type="number"
                value={academics.tenth.passingYear}
                required
                min="1990"
                max="2026"
                placeholder="2022"
                onChange={(event) => updateAcademic('tenth', 'passingYear', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="tenthPercentage">
                Percentage <span className="required">*</span>
              </label>
              <input
                id="tenthPercentage"
                type="number"
                value={academics.tenth.percentage}
                required
                min="0"
                max="100"
                step="0.01"
                placeholder="88.5"
                onChange={(event) => updateAcademic('tenth', 'percentage', event.target.value)}
              />
            </div>
          </div>

          <h3 className="form-subhead">Class 12</h3>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="twelfthBoard">
                Board <span className="required">*</span>
              </label>
              <input
                id="twelfthBoard"
                type="text"
                value={academics.twelfth.board}
                required
                onChange={(event) => updateAcademic('twelfth', 'board', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="twelfthSchool">
                School name <span className="required">*</span>
              </label>
              <input
                id="twelfthSchool"
                type="text"
                value={academics.twelfth.school}
                required
                onChange={(event) => updateAcademic('twelfth', 'school', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="twelfthStream">Stream</label>
              <input
                id="twelfthStream"
                type="text"
                value={academics.twelfth.stream}
                placeholder="Physics, Chemistry, Mathematics"
                onChange={(event) => updateAcademic('twelfth', 'stream', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="twelfthYear">
                Passing year <span className="required">*</span>
              </label>
              <input
                id="twelfthYear"
                type="number"
                value={academics.twelfth.passingYear}
                required
                min="1990"
                max="2026"
                placeholder="2024"
                onChange={(event) => updateAcademic('twelfth', 'passingYear', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="twelfthPercentage">
                Percentage <span className="required">*</span>
              </label>
              <input
                id="twelfthPercentage"
                type="number"
                value={academics.twelfth.percentage}
                required
                min="0"
                max="100"
                step="0.01"
                placeholder="82.4"
                onChange={(event) => updateAcademic('twelfth', 'percentage', event.target.value)}
              />
            </div>
          </div>

          <h3 className="form-subhead">Entrance examination (if applicable)</h3>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="entranceExam">Examination</label>
              <select
                id="entranceExam"
                value={academics.entrance.exam}
                onChange={(event) => updateAcademic('entrance', 'exam', event.target.value)}
              >
                <option value="">Not appeared / not applicable</option>
                <option value="JEE Main">JEE Main</option>
                <option value="CUET">CUET</option>
                <option value="UPCET">UPCET</option>
                <option value="CAT">CAT</option>
                <option value="MAT">MAT</option>
                <option value="CMAT">CMAT</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="entranceRoll">Roll number</label>
              <input
                id="entranceRoll"
                type="text"
                value={academics.entrance.rollNumber}
                onChange={(event) => updateAcademic('entrance', 'rollNumber', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="entranceScore">Score / percentile</label>
              <input
                id="entranceScore"
                type="text"
                value={academics.entrance.score}
                placeholder="e.g. 92.4 percentile"
                onChange={(event) => updateAcademic('entrance', 'score', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="entranceRank">All India rank</label>
              <input
                id="entranceRank"
                type="text"
                value={academics.entrance.rank}
                onChange={(event) => updateAcademic('entrance', 'rank', event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="panel form-panel">
          <h2>4. Documents</h2>
          <p className="form-section-note">
            All four documents are required. Files should be clear and within 5 MB.
          </p>

          {documentFields.map((document) => (
            <div className="file-row" key={document.field}>
              <div>
                <label htmlFor={`file-${document.field}`}>
                  {document.label} <span className="required">*</span>
                </label>
                <span className="field-note">{document.hint}</span>
              </div>
              <div>
                <input
                  id={`file-${document.field}`}
                  type="file"
                  accept={document.accept}
                  onChange={(event) =>
                    handleFile(document.field, document.label, event.target.files[0])
                  }
                />
                {files[document.field] ? (
                  <span className="file-name">
                    {files[document.field].name} ({(files[document.field].size / 1024).toFixed(0)}{' '}
                    KB)
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </section>

        <section className="panel form-panel">
          <h2>5. Declaration</h2>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={declaration}
              onChange={(event) => setDeclaration(event.target.checked)}
            />
            <span>
              I declare that the information given in this form is true to the best of my knowledge.
              I understand that if any detail is found incorrect, my admission may be cancelled
              without refund.
            </span>
          </label>

          <div className="submit-bar">
            <p>
              After submitting, you can view and print your application from the dashboard. Keep
              your application number safe.
            </p>
            <div className="form-actions">
              <button type="submit" className="btn" disabled={submitting || !courses.length}>
                {submitting ? 'Submitting application…' : 'Submit application'}
              </button>
              <Link to="/my-applications" className="btn btn-outline">
                Cancel
              </Link>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
