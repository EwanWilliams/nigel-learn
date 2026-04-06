import React, { useEffect, useMemo, useState } from 'react';
import { getClassroomById } from '../api.js';
import { loadLocalNames, setLocalName } from '../localNames.js';

export default function ClassroomDetailsPage({ initialClassId = '' }) {
  const [classId, setClassId] = useState(initialClassId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [classroom, setClassroom] = useState(null);
  const [names, setNames] = useState({});

  const canLoad = useMemo(() => classId.trim().length > 0, [classId]);

  async function load() {
    if (!canLoad || isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const fetched = await getClassroomById(classId.trim());
      setClassroom(fetched);
      setNames(loadLocalNames(fetched.classCode));
    } catch (err) {
      setClassroom(null);
      setNames({});
      setError(err?.message || 'Failed to load classroom');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (initialClassId) {
      setClassId(initialClassId);
    }
  }, [initialClassId]);

  function handleNameChange(classCode, studentCode, displayName) {
    setLocalName(classCode, studentCode, displayName);
    setNames(loadLocalNames(classCode));
  }

  return (
    <div className="teacher-page teacher-classroomDetails">
      <h1 className="teacher-title">Classroom Details</h1>

      <section className="teacher-section teacher-load">
        <label className="teacher-label">
          Classroom id
          <input
            className="teacher-input"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            placeholder="Mongo _id (e.g. 661...)"
          />
        </label>

        <button className="teacher-button" onClick={load} disabled={!canLoad || isLoading}>
          {isLoading ? 'Loading…' : 'Load classroom'}
        </button>

        {error && <p className="teacher-error">{error}</p>}
      </section>

      {classroom && (
        <section className="teacher-section teacher-details">
          <h2 className="teacher-subtitle">Summary</h2>

          <div className="teacher-kv">
            <div>
              <strong>Label:</strong> {classroom.label}
            </div>
            <div>
              <strong>Class code:</strong>{' '}
              <span className="teacher-mono">{classroom.classCode}</span>
            </div>
            <div>
              <strong>Module id:</strong> <span className="teacher-mono">{classroom.module}</span>
            </div>
          </div>

          <h3 className="teacher-subtitle">Students</h3>
          <p className="teacher-hint">
            Display names are stored locally only and are never sent to the backend.
          </p>

          <table className="teacher-table">
            <thead>
              <tr>
                <th>Student hex code</th>
                <th>Display name (local only)</th>
              </tr>
            </thead>
            <tbody>
              {(classroom.students || []).map((s) => (
                <tr key={s.studentCode}>
                  <td className="teacher-mono">{s.studentCode}</td>
                  <td>
                    <input
                      className="teacher-input"
                      value={names[s.studentCode] || ''}
                      onChange={(e) =>
                        handleNameChange(classroom.classCode, s.studentCode, e.target.value)
                      }
                      placeholder="e.g. Sam"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
