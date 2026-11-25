import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section">
      <div className="empty-state">
        <p className="eyebrow">Page not found</p>
        <h1>404</h1>
        <p>The page you are looking for does not exist or may have been moved.</p>
        <Link to="/" className="btn">
          Go to home page
        </Link>
      </div>
    </div>
  );
}
