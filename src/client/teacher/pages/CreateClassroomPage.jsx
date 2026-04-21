import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClassroom, listModules } from '../api.mjs';

// Creates a classroom and displays the generated student hex codes.
// Backend endpoints used:
// - POST /api/classroom/new
// - GET  /api/classroom/:classId
// - GET  /api/module/list (for module dropdown)
// Local-only display names:
// - stored in localStorage via localNames.mjs
// Module list:
// - this page loads modules via listModules() which maps to GET /api/module/list.
export default function CreateClassroomPage() {
  const username = 'Ms_Smith';
  const navigate = useNavigate();
  const [label, setLabel] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [classSize, setClassSize] = useState(10);
  const [modules, setModules] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return (
      label.trim().length > 0 &&
      moduleId.trim().length > 0 &&
      Number.isFinite(Number(classSize))
    );
  }, [label, moduleId, classSize]);

  useEffect(() => {
    if (!moduleId) return;
    if (modules.length === 0) return;
    if (modules.some((m) => m._id === moduleId)) return;
    setModuleId(modules[0]._id);
  }, [modules, moduleId]);

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
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await createClassroom({
        username,
        label: label.trim(),
        moduleId: moduleId.trim(),
        classSize: Number(classSize),
      });

      navigate(`/teach/classroom/${encodeURIComponent(result.classroomId)}`);
    } catch (err) {
      setError(err?.message || 'Failed to create classroom');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="teacher-page teacher-createClassroom">
      <h1 className="teacher-title">Create Classroom</h1>

      <form className="teacher-form" onSubmit={handleSubmit}>
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
                {m.title}
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
    </div>
  );
}
