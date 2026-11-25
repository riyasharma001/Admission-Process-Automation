import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { errorMessage, formatCurrency } from '../utils/format';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/courses')
      .then(({ data }) => {
        if (active) setCourses(data.courses);
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
  }, []);

  return (
    <div className="container section">
      <div className="page-heading">
        <p className="eyebrow">Programmes · 2026–27</p>
        <h1>Programmes offered</h1>
        <p>
          ABES Engineering College offers six B.Tech branches, MBA and MCA. Sanctioned intake and
          first-year tuition fee are given below.
        </p>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading programmes…</p> : null}

      <div className="course-list">
        {courses.map((course) => (
          <article className="course-card" key={course._id}>
            <div className="course-card-head">
              <span className="programme-code">{course.code}</span>
              <span className="tag">{course.degree}</span>
            </div>
            <h2>{course.name}</h2>
            <p className="muted">{course.description}</p>

            <dl className="course-facts">
              <div>
                <dt>Duration</dt>
                <dd>{course.duration}</dd>
              </div>
              <div>
                <dt>Sanctioned seats</dt>
                <dd>{course.seats}</dd>
              </div>
              <div>
                <dt>Tuition fee (first year)</dt>
                <dd>₹{formatCurrency(course.feePerYear)}</dd>
              </div>
              <div>
                <dt>Degree awarded</dt>
                <dd>{course.degree}</dd>
              </div>
            </dl>

            <p className="eligibility">
              <strong>Eligibility:</strong> {course.eligibility}
            </p>

            {user?.role !== 'admin' ? (
              <Link
                to={user ? `/apply?course=${course._id}` : '/login'}
                className="btn btn-sm"
              >
                Apply for this programme
              </Link>
            ) : null}
          </article>
        ))}
      </div>

      <p className="fee-note">
        The fee shown is the first-year tuition fee and does not include hostel, transport,
        examination or one-time charges. Fee is subject to revision as per university and state
        government norms.
      </p>
    </div>
  );
}
