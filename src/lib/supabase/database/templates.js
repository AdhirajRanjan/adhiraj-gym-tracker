import { getSupabaseClient } from "../client.js";
import { TABLES } from "./tables.js";

function requireData(result) {
  if (result.error) {
    throw result.error;
  }

  return result.data ?? [];
}

function toTemplateRow(userId, template, templateOrder) {
  return {
    id: template.id,
    user_id: userId,
    name: template.name,
    template_order: templateOrder,
  };
}

function toTemplateExerciseRows(userId, template) {
  return template.exercises.map((exercise, index) => ({
    id: exercise.id,
    user_id: userId,
    template_id: template.id,
    exercise_name: exercise.name,
    exercise_order: index,
  }));
}

function toAppTemplate(templateRow, exerciseRows) {
  return {
    id: templateRow.id,
    name: templateRow.name,
    exercises: exerciseRows
      .filter((exercise) => exercise.template_id === templateRow.id)
      .sort((a, b) => a.exercise_order - b.exercise_order)
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.exercise_name,
      })),
  };
}

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

export async function fetchCloudTemplates(userId) {
  const client = getSupabaseClient();
  const [templatesResult, exercisesResult] = await Promise.all([
    client
      .from(TABLES.workoutTemplates)
      .select("*")
      .eq("user_id", userId)
      .order("template_order", { ascending: true })
      .order("updated_at", { ascending: false }),
    client
      .from(TABLES.templateExercises)
      .select("*")
      .eq("user_id", userId)
      .order("exercise_order", { ascending: true }),
  ]);

  const templateRows = requireData(templatesResult);
  const exerciseRows = requireData(exercisesResult);

  return templateRows.map((template) =>
    toAppTemplate(template, exerciseRows)
  );
}

export async function fetchCloudTemplate(userId, templateId) {
  const client = getSupabaseClient();
  const [templateResult, exercisesResult] = await Promise.all([
    client
      .from(TABLES.workoutTemplates)
      .select("*")
      .eq("user_id", userId)
      .eq("id", templateId)
      .single(),
    client
      .from(TABLES.templateExercises)
      .select("*")
      .eq("user_id", userId)
      .eq("template_id", templateId)
      .order("exercise_order", { ascending: true }),
  ]);

  return toAppTemplate(
    requireData(templateResult),
    requireData(exercisesResult)
  );
}

export async function saveCloudTemplate(userId, template, existingTemplates = []) {
  const client = getSupabaseClient();

  requireData(
    await client
      .from(TABLES.workoutTemplates)
      .insert(toTemplateRow(userId, template, 0))
      .select("*")
      .single()
  );

  const exerciseRows = toTemplateExerciseRows(userId, template);

  if (exerciseRows.length) {
    requireData(await client.from(TABLES.templateExercises).insert(exerciseRows));
  }

  const orderResults = await Promise.all(
    existingTemplates.map((existingTemplate, index) =>
      updateWorkoutTemplate(userId, existingTemplate.id, {
        template_order: index + 1,
      })
    )
  );
  orderResults.forEach(requireData);

  return fetchCloudTemplate(userId, template.id);
}

export async function removeCloudTemplate(userId, templateId) {
  requireData(await deleteWorkoutTemplate(userId, templateId));
}
