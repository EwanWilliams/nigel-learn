// Local-only student display names.
//
// Requirement: do NOT send names to backend.
// Storage key format: names_<classroomCode>
// Stored value example:
//   { "03F": "Alex", "A12": "Sam" }

function storageKeyForClassCode(classCode) {
  return `names_${classCode}`;
}

export function loadLocalNames(classCode) {
  if (!classCode) return {};
  try {
    const raw = localStorage.getItem(storageKeyForClassCode(classCode));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveLocalNames(classCode, namesMap) {
  if (!classCode) return;
  const safeMap = namesMap && typeof namesMap === 'object' ? namesMap : {};
  localStorage.setItem(storageKeyForClassCode(classCode), JSON.stringify(safeMap));
}

export function getLocalName(classCode, studentCode) {
  const names = loadLocalNames(classCode);
  return names[studentCode] || '';
}

export function setLocalName(classCode, studentCode, displayName) {
  if (!classCode || !studentCode) return;
  const names = loadLocalNames(classCode);

  const next = { ...names };
  const trimmed = (displayName ?? '').toString();

  if (trimmed.length === 0) {
    delete next[studentCode];
  } else {
    next[studentCode] = trimmed;
  }

  saveLocalNames(classCode, next);
}

export function clearLocalNames(classCode) {
  if (!classCode) return;
  localStorage.removeItem(storageKeyForClassCode(classCode));
}
