import React, { useState } from 'react';

// TODO: replace hardcoded module list with backend module API when available
// currently no endpoint to list all modules
const TEMP_MODULES = [
  { id: 'TEMP_MODULE_ID_1', name: 'Example Module 1' },
  { id: 'TEMP_MODULE_ID_2', name: 'Example Module 2' },
  { id: 'TEMP_MODULE_ID_3', name: 'Example Module 3' },
];

export default function ModuleSelectionPage() {
  const [selectedId, setSelectedId] = useState(TEMP_MODULES[0]?.id || '');

  const selected = TEMP_MODULES.find((m) => m.id === selectedId);

  return (
    <div className="teacher-page teacher-moduleSelection">
      <h1 className="teacher-title">Module Selection</h1>

      <p className="teacher-hint">
        Available modules (currently a hardcoded list).
      </p>

      <section className="teacher-section">
        <label className="teacher-label">
          Select a module
          <select
            className="teacher-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {TEMP_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>
        </label>

        {selected && (
          <div className="teacher-kv">
            <div>
              <strong>Name:</strong> {selected.name}
            </div>
            <div>
              <strong>Id:</strong> <span className="teacher-mono">{selected.id}</span>
            </div>
          </div>
        )}

        <p className="teacher-hint">Select a module to use when creating a classroom.</p>
      </section>
    </div>
  );
}
