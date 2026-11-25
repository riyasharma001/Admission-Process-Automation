import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { errorMessage, formatCurrency, formatDate, formatDateTime } from '../utils/format';

const CHECKLIST_ITEMS = [
  {
    field: 'personalDetails',
    title: 'Personal details verified',
    note: 'Name, date of birth and contact details match the photo ID.',
  },
  {
    field: 'academicDetails',
    title: 'Academic details verified',
    note: 'Class 10 and Class 12 marks match the uploaded marksheets.',
  },
  {
    field: 'documents',
    title: 'Documents checked',
    note: 'All four documents are present, readable and complete.',
  },
  {
    field: 'eligibility',
    title: 'Eligibility confirmed',
    note: 'The applicant meets the requirements of the selected programme.',
  },
];

const EMPTY_CHECKLIST = {
  personalDetails: false,
  academicDetails: false,
  documents: false,
  eligibility: false,
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(
    location.state?.justSubmitted
      ? 'Your application has been submitted successfully. The admission cell will review it and update the status here.'
      : ''
  );
  const [checklist, setChecklist] = useState(EMPTY_CHECKLIST);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get(`/applications/${id}`)
      .then(({ data }) => {
        if (!active) return;
        setApplication(data);
        setChecklist({ ...EMPTY_CHECKLIST, ...(data.review?.checklist || {}) });
        setReviewNotes(data.review?.notes || '');
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load this application.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  function toggleCheck(field) {
    setChecklist((current) => ({ ...current, [field]: !current[field] }));
  }

  async function handleReview(actionStatus = '') {
    setError('');
    setNotice('');

    if (actionStatus === 'Approved' && !Object.values(checklist).every(Boolean)) {
      setError('Complete all four verification checks before approving this application.');
      return;
    }
    if (['Documents Pending', 'Rejected'].includes(actionStatus) && !reviewNotes.trim()) {
      setError(`Add a note for the applicant before marking the application as ${actionStatus}.`);
      return;
    }

    setReviewing(true);
    try {
      const payload = { checklist, notes: reviewNotes };
      if (actionStatus) payload.status = actionStatus;

      const { data } = await api.patch(`/applications/${id}/review`, payload);
      setApplication(data.application);
      setChecklist({ ...EMPTY_CHECKLIST, ...(data.application.review?.checklist || {}) });
      setReviewNotes(data.application.review?.notes || '');
      setNotice(data.message);
    } catch (err) {
      setError(errorMessage(err, 'Could not save the review.'));
    } finally {
      setReviewing(false);
    }
  }

  function handleSaveReview(event) {
    event.preventDefault();
    handleReview();
  }

  const isAdmin = user?.role === 'admin';
  const isReviewer = user?.role === 'reviewer';
  const isStaff = isAdmin || isReviewer;
  const backLink = isAdmin
    ? '/admin/applications'
    : isReviewer
      ? '/reviewer/applications'
      : '/my-applications';
  const backLabel = isStaff ? 'All applications' : 'My applications';
  const allChecked = Object.values(checklist).every(Boolean);

  if (loading) {
    return (
      <div className="container section">
        <p className="page-loading">Loading application…</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container section">
        <div className="alert alert-error">{error || 'Application not found.'}</div>
        <Link to={backLink} className="btn btn-outline">
          Back to {backLabel.toLowerCase()}
        </Link>
      </div>
    );
  }

  const course = application.course;
  const personal = application.personal;
  const academics = application.academics || {};
  const tenth = academics.tenth || {};
  const twelfth = academics.twelfth || {};
  const entrance = academics.entrance || {};
  const hasEntrance = entrance.exam || entrance.rollNumber || entrance.score || entrance.rank;
  const documents = application.documents || [];

  return (
    <div className="container section">
      <div className="print-only print-header">
        <img src="/assets/logo.png" alt="" />
        <div>
          <h2>ABES Engineering College</h2>
          <p>Ghaziabad, Uttar Pradesh · Admission application</p>
        </div>
      </div>

      <Link to={backLink} className="text-link back-link no-print">
        &larr; Back to {backLabel.toLowerCase()}
      </Link>

      <div className="application-head panel">
        <div>
          <p className="eyebrow">Admission application · {application.session}</p>
          <h1>{application.applicationNo}</h1>
          <p className="muted">
            {course ? `${course.name} (${course.code})` : 'Programme removed'} &middot; Submitted on{' '}
            {formatDate(application.createdAt)}
          </p>
        </div>
        <div className="application-head-right">
          <StatusBadge status={application.status} />
          <button
            type="button"
            className="btn btn-outline btn-sm no-print"
            onClick={() => window.print()}
          >
            Print application
          </button>
        </div>
      </div>

      {notice ? <div className="alert alert-success">{notice}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      {isStaff ? (
        <section className="panel no-print review-panel">
          <h2>Review and decision</h2>
          {application.review?.reviewedAt ? (
            <p className="review-meta">
              Last reviewed by {application.review.reviewedBy || 'admission staff'} on{' '}
              {formatDateTime(application.review.reviewedAt)}
            </p>
          ) : (
            <p className="review-meta">This application has not been reviewed yet.</p>
          )}

          <form onSubmit={handleSaveReview}>
            <fieldset className="review-checklist">
              <legend>Verification checklist</legend>
              <p className="field-note checklist-note">
                Check each item after comparing the form with the uploaded documents.
              </p>
              {CHECKLIST_ITEMS.map((item) => (
                <label className="check-line" key={item.field}>
                  <input
                    type="checkbox"
                    checked={checklist[item.field]}
                    onChange={() => toggleCheck(item.field)}
                  />
                  <span>
                    <strong>{item.title}</strong>
                    <span className="check-note">{item.note}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="field review-notes">
              <label htmlFor="reviewNotes">Review notes / remarks for the applicant</label>
              <textarea
                id="reviewNotes"
                value={reviewNotes}
                placeholder="For example: Class 12 marksheet is not readable. Please upload a clear copy."
                onChange={(event) => setReviewNotes(event.target.value)}
              />
              <span className="field-note">
                A note is required when requesting documents or rejecting an application. It is
                shown to the applicant when a decision is recorded.
              </span>
            </div>

            <div className="review-actions">
              <button type="submit" className="btn" disabled={reviewing}>
                {reviewing ? 'Saving…' : 'Save review'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={reviewing}
                onClick={() => handleReview('Under Review')}
              >
                Mark under review
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={reviewing}
                onClick={() => handleReview('Documents Pending')}
              >
                Request documents
              </button>
              <button
                type="button"
                className="btn"
                disabled={reviewing || !allChecked}
                title={allChecked ? 'Approve this application' : 'Complete all four checks first'}
                onClick={() => handleReview('Approved')}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={reviewing}
                onClick={() => handleReview('Rejected')}
              >
                Reject
              </button>
            </div>

            <p className="small muted review-help">
              Saving the checklist does not change the applicant&apos;s status. Use the decision
              buttons to update the timeline.
            </p>
          </form>
        </section>
      ) : null}

      <div className="detail-layout">
        <div>
          <section className="panel">
            <h2>Personal details</h2>
            <dl className="detail-grid">
              <div>
                <dt>Full name</dt>
                <dd>{personal.fullName}</dd>
              </div>
              <div>
                <dt>Date of birth</dt>
                <dd>{formatDate(personal.dob)}</dd>
              </div>
              <div>
                <dt>Gender</dt>
                <dd>{personal.gender}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{personal.category}</dd>
              </div>
              <div>
                <dt>Father&apos;s name</dt>
                <dd>{personal.fatherName}</dd>
              </div>
              <div>
                <dt>Mother&apos;s name</dt>
                <dd>{personal.motherName}</dd>
              </div>
              <div>
                <dt>Mobile number</dt>
                <dd>{personal.phone}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>{personal.email}</dd>
              </div>
              <div className="span-2">
                <dt>Address</dt>
                <dd>
                  {personal.address}, {personal.city}, {personal.state} – {personal.pincode}
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <h2>Academic details</h2>

            <div className="academic-block">
              <h3>Class 10</h3>
              <dl className="detail-grid">
                <div>
                  <dt>Board</dt>
                  <dd>{tenth.board || '—'}</dd>
                </div>
                <div>
                  <dt>School</dt>
                  <dd>{tenth.school || '—'}</dd>
                </div>
                <div>
                  <dt>Passing year</dt>
                  <dd>{tenth.passingYear || '—'}</dd>
                </div>
                <div>
                  <dt>Percentage</dt>
                  <dd>{tenth.percentage ?? '—'}%</dd>
                </div>
              </dl>
            </div>

            <div className="academic-block">
              <h3>Class 12</h3>
              <dl className="detail-grid">
                <div>
                  <dt>Board</dt>
                  <dd>{twelfth.board || '—'}</dd>
                </div>
                <div>
                  <dt>School</dt>
                  <dd>{twelfth.school || '—'}</dd>
                </div>
                <div>
                  <dt>Stream</dt>
                  <dd>{twelfth.stream || '—'}</dd>
                </div>
                <div>
                  <dt>Passing year</dt>
                  <dd>{twelfth.passingYear || '—'}</dd>
                </div>
                <div>
                  <dt>Percentage</dt>
                  <dd>{twelfth.percentage ?? '—'}%</dd>
                </div>
              </dl>
            </div>

            <div className="academic-block">
              <h3>Entrance examination</h3>
              {hasEntrance ? (
                <dl className="detail-grid">
                  <div>
                    <dt>Examination</dt>
                    <dd>{entrance.exam || '—'}</dd>
                  </div>
                  <div>
                    <dt>Roll number</dt>
                    <dd>{entrance.rollNumber || '—'}</dd>
                  </div>
                  <div>
                    <dt>Score</dt>
                    <dd>{entrance.score || '—'}</dd>
                  </div>
                  <div>
                    <dt>Rank</dt>
                    <dd>{entrance.rank || '—'}</dd>
                  </div>
                </dl>
              ) : (
                <p className="muted">No entrance examination details were provided.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <h2>Uploaded documents</h2>
            {documents.length > 0 ? (
              <ul className="document-list">
                {documents.map((document) => (
                  <li key={document._id || document.fileName}>
                    <a href={document.url} target="_blank" rel="noreferrer">
                      {document.label}
                    </a>
                    <span className="doc-size">
                      {document.originalName} &middot; {(Number(document.size || 0) / 1024).toFixed(0)} KB
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No documents were uploaded with this application.</p>
            )}
          </section>

          {application.remarks ? (
            <section className="panel">
              <h2>Latest remarks</h2>
              <p>{application.remarks}</p>
            </section>
          ) : null}
        </div>

        <aside>
          <section className="panel">
            <h2>Programme</h2>
            <dl className="compact-list">
              <div>
                <dt>Programme</dt>
                <dd>{course ? course.name : '—'}</dd>
              </div>
              <div>
                <dt>Code</dt>
                <dd>{course ? course.code : '—'}</dd>
              </div>
              <div>
                <dt>Degree</dt>
                <dd>{course ? course.degree : '—'}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{course ? course.duration : '—'}</dd>
              </div>
              <div>
                <dt>Seats</dt>
                <dd>{course ? course.seats : '—'}</dd>
              </div>
              <div>
                <dt>Tuition fee</dt>
                <dd>{course ? `₹${formatCurrency(course.feePerYear)} / year` : '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <h2>Application timeline</h2>
            {application.timeline && application.timeline.length > 0 ? (
              <ul className="timeline">
                {application.timeline.map((entry, index) => (
                  <li key={`${entry.status}-${index}`}>
                    <div className="timeline-status">
                      <StatusBadge status={entry.status} />
                    </div>
                    <div className="timeline-meta">
                      {formatDateTime(entry.date)} &middot; {entry.changedBy}
                    </div>
                    <p className="timeline-message">{entry.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No status updates yet.</p>
            )}
          </section>

          <section className="panel">
            <h2>Need help?</h2>
            <p className="small">
              Contact the admission cell if a document is not visible or if your status has not
              changed for more than a week.
            </p>
            <p className="small">
              Phone: <a href="tel:+911207135111">+91 120 713 5111</a>
              <br />
              Email: <a href="mailto:admissions@abes.ac.in">admissions@abes.ac.in</a>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
