import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getClassroomById, getClassroomMarks } from '../api.mjs';
import { loadLocalNames, setLocalName } from '../localNames.mjs';

// Fetches classroom data by classroom id and allows local-only display names.
// Backend endpoint used:
// - GET /api/classroom/:classId
//
// Display names are stored in localStorage (see localNames.mjs) and never sent to backend.
export default function ClassroomDetailsPage({ initialClassId = '' }) {
  const [searchParams] = useSearchParams();
  const [classId, setClassId] = useState(initialClassId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [marks, setMarks] = useState([]);
  const [marksError, setMarksError] = useState('');
  const [lastMarksUpdate, setLastMarksUpdate] = useState('');

  const [nameFileError, setNameFileError] = useState('');

  const [classroom, setClassroom] = useState(null);
  const [names, setNames] = useState({});

  const canLoad = useMemo(() => classId.trim().length > 0, [classId]);

  function sanitizeFilename(input) {
    const raw = String(input ?? '').trim();
    const noReserved = raw.replace(/[\\/:*?"<>|]/g, '-');
    const collapsed = noReserved.replace(/\s+/g, ' ').trim();
    return collapsed || 'classroom';
  }

  async function load() {
    if (!canLoad || isLoading) return;
    setIsLoading(true);
    setError('');
    setMarksError('');

    try {
      const fetched = await getClassroomById(classId.trim());
      setClassroom(fetched);
      setNames(loadLocalNames(fetched.classCode));
    } catch (err) {
      setClassroom(null);
      setNames({});
      setMarks([]);
      setError(err?.message || 'Failed to load classroom');
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshMarks(activeClassId) {
    if (!activeClassId) return;
    try {
      const list = await getClassroomMarks(activeClassId);
      setMarks(Array.isArray(list) ? list : []);
      setMarksError('');
      setLastMarksUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setMarks([]);
      setMarksError(err?.message || 'Failed to load marks');
    }
  }

  useEffect(() => {
    if (initialClassId) {
      setClassId(initialClassId);
    }
  }, [initialClassId]);

  useEffect(() => {
    if (initialClassId) return;
    const fromQuery = searchParams.get('id') || '';
    if (fromQuery) setClassId(fromQuery);
  }, [initialClassId, searchParams]);

  useEffect(() => {
    if (!canLoad) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad, classId]);

  useEffect(() => {
    if (!classroom?._id) return;
    refreshMarks(classroom._id);

    const interval = setInterval(() => {
      refreshMarks(classroom._id);
    }, 5000);

    return () => clearInterval(interval);
  }, [classroom?._id]);

  function handleNameChange(classCode, studentCode, displayName) {
    setLocalName(classCode, studentCode, displayName);
    setNames(loadLocalNames(classCode));
  }

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
    downloadTextFile(`${sanitizeFilename(classroom.label)}-names.json`, JSON.stringify(payload, null, 2), 'application/json');
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
        map = imported;
      } else {
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
        throw new Error('Unrecognised file format. Use exported JSON, a JSON map, or CSV studentCode,name.');
      }

      const classCode = classroom.classCode;
      for (const [studentCode, displayName] of Object.entries(map)) {
        const code = String(studentCode ?? '').toUpperCase().trim();
        if (!code) continue;
        const value = String(displayName ?? '').trim();
        if (!value) continue;
        setLocalName(classCode, code, value);
      }
      setNames(loadLocalNames(classCode));
    } catch (err) {
      setNameFileError(err?.message || 'Failed to import names file');
    }
  }

  function downloadMarksCsv() {
    if (!classroom) return;
    const rows = [];
    rows.push(['studentCode', 'displayName', 'mark', 'completedAt'].join(','));
    for (const m of marks) {
      const code = String(m?.studentCode ?? '').toUpperCase();
      const displayName = String(names[code] ?? '');
      const mark = m?.mark == null ? '' : String(m.mark);
      const completedAt = m?.completedAt ? new Date(m.completedAt).toISOString() : '';
      const esc = (v) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
      };
      rows.push([esc(code), esc(displayName), esc(mark), esc(completedAt)].join(','));
    }
    downloadTextFile(`marks_${classroom.classCode}.csv`, rows.join('\n'), 'text/csv');
  }

  return (
    <div className="teacher-page teacher-classroomDetails">
      <h1 className="teacher-title">Classroom Details</h1>

      {isLoading && <p className="teacher-hint">Loading classroom…</p>}
      {error && <p className="teacher-error">{error}</p>}

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

          <div className="teacher-actionsList">
            <button
              className="teacher-button"
              type="button"
              onClick={() =>
                window.open(
                  `/teach/classroom/projection?id=${encodeURIComponent(classroom._id)}`,
                  '_blank',
                  'noopener,noreferrer'
                )
              }
            >
              Open projection (new tab)
            </button>
          </div>

          <h3 className="teacher-subtitle">Students</h3>
          <p className="teacher-hint">
            Display names are stored locally only and are never sent to the backend.
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
                      placeholder="e.g. Sam"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="teacher-subtitle">Live Marks</h3>
          <p className="teacher-hint">
            Updates every 5 seconds. Last updated: {lastMarksUpdate || '—'}
          </p>

          <div className="teacher-actionsList">
            <button
              className="teacher-button"
              type="button"
              onClick={() => refreshMarks(classroom._id)}
            >
              Refresh now
            </button>
            <button className="teacher-button" type="button" onClick={downloadMarksCsv}>
              Download marks (CSV)
            </button>
          </div>

          {marksError && <p className="teacher-error">{marksError}</p>}

          <table className="teacher-table">
            <thead>
              <tr>
                <th>Student code</th>
                <th>Name (local)</th>
                <th>Mark</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {(marks || []).map((m) => (
                <tr key={m.studentCode}>
                  <td className="teacher-mono">{m.studentCode}</td>
                  <td>{names[m.studentCode] || ''}</td>
                  <td>{m.mark ?? ''}</td>
                  <td>{m.completedAt ? new Date(m.completedAt).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
