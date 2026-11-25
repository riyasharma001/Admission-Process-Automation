import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>ABES Engineering College</h3>
          <p>
            19th KM Stone, NH-09, Ghaziabad
            <br />
            Uttar Pradesh – 201009
          </p>
          <p>
            Approved by AICTE, New Delhi and affiliated to Dr. A.P.J. Abdul Kalam Technical
            University, Lucknow.
          </p>
        </div>

        <div>
          <h3>Admission cell</h3>
          <p>
            Monday to Saturday
            <br />
            9:00 am – 5:00 pm
          </p>
          <p>
            Phone: <a href="tel:+911207135111">+91 120 713 5111</a>
            <br />
            Email: <a href="mailto:admissions@abes.ac.in">admissions@abes.ac.in</a>
          </p>
        </div>

        <div>
          <h3>Quick links</h3>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/courses">Programmes and fees</Link>
            </li>
            <li>
              <Link to="/notices">Admission notices</Link>
            </li>
            <li>
              <Link to="/apply">Apply online</Link>
            </li>
            <li>
              <Link to="/login">Applicant login</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} ABES Engineering College. This portal is maintained by the
          Admission Cell.
          <span>For technical help, write to admission.portal@abes.ac.in.</span>
        </div>
      </div>
    </footer>
  );
}
