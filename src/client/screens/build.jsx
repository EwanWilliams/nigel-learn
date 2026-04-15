import { Link } from "react-router-dom";

export default function BuildPage() {
  return (
    <div className="routePage">
      <div className="routeCard">
        <div className="routeBadge">Build</div>
        <h1 className="routeSectionTitle">Module builder</h1>
        <p className="routeSectionText">
          Placeholder route for creating and editing simulation content.
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