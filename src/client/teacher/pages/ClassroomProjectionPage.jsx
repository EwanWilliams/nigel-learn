import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getClassroomById } from '../api.mjs';

export default function ClassroomProjectionPage() {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('id') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [classroom, setClassroom] = useState(null);

  useEffect(() => {
    let isActive = true;
    if (!classId) return;

    setIsLoading(true);
    setError('');

    getClassroomById(classId)
      .then((fetched) => {
        if (!isActive) return;
        setClassroom(fetched);
      })
      .catch((err) => {
        if (!isActive) return;
        setClassroom(null);
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

  return (
    <div className="teacher-page teacher-projection">
      {isLoading && <p className="teacher-hint">Loading…</p>}
      {error && <p className="teacher-error">{error}</p>}

      {classroom && (
        <>
          <h1 className="teacher-title">
            Class code: <span className="teacher-mono">{classroom.classCode}</span>
          </h1>

          <section className="teacher-section">
            <ul>
              {(classroom.students || [])
                .map((s) => String(s?.studentCode ?? '').toUpperCase().trim())
                .filter(Boolean)
                .map((code) => (
                  <li key={code} className="teacher-mono">
                    {code}
                  </li>
                ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
