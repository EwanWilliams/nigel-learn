import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getUserClasses } from '../api.mjs';

// Lists classrooms for a given teacher username.
// Backend endpoint used:
// - GET /api/classroom/userClasses/:username
//
// The classroom links assume the main app/router will later mount a teacher classroom-details route.
export default function TeacherClassesPage({ initialUsername = '' }) {
  const [searchParams] = useSearchParams();
  const [username] = useState(
    initialUsername || searchParams.get('username') || 'Ms_Smith'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);

  const canLoad = useMemo(() => username.trim().length > 0, [username]);

  const linkStyle = useMemo(
    () => ({ color: '#ffffff', textDecoration: 'underline', fontWeight: 700 }),
    []
  );

  async function load() {
    if (!canLoad || isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const list = await getUserClasses(username.trim());
      setClasses(Array.isArray(list) ? list : []);
    } catch (err) {
      setClasses([]);
      setError(err?.message || 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="teacher-page teacher-classes">
      <h1 className="teacher-title">My Classes</h1>

      <section className="teacher-section">
        <Link className="teacher-link" to="/teach/create" style={linkStyle}>
          + Create a classroom
        </Link>
      </section>

      <section className="teacher-section">
        <button className="teacher-button" onClick={load} disabled={!canLoad || isLoading}>
          {isLoading ? 'Loading…' : 'Refresh classes'}
        </button>

        {error && <p className="teacher-error">{error}</p>}
      </section>

      <section className="teacher-section">
        <h2 className="teacher-subtitle">Results</h2>
        <p className="teacher-hint">
          Open a class to view students and live marks.
        </p>

        {classes.length === 0 ? (
          <p className="teacher-hint">No classes loaded yet.</p>
        ) : (
          <table className="teacher-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Completed</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c._id}>
                  <td>{c.label}</td>
                  <td>
                    {Number.isFinite(Number(c.completed)) && Number.isFinite(Number(c.total))
                      ? `${c.completed}/${c.total}`
                      : '—'}
                  </td>
                  <td>
                    <Link
                      className="teacher-link teacher-mono"
                      to={`/teach/classroom/${encodeURIComponent(c._id)}`}
                      style={linkStyle}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
