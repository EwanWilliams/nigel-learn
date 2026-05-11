import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

export default function TeachPage() {
  return (
    <div className="routePage">
      <div className="routeCard">
        <div className="routeBadge">Teach</div>
        <h1 className="routeSectionTitle">Teacher dashboard</h1>
        <p className="routeSectionText">
          Placeholder route for class management, student progress, and teacher
          tools.
        </p>

        <div className="routeActions">
          <Link to="/" className="routeBtn">
            Back Home
          </Link>
          <Link to="/study" className="routeBtn routeBtnPrimary">
            Open Study View
          </Link>
        </div>
      </div>
    </div>
  );
}