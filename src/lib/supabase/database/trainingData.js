import { fetchCloudTemplates } from "./templates.js";
import { fetchCloudWorkouts } from "./workouts.js";

export async function fetchCloudTrainingData(userId) {
  const [workouts, templates] = await Promise.all([
    fetchCloudWorkouts(userId),
    fetchCloudTemplates(userId),
  ]);

  return { templates, workouts };
}
