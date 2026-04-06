import React, { useMemo, useState } from 'react';
import { createClassroom, getClassroomById } from '../api.js';
import { loadLocalNames, setLocalName } from '../localNames.js';

// TODO: replace hardcoded module list with backend module API when available
const TEMP_MODULES = [
  { id: 'TEMP_MODULE_ID_1', name: 'Example Module 1' },
  { id: 'TEMP_MODULE_ID_2', name: 'Example Module 2' },
  { id: 'TEMP_MODULE_ID_3', name: 'Example Module 3' },
];

export default function CreateClassroomPage() {
  const [username, setUsername] = useState('');
  const [label, setLabel] = useState('');
  const [moduleId, setModuleId] = useState(TEMP_MODULES[0]?.id || '');
  const [classSize, setClassSize] = useState(10);

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
          >
            {TEMP_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>
        </label>

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
