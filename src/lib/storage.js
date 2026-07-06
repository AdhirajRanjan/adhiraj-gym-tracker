import { STORAGE_KEY, TEMPLATES_STORAGE_KEY } from "./constants.js";

export function getInitialWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getInitialTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function hasStoredLocalTrainingData() {
  return getInitialWorkouts().length > 0 || getInitialTemplates().length > 0;
}
