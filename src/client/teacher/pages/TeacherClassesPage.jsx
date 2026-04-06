import React, { useMemo, useState } from 'react';
import { getUserClasses } from '../api.js';

export default function TeacherClassesPage({ initialUsername = '' }) {
  const [username, setUsername] = useState(initialUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);

  const canLoad = useMemo(() => username.trim().length > 0, [username]);

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

  return (
    <div className="teacher-page teacher-classes">
      <h1 className="teacher-title">My Classes</h1>

      <section className="teacher-section">
        <label className="teacher-label">
          Teacher username
          <input
            className="teacher-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. ms_smith"
          />
        </label>

        <button className="teacher-button" onClick={load} disabled={!canLoad || isLoading}>
          {isLoading ? 'Loading…' : 'Load classes'}
        </button>

        {error && <p className="teacher-error">{error}</p>}
      </section>

      <section className="teacher-section">
        <h2 className="teacher-subtitle">Results</h2>
        <p className="teacher-hint">
          Each row includes the classroom id you can paste into the Classroom Details page.
        </p>

        {classes.length === 0 ? (
          <p className="teacher-hint">No classes loaded yet.</p>
        ) : (
          <table className="teacher-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Classroom id</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c._id}>
                  <td>{c.label}</td>
                  <td className="teacher-mono">{c._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
