import React, { useEffect, useMemo, useState } from 'react';
import { createClassroom, getClassroomById, listModules } from '../api.js';
import { loadLocalNames, setLocalName } from '../localNames.js';

// Creates a classroom and displays the generated student hex codes.
// Backend endpoints used:
// - POST /api/classroom/new
// - GET  /api/classroom/:classId
// - GET  /api/module/list (for module dropdown)
// Local-only display names:
// - stored in localStorage via localNames.js
// - never sent to backend
// Module list:
// - this page loads modules via listModules() which maps to GET /api/module/list.
export default function CreateClassroomPage({ initialUsername = '' }) {
  const [username, setUsername] = useState(initialUsername);
  const [label, setLabel] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [classSize, setClassSize] = useState(10);
  const [modules, setModules] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [createdClassroomId, setCreatedClassroomId] = useState('');
  const [classroom, setClassroom] = useState(null);
  const [names, setNames] = useState({});

  const canSubmit = useMemo(() => {
    return (
      username.trim().length > 0 &&
      label.trim().length > 0 &&
      moduleId.trim().length > 0 &&
      Number.isFinite(Number(classSize))
    );
  }, [username, label, moduleId, classSize]);

  useEffect(() => {
    let isActive = true;
    setIsLoadingModules(true);
    listModules()
      .then((result) => {
        if (!isActive) return;
        const nextModules = Array.isArray(result) ? result : [];
        setModules(nextModules);
        if (nextModules.length > 0) {
          setModuleId(nextModules[0]._id);
        }
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err?.message || 'Failed to load modules');
      })
      .finally(() => {
        if (isActive) setIsLoadingModules(false);

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    setUsername(initialUsername);
  }, [initialUsername]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    setClassroom(null);
    setCreatedClassroomId('');

    try {
      const result = await createClassroom({
        username: username.trim(),
        label: label.trim(),
        moduleId: moduleId.trim(),
        classSize: Number(classSize),
      });

      setCreatedClassroomId(result.classroomId);

      const fetched = await getClassroomById(result.classroomId);
      setClassroom(fetched);
      setNames(loadLocalNames(fetched.classCode));
    } catch (err) {
      setError(err?.message || 'Failed to create classroom');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNameChange(classCode, studentCode, displayName) {
    setLocalName(classCode, studentCode, displayName);
    setNames(loadLocalNames(classCode));
  }

  return (
    <div className="teacher-page teacher-createClassroom">
      <h1 className="teacher-title">Create Classroom</h1>

      <form className="teacher-form" onSubmit={handleSubmit}>
        <label className="teacher-label">
          Teacher username
          <input
            className="teacher-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. ms_smith"
          />
        </label>

        <label className="teacher-label">
          Classroom label
          <input
            className="teacher-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Period 3"
          />
        </label>

        <label className="teacher-label">
          Module
          <select
            className="teacher-select"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            disabled={isLoadingModules || modules.length === 0}
          >
            {modules.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} ({m._id})
              </option>
            ))}
          </select>
        </label>

        {!isLoadingModules && modules.length === 0 && (
          <p className="teacher-hint">No modules found. Create a module first.</p>
        )}

        <label className="teacher-label">
          Number of students
          <input
            className="teacher-input"
            type="number"
            min={1}
            max={50}
            value={classSize}
            onChange={(e) => setClassSize(e.target.value)}
          />
        </label>

        <button className="teacher-button" type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create classroom'}
        </button>

        {error && <p className="teacher-error">{error}</p>}
      </form>

      {createdClassroomId && (
        <section className="teacher-section teacher-created">
          <h2 className="teacher-subtitle">Created</h2>
          <p>
            Classroom id: <span className="teacher-mono">{createdClassroomId}</span>
          </p>
        </section>
      )}

      {classroom && (
        <section className="teacher-section teacher-classroomSummary">
          <h2 className="teacher-subtitle">Classroom Details</h2>

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
            Student display names are stored locally in this browser only (localStorage key{' '}
            <span className="teacher-mono">names_{classroom.classCode}</span>).
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
                      placeholder="e.g. Alex"
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
