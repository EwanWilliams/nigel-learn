import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

// Teacher landing page.
// Note: This repo currently renders the student app by default.
// These links assume the main app/router will later mount teacher routes.
export default function TeacherDashboard() {
  const [username, setUsername] = useState('');

  const canContinue = useMemo(() => username.trim().length > 0, [username]);
  const trimmedUsername = useMemo(() => username.trim(), [username]);

  const linkStyle = useMemo(
    () => ({ color: '#ffffff', textDecoration: 'underline', fontWeight: 700 }),
    []
  );
  const disabledLinkStyle = useMemo(
    () => ({ ...linkStyle, opacity: 0.6, cursor: 'not-allowed' }),
    [linkStyle]
  );

  return (
    <div className="teacher-page teacher-dashboard">
      <h1 className="teacher-title">Teacher Dashboard</h1>

      <section className="teacher-section teacher-username">
        <label className="teacher-label">
          Teacher sign-in (placeholder)
          <input
            className="teacher-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. ms_smith (auth not wired yet)"
            autoComplete="username"
          />
        </label>
        {!canContinue && (
          <p className="teacher-hint">
            Enter a username to continue. (Flow mentions 3rd-party auth; this project currently uses a
            simple username placeholder.)
          </p>
        )}
      </section>

      <section className="teacher-section teacher-actions">
        <div className="teacher-actionsList">
          {canContinue ? (
            <Link
              className="teacher-link"
              to={`/Teach/create?username=${encodeURIComponent(trimmedUsername)}`}
              style={linkStyle}
            >
              New classroom
            </Link>
          ) : (
            <span className="teacher-link" aria-disabled="true" style={disabledLinkStyle}>
              New classroom
            </span>
          )}

          {canContinue ? (
            <Link
              className="teacher-link"
              to={`/Teach/classes?username=${encodeURIComponent(trimmedUsername)}`}
              style={linkStyle}
            >
              Existing classroom / my classes
            </Link>
          ) : (
            <span className="teacher-link" aria-disabled="true" style={disabledLinkStyle}>
              Existing classroom / my classes
            </span>
          )}

          <Link className="teacher-link" to="/Teach/modules" style={linkStyle}>
            Module selection
          </Link>
        </div>
      </section>
    </div>
  );
}
