import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

// Teacher landing page.
// Note: This repo currently renders the student app by default.
// These links assume the main app/router will later mount teacher routes.
export default function TeacherDashboard() {
  const trimmedUsername = 'Ms_Smith';

  const linkStyle = useMemo(
    () => ({ color: '#ffffff', textDecoration: 'underline', fontWeight: 700 }),
    []
  );
  return (
    <div className="teacher-page teacher-dashboard">
      <h1 className="teacher-title">Teacher Dashboard</h1>

      <section className="teacher-section teacher-actions">
        <div className="teacher-actionsList">
          <Link
            className="teacher-link"
            to={`/teach/create?username=${encodeURIComponent(trimmedUsername)}`}
            style={linkStyle}
          >
            New classroom
          </Link>

          <Link
            className="teacher-link"
            to={`/teach/classes?username=${encodeURIComponent(trimmedUsername)}`}
            style={linkStyle}
          >
            Existing classroom / my classes
          </Link>
        </div>
      </section>
    </div>
  );
}
