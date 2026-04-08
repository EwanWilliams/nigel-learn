import React, { useEffect, useMemo, useState } from 'react';
import { getModuleById, listModules } from '../api.js';

// Module list and selection.
// Backend endpoints used:
// - GET /api/module/list
// - GET /api/module/data/:id
export default function ModuleSelectionPage() {
  const [modules, setModules] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = useMemo(
    () => modules.find((m) => m._id === selectedId) || null,
    [modules, selectedId]
  );

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    listModules()
      .then((result) => {
        if (!isActive) return;
        const nextModules = Array.isArray(result) ? result : [];
        setModules(nextModules);
        if (nextModules.length > 0) {
          setSelectedId(nextModules[0]._id);
        }
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err?.message || 'Failed to load modules');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedModule(null);
      return;
    }

    let isActive = true;
    getModuleById(selectedId)
      .then((result) => {
        if (isActive) setSelectedModule(result || null);
      })
      .catch((err) => {
        if (!isActive) return;
        setSelectedModule(null);
        setError(err?.message || 'Failed to load module details');
      });

    return () => {
      isActive = false;
    };
  }, [selectedId]);

  return (
    <div className="teacher-page teacher-moduleSelection">
      <h1 className="teacher-title">Module Selection</h1>

      <p className="teacher-hint">Available modules from the backend.</p>

      <section className="teacher-section">
        {error && <p className="teacher-error">{error}</p>}

        <label className="teacher-label">
          Select a module
          <select
            className="teacher-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={isLoading || modules.length === 0}
          >
            {modules.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} ({m._id})
              </option>
            ))}
          </select>
        </label>

        {!isLoading && modules.length === 0 && (
          <p className="teacher-hint">No modules found in the database.</p>
        )}

        {selected && (
          <div className="teacher-kv">
            <div>
              <strong>Name:</strong> {selected.title}
            </div>
            <div>
              <strong>Id:</strong> <span className="teacher-mono">{selected._id}</span>
            </div>
            <div>
              <strong>Weeks:</strong> {selectedModule?.weekPool?.length ?? 0}
            </div>
          </div>
        )}

        <p className="teacher-hint">Select a module to use when creating a classroom.</p>
      </section>
    </div>
  );
}
