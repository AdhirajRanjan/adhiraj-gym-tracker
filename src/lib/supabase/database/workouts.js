import { getSupabaseClient } from "../client.js";
import { TABLES } from "./tables.js";

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
