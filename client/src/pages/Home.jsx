import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { errorMessage, formatCurrency, formatDate } from '../utils/format';

function noticeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: '--', month: '' };
  return {
    day: date.toLocaleDateString('en-IN', { day: '2-digit' }),
    month: date.toLocaleDateString('en-IN', { month: 'short' }),
  };
}

export default function Home() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([api.get('/notices'), api.get('/courses')])
      .then(([noticeResponse, courseResponse]) => {
        if (!active) return;
        setNotices(noticeResponse.data.notices.slice(0, 4));
        setCourses(courseResponse.data.courses.slice(0, 6));
      })
      .catch((err) => {
        if (active) {
          setError(errorMessage(err, 'Could not load the notices and programmes. Please refresh the page.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const applyLink = user?.role === 'admin' ? '/admin/applications' : user ? '/apply' : '/login';

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Admissions 2026–27</p>
            <h1>Admissions are open for the new academic session</h1>
            <p>
              ABES Engineering College invites applications for its B.Tech, MBA and MCA
              programmes. Fill the admission form online, upload your documents, and follow the
              progress of your application on this portal.
            </p>
            <div className="hero-actions">
              <Link to={applyLink} className="btn">
                Apply online
              </Link>
              <Link to="/courses" className="btn btn-outline">
                View programmes
              </Link>
            </div>
            <p className="hero-small">
              Last date for online applications is 30 June 2026. Applications received after
              this date will be considered only if seats remain vacant.
            </p>
          </div>

          <aside className="helpline-card">
            <h2>Admission cell</h2>
            <dl>
              <div>
                <dt>Helpline</dt>
                <dd>
                  <a href="tel:+911207135111">+91 120 713 5111</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href="mailto:admissions@abes.ac.in">admissions@abes.ac.in</a>
                </dd>
              </div>
              <div>
                <dt>Office hours</dt>
                <dd>
                  Monday to Saturday
                  <br />
                  9:00 am – 5:00 pm
                </dd>
              </div>
              <div>
                <dt>Campus</dt>
                <dd>
                  19th KM Stone, NH-09
                  <br />
                  Ghaziabad – 201009
                </dd>
              </div>
            </dl>
            <p className="helpline-note">
              For document verification, visit the admission office with the original
              certificates.
            </p>
          </aside>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container stats-grid">
          <div>
            <strong>25+</strong>
            <span>years of teaching</span>
          </div>
          <div>
            <strong>6</strong>
            <span>B.Tech branches</span>
          </div>
          <div>
            <strong>1,080</strong>
            <span>sanctioned seats</span>
          </div>
          <div>
            <strong>2</strong>
            <span>postgraduate programmes</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container section-grid">
          <div>
            <div className="section-heading">
              <h2>Admission notices</h2>
              <Link to="/notices" className="text-link">
                All notices
              </Link>
            </div>

            {error ? <div className="alert alert-error">{error}</div> : null}
            {loading ? <p className="muted">Loading notices…</p> : null}
            {!loading && !error && notices.length === 0 ? (
              <p className="muted">No notices have been published yet.</p>
            ) : null}

            <ul className="notice-list">
              {notices.map((notice) => {
                const parts = noticeDate(notice.date);
                return (
                  <li key={notice._id}>
                    <div className="notice-date">
                      <strong>{parts.day}</strong>
                      <span>{parts.month}</span>
                    </div>
                    <div>
                      <div className="notice-title">
                        <Link to="/notices">{notice.title}</Link>
                      </div>
                      <div className="notice-meta">
                        <span className="tag">{notice.category}</span> &middot;{' '}
                        {formatDate(notice.date)}
                      </div>
                      <p className="notice-excerpt">
                        {notice.body.length > 150 ? `${notice.body.slice(0, 150)}…` : notice.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="panel small-panel">
            <h3>Before you apply</h3>
            <p>Keep the following documents ready:</p>
            <ul className="ticks">
              <li>Passport size photograph</li>
              <li>Class 10 and Class 12 marksheets</li>
              <li>Photo ID proof (Aadhaar, PAN or passport)</li>
              <li>JEE Main or CUET scorecard, if available</li>
            </ul>
            <p className="muted small">
              Files should be JPG, PNG or PDF and no larger than 5 MB each. Scanned copies must be
              readable.
            </p>
          </aside>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <h2>Programmes offered</h2>
            <Link to="/courses" className="text-link">
              See fees and eligibility
            </Link>
          </div>

          <div className="programme-grid">
            {courses.map((course) => (
              <article className="programme-card" key={course._id}>
                <span className="programme-code">{course.code}</span>
                <h3>{course.name}</h3>
                <p className="muted">
                  {course.duration} &middot; {course.seats} seats
                </p>
                <p className="programme-fee">
                  ₹{formatCurrency(course.feePerYear)} <span className="muted">/ year</span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>How to apply</h2>
          <ol className="steps">
            <li>
              <span>1</span>
              <div>
                <h3>Create an account</h3>
                <p>Register with your name, email address and mobile number.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>Fill the admission form</h3>
                <p>Enter your personal and academic details carefully.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>Upload documents</h3>
                <p>Attach your photograph, marksheets and photo ID proof.</p>
              </div>
            </li>
            <li>
              <span>4</span>
              <div>
                <h3>Track your application</h3>
                <p>The admission cell will review your form and update the status.</p>
              </div>
            </li>
          </ol>

          <div className="apply-note">
            <p>
              <strong>Need help?</strong> Call the admission cell on +91 120 713 5111 between 9:00
              am and 5:00 pm, or write to admissions@abes.ac.in. Please do not share your login
              password with anyone.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
