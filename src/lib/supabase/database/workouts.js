import { getSupabaseClient } from "../client.js";
import { TABLES } from "./tables.js";

function requireData(result) {
  if (result.error) {
    throw result.error;
  }

  return result.data ?? [];
}

function toTimestamp(value) {
  return value ? new Date(value).getTime() : Date.now();
}

function toWorkoutRow(userId, workout) {
  return {
    id: workout.id,
    user_id: userId,
    name: workout.name,
    performed_on: workout.date,
    notes: workout.notes || null,
    created_at: workout.createdAt
      ? new Date(workout.createdAt).toISOString()
      : undefined,
  };
}

function toExerciseRows(userId, workout) {
  return workout.exercises.map((exercise, index) => ({
    id: exercise.id,
    user_id: userId,
    workout_id: workout.id,
    exercise_name: exercise.name,
    exercise_order: index,
  }));
}

function toSetRows(userId, workout) {
  return workout.exercises.flatMap((exercise) =>
    exercise.sets.map((set, index) => ({
      id: set.id,
      user_id: userId,
      workout_exercise_id: exercise.id,
      set_order: index,
      weight: Number(set.weight),
      reps: Number(set.reps),
    }))
  );
}

function toAppWorkout(workoutRow, exerciseRows, setRows) {
  const exercises = exerciseRows
    .filter((exercise) => exercise.workout_id === workoutRow.id)
    .sort((a, b) => a.exercise_order - b.exercise_order)
    .map((exercise) => ({
      id: exercise.id,
      name: exercise.exercise_name,
      sets: setRows
        .filter((set) => set.workout_exercise_id === exercise.id)
        .sort((a, b) => a.set_order - b.set_order)
        .map((set) => ({
          id: set.id,
          weight: Number(set.weight),
          reps: Number(set.reps),
        })),
    }));

  return {
    id: workoutRow.id,
    name: workoutRow.name,
    date: workoutRow.performed_on,
    notes: workoutRow.notes || "",
    createdAt: toTimestamp(workoutRow.created_at),
    exercises,
  };
}

export async function listWorkouts(userId, { limit } = {}) {
  let query = getSupabaseClient()
    .from(TABLES.workouts)
    .select("*")
    .eq("user_id", userId)
    .order("performed_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  return query;
}

export async function getWorkout(userId, workoutId) {
  return getSupabaseClient()
    .from(TABLES.workouts)
    .select("*")
    .eq("user_id", userId)
    .eq("id", workoutId)
    .maybeSingle();
}

export async function createWorkout(workout) {
  return getSupabaseClient()
    .from(TABLES.workouts)
    .insert(workout)
    .select("*")
    .single();
}

export async function upsertWorkout(workout) {
  return getSupabaseClient()
    .from(TABLES.workouts)
    .upsert(workout)
    .select("*")
    .single();
}

export async function updateWorkout(userId, workoutId, updates) {
  return getSupabaseClient()
    .from(TABLES.workouts)
    .update(updates)
    .eq("user_id", userId)
    .eq("id", workoutId)
    .select("*")
    .single();
}

export async function deleteWorkout(userId, workoutId) {
  return getSupabaseClient()
    .from(TABLES.workouts)
    .delete()
    .eq("user_id", userId)
    .eq("id", workoutId);
}

export async function listWorkoutExercises(userId, workoutId) {
  return getSupabaseClient()
    .from(TABLES.workoutExercises)
    .select("*")
    .eq("user_id", userId)
    .eq("workout_id", workoutId)
    .order("exercise_order", { ascending: true });
}

export async function createWorkoutExercise(exercise) {
  return getSupabaseClient()
    .from(TABLES.workoutExercises)
    .insert(exercise)
    .select("*")
    .single();
}

export async function upsertWorkoutExercise(exercise) {
  return getSupabaseClient()
    .from(TABLES.workoutExercises)
    .upsert(exercise)
    .select("*")
    .single();
}

export async function updateWorkoutExercise(userId, exerciseId, updates) {
  return getSupabaseClient()
    .from(TABLES.workoutExercises)
    .update(updates)
    .eq("user_id", userId)
    .eq("id", exerciseId)
    .select("*")
    .single();
}

export async function deleteWorkoutExercise(userId, exerciseId) {
  return getSupabaseClient()
    .from(TABLES.workoutExercises)
    .delete()
    .eq("user_id", userId)
    .eq("id", exerciseId);
}

export async function listWorkoutSets(userId, workoutExerciseId) {
  return getSupabaseClient()
    .from(TABLES.workoutSets)
    .select("*")
    .eq("user_id", userId)
    .eq("workout_exercise_id", workoutExerciseId)
    .order("set_order", { ascending: true });
}

export async function createWorkoutSet(set) {
  return getSupabaseClient()
    .from(TABLES.workoutSets)
    .insert(set)
    .select("*")
    .single();
}

export async function upsertWorkoutSet(set) {
  return getSupabaseClient()
    .from(TABLES.workoutSets)
    .upsert(set)
    .select("*")
    .single();
}

export async function updateWorkoutSet(userId, setId, updates) {
  return getSupabaseClient()
    .from(TABLES.workoutSets)
    .update(updates)
    .eq("user_id", userId)
    .eq("id", setId)
    .select("*")
    .single();
}

export async function deleteWorkoutSet(userId, setId) {
  return getSupabaseClient()
    .from(TABLES.workoutSets)
    .delete()
    .eq("user_id", userId)
    .eq("id", setId);
}

export async function listExerciseHistory(userId, exerciseName) {
  return getSupabaseClient()
    .from(TABLES.workoutExercises)
    .select(`
      *,
      workouts (
        id,
        name,
        performed_on,
        created_at
      ),
      workout_sets (*)
    `)
    .eq("user_id", userId)
    .eq("exercise_name", exerciseName)
    .order("created_at", { ascending: false });
}

export async function fetchCloudWorkouts(userId) {
  const client = getSupabaseClient();
  const [workoutsResult, exercisesResult, setsResult] = await Promise.all([
    client
      .from(TABLES.workouts)
      .select("*")
      .eq("user_id", userId)
      .order("performed_on", { ascending: false })
      .order("created_at", { ascending: false }),
    client
      .from(TABLES.workoutExercises)
      .select("*")
      .eq("user_id", userId)
      .order("exercise_order", { ascending: true }),
    client
      .from(TABLES.workoutSets)
      .select("*")
      .eq("user_id", userId)
      .order("set_order", { ascending: true }),
  ]);

  const workoutRows = requireData(workoutsResult);
  const exerciseRows = requireData(exercisesResult);
  const setRows = requireData(setsResult);

  return workoutRows.map((workout) =>
    toAppWorkout(workout, exerciseRows, setRows)
  );
}

export async function fetchCloudWorkout(userId, workoutId) {
  const client = getSupabaseClient();
  const [workoutResult, exercisesResult, setsResult] = await Promise.all([
    client
      .from(TABLES.workouts)
      .select("*")
      .eq("user_id", userId)
      .eq("id", workoutId)
      .single(),
    client
      .from(TABLES.workoutExercises)
      .select("*")
      .eq("user_id", userId)
      .eq("workout_id", workoutId)
      .order("exercise_order", { ascending: true }),
    client
      .from(TABLES.workoutSets)
      .select("*")
      .eq("user_id", userId)
      .order("set_order", { ascending: true }),
  ]);

  const workout = requireData(workoutResult);
  const exercises = requireData(exercisesResult);
  const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
  const sets = requireData(setsResult).filter((set) =>
    exerciseIds.has(set.workout_exercise_id)
  );

  return toAppWorkout(workout, exercises, sets);
}

export async function saveCloudWorkout(userId, workout, { isEditing = false } = {}) {
  const client = getSupabaseClient();
  const workoutRow = toWorkoutRow(userId, workout);
  const exerciseRows = toExerciseRows(userId, workout);
  const setRows = toSetRows(userId, workout);

  if (isEditing) {
    requireData(
      await client
        .from(TABLES.workouts)
        .update({
          name: workoutRow.name,
          performed_on: workoutRow.performed_on,
          notes: workoutRow.notes,
        })
        .eq("user_id", userId)
        .eq("id", workout.id)
        .select("*")
        .single()
    );

    requireData(
      await client
        .from(TABLES.workoutExercises)
        .delete()
        .eq("user_id", userId)
        .eq("workout_id", workout.id)
    );
  } else {
    requireData(
      await client.from(TABLES.workouts).insert(workoutRow).select("*").single()
    );
  }

  if (exerciseRows.length) {
    requireData(await client.from(TABLES.workoutExercises).insert(exerciseRows));
  }

  if (setRows.length) {
    requireData(await client.from(TABLES.workoutSets).insert(setRows));
  }

  return fetchCloudWorkout(userId, workout.id);
}

export async function removeCloudWorkout(userId, workoutId) {
  requireData(await deleteWorkout(userId, workoutId));
}
