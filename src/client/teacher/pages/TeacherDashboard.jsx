import React, { useMemo, useState } from 'react';

// Teacher landing page.
// Note: This repo currently renders the student app by default.
// These links assume the main app/router will later mount teacher routes.
export default function TeacherDashboard() {
  const [username, setUsername] = useState('');

  const canContinue = useMemo(() => username.trim().length > 0, [username]);

  return (
    <div className="teacher-page teacher-dashboard">
      <h1 className="teacher-title">Teacher Dashboard</h1>

      <section className="teacher-section teacher-username">
        <label className="teacher-label">
          Teacher username
          <input
            className="teacher-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. ms_smith"
            autoComplete="username"
          />
        </label>
        {!canContinue && (
          <p className="teacher-hint">Enter a username to continue.</p>
        )}
      </section>

      <section className="teacher-section teacher-actions">
        <div className="teacher-actionsList">
          <a
            className="teacher-link"
            href={canContinue ? `/teacher/create?username=${encodeURIComponent(username.trim())}` : '#'}
            aria-disabled={!canContinue}
          >
            Create classroom
          </a>

          <a
            className="teacher-link"
            href={canContinue ? `/teacher/classes?username=${encodeURIComponent(username.trim())}` : '#'}
            aria-disabled={!canContinue}
          >
            View my classes
          </a>

          <a className="teacher-link" href="/teacher/modules">
            Module selection
          </a>
        </div>
      </section>
    </div>
  );
}
