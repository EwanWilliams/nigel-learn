import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="routePage">
      <div className="routeHero">
        <div className="routeBadge">Student Bank</div>

        <h1 className="routeTitle">Budgeting simulation for the classroom</h1>

        <p className="routeIntro">
          Students can join the simulation, teachers can manage classes, and
          module creation will live in the builder.
        </p>

        <div className="routeActions">
          <Link to="/study" className="routeBtn routeBtnPrimary">
            Join Classroom
          </Link>

          <Link to="/teach" className="routeBtn">
            Teacher Login
          </Link>

          <Link to="/build" className="routeBtn">
            Module Builder
          </Link>
        </div>
      </div>
    </div>
  );
}