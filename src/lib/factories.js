export function createSet() {
  return { id: crypto.randomUUID(), weight: "", reps: "" };
}

export function createExercise() {
  return { id: crypto.randomUUID(), name: "", sets: [createSet()] };
}

export function createTemplateExercise() {
  return { id: crypto.randomUUID(), name: "" };
}
