// Teacher API helpers.
//
// Backend routing (see src/server/server.mjs):
// - Classroom routes are mounted at /api/classroom
// - Module routes are mounted at /api/module
//
// This file intentionally keeps a tiny surface area so it's easy to swap
// fetch implementation later (auth headers, retry, etc.).

async function requestJson(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message = (data && data.error) ? data.error : `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// POST /api/classroom/new
// Expects: { username, label, moduleId, classSize }
// Returns: { classroomId, message }
export function createClassroom({ username, label, moduleId, classSize }) {
  return requestJson('/api/classroom/new', {
    method: 'POST',
    body: { username, label, moduleId, classSize },
  });
}

// GET /api/classroom/:classId
export function getClassroomById(classId) {
  return requestJson(`/api/classroom/${encodeURIComponent(classId)}`);
}

// GET /api/classroom/:classId/marks
export function getClassroomMarks(classId) {
  return requestJson(`/api/classroom/${encodeURIComponent(classId)}/marks`);
}

// GET /api/classroom/userClasses/:username
export function getUserClasses(username) {
  return requestJson(`/api/classroom/userClasses/${encodeURIComponent(username)}`);
}

// GET /api/module/data/:id
export function getModuleById(moduleId) {
  return requestJson(`/api/module/data/${encodeURIComponent(moduleId)}`);
}

// GET /api/module/list
// Returns an array of modules with { _id, title }.
export function listModules() {
  return requestJson('/api/module/list');
}

// POST /api/module/new
export function createModule(payload) {
  return requestJson('/api/module/new', { method: 'POST', body: payload });
}
