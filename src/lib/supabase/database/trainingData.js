import {
  fetchCloudTemplates,
  importCloudTemplates,
} from "./templates.js";
import {
  fetchCloudWorkouts,
  importCloudWorkouts,
} from "./workouts.js";

export async function fetchCloudTrainingData(userId) {
  const [workouts, templates] = await Promise.all([
    fetchCloudWorkouts(userId),
    fetchCloudTemplates(userId),
  ]);

  return { templates, workouts };
}

export async function importCloudTrainingData(userId, trainingData) {
  await importCloudWorkouts(userId, trainingData.workouts);
  await importCloudTemplates(userId, trainingData.templates);

  return fetchCloudTrainingData(userId);
}
