export function getUniqueExerciseNames(workouts) {
  const exerciseMap = new Map();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const normalizedName = exercise.name.trim().toLowerCase();
      if (!normalizedName) return;

      if (!exerciseMap.has(normalizedName)) {
        exerciseMap.set(normalizedName, exercise.name.trim());
      }
    });
  });

  return [...exerciseMap.values()].sort((a, b) => a.localeCompare(b));
}

export function getMatchingExerciseSuggestions(exerciseNames, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return exerciseNames.filter((name) => name.toLowerCase().includes(normalizedQuery));
}

export function getLastExercisePerformance(workouts, exerciseQuery, excludeWorkoutId = null) {
  const normalizedQuery = exerciseQuery.trim().toLowerCase();
  if (!normalizedQuery) return null;

  const sortedWorkouts = [...workouts].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt
  );

  for (const workout of sortedWorkouts) {
    if (excludeWorkoutId && workout.id === excludeWorkoutId) continue;

    const matchedExercise = workout.exercises.find(
      (exercise) => exercise.name.trim().toLowerCase() === normalizedQuery
    );
    if (!matchedExercise) continue;

    return {
      exerciseName: matchedExercise.name.trim(),
      date: workout.date,
      workoutName: workout.name,
      sets: matchedExercise.sets,
    };
  }

  return null;
}

export function getExerciseAnalytics(workouts, exerciseName) {
  const selectedKey = exerciseName.trim().toLowerCase();
  if (!selectedKey) return null;

  const matchingWorkouts = workouts.filter((workout) =>
    workout.exercises.some((exercise) => exercise.name.trim().toLowerCase() === selectedKey)
  );

  if (!matchingWorkouts.length) return null;

  let bestWeight = 0;
  let bestReps = 0;
  let totalSets = 0;

  matchingWorkouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (exercise.name.trim().toLowerCase() !== selectedKey) return;

      exercise.sets.forEach((set) => {
        totalSets += 1;
        bestWeight = Math.max(bestWeight, Number(set.weight));
        bestReps = Math.max(bestReps, Number(set.reps));
      });
    });
  });

  const sortByOldest = (a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
  const sortByNewest = (a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;

  const firstWorkout = [...matchingWorkouts].sort(sortByOldest)[0];
  const lastWorkout = [...matchingWorkouts].sort(sortByNewest)[0];

  return {
    totalSessions: matchingWorkouts.length,
    bestWeight,
    bestReps,
    firstLogged: firstWorkout.date,
    lastLogged: lastWorkout.date,
    totalSets,
  };
}
