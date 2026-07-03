import { getSupabaseClient } from "../client.js";
import { TABLES } from "./tables.js";

export async function listWorkoutTemplates(userId) {
  return getSupabaseClient()
    .from(TABLES.workoutTemplates)
    .select("*")
    .eq("user_id", userId)
    .order("template_order", { ascending: true })
    .order("updated_at", { ascending: false });
}

export async function getWorkoutTemplate(userId, templateId) {
  return getSupabaseClient()
    .from(TABLES.workoutTemplates)
    .select("*")
    .eq("user_id", userId)
    .eq("id", templateId)
    .maybeSingle();
}

export async function createWorkoutTemplate(template) {
  return getSupabaseClient()
    .from(TABLES.workoutTemplates)
    .insert(template)
    .select("*")
    .single();
}

export async function upsertWorkoutTemplate(template) {
  return getSupabaseClient()
    .from(TABLES.workoutTemplates)
    .upsert(template)
    .select("*")
    .single();
}

export async function updateWorkoutTemplate(userId, templateId, updates) {
  return getSupabaseClient()
    .from(TABLES.workoutTemplates)
    .update(updates)
    .eq("user_id", userId)
    .eq("id", templateId)
    .select("*")
    .single();
}

export async function deleteWorkoutTemplate(userId, templateId) {
  return getSupabaseClient()
    .from(TABLES.workoutTemplates)
    .delete()
    .eq("user_id", userId)
    .eq("id", templateId);
}

export async function listTemplateExercises(userId, templateId) {
  return getSupabaseClient()
    .from(TABLES.templateExercises)
    .select("*")
    .eq("user_id", userId)
    .eq("template_id", templateId)
    .order("exercise_order", { ascending: true });
}

export async function createTemplateExercise(exercise) {
  return getSupabaseClient()
    .from(TABLES.templateExercises)
    .insert(exercise)
    .select("*")
    .single();
}

export async function upsertTemplateExercise(exercise) {
  return getSupabaseClient()
    .from(TABLES.templateExercises)
    .upsert(exercise)
    .select("*")
    .single();
}

export async function updateTemplateExercise(userId, exerciseId, updates) {
  return getSupabaseClient()
    .from(TABLES.templateExercises)
    .update(updates)
    .eq("user_id", userId)
    .eq("id", exerciseId)
    .select("*")
    .single();
}

export async function deleteTemplateExercise(userId, exerciseId) {
  return getSupabaseClient()
    .from(TABLES.templateExercises)
    .delete()
    .eq("user_id", userId)
    .eq("id", exerciseId);
}
