import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getClassroomById } from '../api.mjs';
import { loadLocalNames } from '../localNames.mjs';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="teacher-page teacher-projection">
      <button
  className="pageBackBtn"
  type="button"
  onClick={() => window.close()}
>
  ✕ Close
</button>
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
                    <span>{code}</span>
                    {String(names[code] ?? '').trim() ? (
                      <span style={{ fontFamily: 'inherit' }}>: {String(names[code]).trim()}</span>
                    ) : null}
                  </li>
                ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
