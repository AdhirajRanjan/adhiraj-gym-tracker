import { WEIGHT_INCREMENT_KG, REP_RANGE_MIN, REP_RANGE_MAX } from "./constants.js";
import { formatSetSuggestion } from "./formatters.js";

function findSetToProgress(sets) {
  for (let index = 0; index < sets.length; index += 1) {
    if (sets[index].reps >= REP_RANGE_MAX) continue;

    const allPreviousSetsAtMax = sets
      .slice(0, index)
      .every((set) => set.reps >= REP_RANGE_MAX);

    if (allPreviousSetsAtMax) {
      return index;
    }
  }

  return sets.findIndex((set) => set.reps < REP_RANGE_MAX);
}

export function getTrainingSuggestion(lastPerformance) {
  if (!lastPerformance || !lastPerformance.sets.length) {
    return { message: "No recommendation available yet." };
  }

  const sets = lastPerformance.sets.map((set) => ({
    weight: Number(set.weight),
    reps: Number(set.reps),
  }));

  const repRangeLabel = `${REP_RANGE_MIN}-${REP_RANGE_MAX} reps`;
  const allSetsAtOrAboveMax = sets.every((set) => set.reps >= REP_RANGE_MAX);

  if (allSetsAtOrAboveMax) {
    return {
      repRangeLabel,
      sets: sets.map((set) => ({
        weight: set.weight + WEIGHT_INCREMENT_KG,
        reps: REP_RANGE_MIN,
      })),
    };
  }

  const progressIndex = findSetToProgress(sets);

  return {
    repRangeLabel,
    sets: sets.map((set, index) => ({
      weight: set.weight,
      reps: index === progressIndex ? set.reps + 1 : set.reps,
    })),
  };
}

export { formatSetSuggestion };
