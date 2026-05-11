import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="routePage">
      <div className="routeHero">

        <h1 className="routeTitle">Budgeting Simulation</h1>
        <h1 className="routeTitle">For the Classroom</h1>

        <p className="routeIntro">
          Students join with a classroom code and student code. 
        </p>
        <p className="routeIntro"> 
          Teachers can also build their own modules with our module builder.
          </p>

        <div className="routeActions">
          <Link to="/join" className="routeBtn routeBtnPrimary">
            Join Classroom
          </Link>

          <Link to="/teach/classes" className="routeBtn">
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