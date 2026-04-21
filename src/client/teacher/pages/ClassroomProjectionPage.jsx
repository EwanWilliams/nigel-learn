import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getClassroomById } from '../api.mjs';
import { loadLocalNames } from '../localNames.mjs';

export default function ClassroomProjectionPage() {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('id') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [classroom, setClassroom] = useState(null);
  const [names, setNames] = useState({});

  useEffect(() => {
    let isActive = true;
    if (!classId) return;

    setIsLoading(true);
    setError('');

    getClassroomById(classId)
      .then((fetched) => {
        if (!isActive) return;
        setClassroom(fetched);
        setNames(loadLocalNames(fetched.classCode));
      })
      .catch((err) => {
        if (!isActive) return;
        setClassroom(null);
        setNames({});
        setError(err?.message || 'Failed to load classroom');
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [classId]);

  const projectionText = useMemo(() => {
    if (!classroom) return '';
    const lines = [];
    lines.push(`Class code: ${classroom.classCode}`);
    lines.push('');
    lines.push('Student codes:');
    for (const s of classroom.students || []) {
      const code = String(s?.studentCode ?? '').toUpperCase().trim();
      if (!code) continue;
      const displayName = String(names[code] ?? '').trim();
      lines.push(displayName ? `${code}  -  ${displayName}` : code);
    }
    return lines.join('\n');
  }, [classroom, names]);

  return (
    <div className="teacher-page teacher-projection">
      <h1 className="teacher-title">Projection</h1>

      {!classId && (
        <p className="teacher-hint">
          No classroom selected. Open this page from the Classroom Details view.
        </p>
      )}

      {isLoading && <p className="teacher-hint">Loading…</p>}
      {error && <p className="teacher-error">{error}</p>}

      {classroom && (
        <section className="teacher-section">
          <p className="teacher-hint">Display names (if used) are local to this browser only.</p>
          <pre className="teacher-mono" style={{ whiteSpace: 'pre-wrap' }}>
            {projectionText}
          </pre>
        </section>
      )}
    </div>
  );
}
