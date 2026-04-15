import React, { useEffect, useMemo, useState } from 'react';
import { createClassroom, getClassroomById, listModules } from '../api.mjs';
import { loadLocalNames, setLocalName } from '../localNames.mjs';

// Creates a classroom and displays the generated student hex codes.
// Backend endpoints used:
// - POST /api/classroom/new
// - GET  /api/classroom/:classId
// - GET  /api/module/list (for module dropdown)
// Local-only display names:
// - stored in localStorage via localNames.mjs
// - never sent to backend
// Module list:
// - this page loads modules via listModules() which maps to GET /api/module/list.
export default function CreateClassroomPage({ initialUsername = '' }) {
  const [username, setUsername] = useState(initialUsername);
  const [label, setLabel] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');
  const [classSize, setClassSize] = useState(10);
  const [modules, setModules] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  const [nameFileError, setNameFileError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [createdClassroomId, setCreatedClassroomId] = useState('');
  const [classroom, setClassroom] = useState(null);
  const [names, setNames] = useState({});

  const projectionText = useMemo(() => {
    if (!classroom) return '';
    const lines = [];
    lines.push(`Class code: ${classroom.classCode}`);
    lines.push('');
    lines.push('Student codes:');
    for (const s of classroom.students || []) {
      const code = s?.studentCode ?? '';
      if (!code) continue;
      const displayName = names[code] || '';
      lines.push(displayName ? `${code}  -  ${displayName}` : code);
    }
    return lines.join('\n');
  }, [classroom, names]);

  function downloadTextFile(filename, text, mime = 'text/plain') {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadNamesFile() {
    if (!classroom) return;
    const payload = {
      classCode: classroom.classCode,
      names,
      exportedAt: new Date().toISOString(),
    };
    downloadTextFile(`names_${classroom.classCode}.json`, JSON.stringify(payload, null, 2), 'application/json');
  }

  async function handleNamesFileUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !classroom) return;

    setNameFileError('');

    try {
      const raw = await file.text();

      let imported = null;
      try {
        imported = JSON.parse(raw);
      } catch {
        imported = null;
      }

      let map = null;
      if (imported && typeof imported === 'object' && imported.names && typeof imported.names === 'object') {
        map = imported.names;
      } else if (imported && typeof imported === 'object') {
        // allow plain map JSON: { "03F": "Alex" }
        map = imported;
      } else {
        // fallback: very simple CSV "studentCode,name" per line
        const next = {};
        const lines = raw.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (/^studentcode\s*,\s*name\s*$/i.test(trimmed)) continue;
          const [codeRaw, ...rest] = trimmed.split(',');
          const code = (codeRaw ?? '').trim().toUpperCase();
          const name = rest.join(',').trim();
          if (!code) continue;
          if (name) next[code] = name;
        }
        map = next;
      }

      if (!map || typeof map !== 'object') {
        throw new Error('Unrecognised file format. Use the exported JSON, a JSON map, or a CSV of studentCode,name.');
      }

      const classCode = classroom.classCode;
      const safeNext = { ...names };
      for (const [studentCode, displayName] of Object.entries(map)) {
        const code = String(studentCode ?? '').toUpperCase().trim();
        if (!code) continue;
        const value = String(displayName ?? '').trim();
        if (!value) continue;
        safeNext[code] = value;
        setLocalName(classCode, code, value);
      }
      setNames(loadLocalNames(classCode));
    } catch (err) {
      setNameFileError(err?.message || 'Failed to import names file');
    }
  }

  const canSubmit = useMemo(() => {
    return (
      username.trim().length > 0 &&
      label.trim().length > 0 &&
      moduleId.trim().length > 0 &&
      Number.isFinite(Number(classSize))
    );
  }, [username, label, moduleId, classSize]);

  const filteredModules = useMemo(() => {
    const q = moduleSearch.trim().toLowerCase();
    if (!q) return modules;

    return modules.filter((m) => {
      const title = String(m?.title ?? '').toLowerCase();
      const id = String(m?._id ?? '').toLowerCase();
      return title.includes(q) || id.includes(q);
    });
  }, [modules, moduleSearch]);

  useEffect(() => {
    if (!moduleId) return;
    if (filteredModules.length === 0) return;
    if (filteredModules.some((m) => m._id === moduleId)) return;
    setModuleId(filteredModules[0]._id);
  }, [filteredModules, moduleId]);

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
          Search modules
          <input
            className="teacher-input"
            value={moduleSearch}
            onChange={(e) => setModuleSearch(e.target.value)}
            placeholder="Type to filter by title or id"
            disabled={isLoadingModules || modules.length === 0}
          />
        </label>

        <p className="teacher-hint">
          Showing {filteredModules.length} of {modules.length} modules.
        </p>

        <label className="teacher-label">
          Module
          <select
            className="teacher-select"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            disabled={isLoadingModules || filteredModules.length === 0}
          >
            {filteredModules.map((m) => (
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

          <div className="teacher-actionsList">
            <button className="teacher-button" type="button" onClick={downloadNamesFile}>
              Download names (local file)
            </button>

            <label className="teacher-label">
              Upload names file
              <input
                className="teacher-input"
                type="file"
                accept=".json,.csv,text/csv,application/json"
                onChange={handleNamesFileUpload}
              />
            </label>
          </div>

          {nameFileError && <p className="teacher-error">{nameFileError}</p>}

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

          <h3 className="teacher-subtitle">Projection</h3>
          <p className="teacher-hint">
            Copy/paste this list onto a projector or into a slide. (Names are local only.)
          </p>
          <textarea
            className="teacher-input"
            readOnly
            value={projectionText}
            rows={Math.min(16, Math.max(6, (classroom.students || []).length + 4))}
          />
        </section>
      )}
    </div>
  );
}
