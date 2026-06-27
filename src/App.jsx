import { useMemo, useState } from "react";

const STORAGE_KEY = "gym-tracker-workouts";
const TEMPLATES_STORAGE_KEY = "gym-tracker-templates";

function createSet() {
  return { id: crypto.randomUUID(), weight: "", reps: "" };
}

function createExercise() {
  return { id: crypto.randomUUID(), name: "", sets: [createSet()] };
}

function createTemplateExercise() {
  return { id: crypto.randomUUID(), name: "" };
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getInitialWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getInitialTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getUniqueExerciseNames(workouts) {
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

function getMatchingExerciseSuggestions(exerciseNames, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return exerciseNames.filter((name) => name.toLowerCase().includes(normalizedQuery));
}

function getLastExercisePerformance(workouts, exerciseQuery) {
  const normalizedQuery = exerciseQuery.trim().toLowerCase();
  if (!normalizedQuery) return null;

  const sortedWorkouts = [...workouts].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt
  );

  for (const workout of sortedWorkouts) {
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

const WEIGHT_INCREMENT_KG = 2.5;
const REP_RANGE_MIN = 6;
const REP_RANGE_MAX = 10;

function formatSetSuggestion(weight, reps) {
  return `${weight}kg × ${reps}`;
}

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

function getTrainingSuggestion(lastPerformance) {
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

function getExerciseAnalytics(workouts, exerciseName) {
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

function App() {
  const [workouts, setWorkouts] = useState(() => getInitialWorkouts());
  const [templates, setTemplates] = useState(() => getInitialTemplates());
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [view, setView] = useState("dashboard");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [exercises, setExercises] = useState([createExercise()]);
  const [autocompleteExerciseId, setAutocompleteExerciseId] = useState(null);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateExercises, setTemplateExercises] = useState([createTemplateExercise()]);
  const [templateAutocompleteExerciseId, setTemplateAutocompleteExerciseId] = useState(null);

  const sortedWorkouts = useMemo(
    () =>
      [...workouts].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          b.createdAt - a.createdAt
      ),
    [workouts]
  );

  const persistWorkouts = (nextWorkouts) => {
    setWorkouts(nextWorkouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWorkouts));
  };

  const persistTemplates = (nextTemplates) => {
    setTemplates(nextTemplates);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(nextTemplates));
  };

  const uniqueExercises = useMemo(() => getUniqueExerciseNames(workouts), [workouts]);

  const stats = useMemo(() => {
    const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
    return {
      totalWorkouts: workouts.length,
      totalExercises,
      totalTemplates: templates.length,
    };
  }, [workouts, templates]);

  const selectedExerciseEntries = useMemo(() => {
    if (!selectedExercise) return [];
    const selectedKey = selectedExercise.toLowerCase();
    const entries = [];

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (exercise.name.trim().toLowerCase() !== selectedKey) return;
        exercise.sets.forEach((set) => {
          entries.push({
            id: `${workout.id}-${exercise.id}-${set.id}`,
            workoutName: workout.name,
            date: workout.date,
            createdAt: workout.createdAt,
            weight: set.weight,
            reps: set.reps,
          });
        });
      });
    });

    return entries.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt
    );
  }, [workouts, selectedExercise]);

  const personalRecord = useMemo(() => {
    if (!selectedExerciseEntries.length) return { highestWeight: null, highestReps: null };

    return selectedExerciseEntries.reduce(
      (records, entry) => ({
        highestWeight: Math.max(records.highestWeight, Number(entry.weight)),
        highestReps: Math.max(records.highestReps, Number(entry.reps)),
      }),
      { highestWeight: 0, highestReps: 0 }
    );
  }, [selectedExerciseEntries]);

  const exerciseAnalytics = useMemo(
    () => (selectedExercise ? getExerciseAnalytics(workouts, selectedExercise) : null),
    [workouts, selectedExercise]
  );

  const deleteWorkout = (workoutId) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this workout?");
    if (!shouldDelete) return;

    const nextWorkouts = workouts.filter((workout) => workout.id !== workoutId);
    persistWorkouts(nextWorkouts);
  };

  const deleteTemplate = (templateId) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this template?");
    if (!shouldDelete) return;

    const nextTemplates = templates.filter((template) => template.id !== templateId);
    persistTemplates(nextTemplates);
  };

  const resetForm = () => {
    setWorkoutName("");
    setWorkoutDate("");
    setExercises([createExercise()]);
    setAutocompleteExerciseId(null);
    setWorkoutNotes("");
    setEditingWorkoutId(null);
  };

  const resetTemplateForm = () => {
    setTemplateName("");
    setTemplateExercises([createTemplateExercise()]);
    setTemplateAutocompleteExerciseId(null);
  };

  const clearAllData = () => {
    const shouldClear = window.confirm(
      "This will permanently delete all workout data. Continue?"
    );
    if (!shouldClear) return;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TEMPLATES_STORAGE_KEY);
    setWorkouts([]);
    setTemplates([]);
    resetForm();
    setIsCreating(false);
    setView("dashboard");
    setSelectedExercise("");
  };

  const addExercise = () => {
    setExercises((prev) => [...prev, createExercise()]);
  };

  const addTemplateExercise = () => {
    setTemplateExercises((prev) => [...prev, createTemplateExercise()]);
  };

  const updateExerciseName = (exerciseId, value) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, name: value } : exercise
      )
    );
  };

  const updateTemplateExerciseName = (exerciseId, value) => {
    setTemplateExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, name: value } : exercise
      )
    );
  };

  const addSetToExercise = (exerciseId) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, createSet()] }
          : exercise
      )
    );
  };

  const updateSetField = (exerciseId, setId, field, value) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : exercise
      )
    );
  };

  const removeSet = (exerciseId, setId) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const remainingSets = exercise.sets.filter((set) => set.id !== setId);
        return { ...exercise, sets: remainingSets.length ? remainingSets : [createSet()] };
      })
    );
  };

  const removeExercise = (exerciseId) => {
    setExercises((prev) => {
      const remaining = prev.filter((exercise) => exercise.id !== exerciseId);
      return remaining.length ? remaining : [createExercise()];
    });
  };

  const moveExerciseUp = (index) => {
    if (index === 0) return;
    setExercises((prev) => {
      const newExercises = [...prev];
      [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
      return newExercises;
    });
  };

  const moveExerciseDown = (index) => {
    if (index === exercises.length - 1) return;
    setExercises((prev) => {
      const newExercises = [...prev];
      [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
      return newExercises;
    });
  };

  const removeTemplateExercise = (exerciseId) => {
    setTemplateExercises((prev) => {
      const remaining = prev.filter((exercise) => exercise.id !== exerciseId);
      return remaining.length ? remaining : [createTemplateExercise()];
    });
  };

  const handleSaveWorkout = (event) => {
    event.preventDefault();

    const trimmedName = workoutName.trim();
    const trimmedNotes = workoutNotes.trim();
    const validExercises = exercises
      .map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
        sets: exercise.sets
          .map((set) => ({
            ...set,
            weight: set.weight.toString().trim(),
            reps: set.reps.toString().trim(),
          }))
          .filter((set) => set.weight !== "" && set.reps !== ""),
      }))
      .filter((exercise) => exercise.name !== "" && exercise.sets.length > 0);

    if (!trimmedName || !workoutDate || validExercises.length === 0) {
      window.alert(
        "Please enter workout name, date, and at least one exercise with one complete set."
      );
      return;
    }

    const workoutData = {
      name: trimmedName,
      date: workoutDate,
      notes: trimmedNotes,
      exercises: validExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets.map((set) => ({
          id: set.id,
          weight: Number(set.weight),
          reps: Number(set.reps),
        })),
      })),
    };

    if (editingWorkoutId) {
      const updatedWorkouts = workouts.map((workout) =>
        workout.id === editingWorkoutId
          ? { ...workout, ...workoutData }
          : workout
      );
      persistWorkouts(updatedWorkouts);
    } else {
      const newWorkout = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        ...workoutData,
      };
      persistWorkouts([newWorkout, ...workouts]);
    }

    resetForm();
    setIsCreating(false);
  };

  const handleSaveTemplate = (event) => {
    event.preventDefault();

    const trimmedName = templateName.trim();
    const validExercises = templateExercises
      .map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
      }))
      .filter((exercise) => exercise.name !== "");

    if (!trimmedName || validExercises.length === 0) {
      window.alert("Please enter template name and at least one exercise.");
      return;
    }

    const newTemplate = {
      id: crypto.randomUUID(),
      name: trimmedName,
      exercises: validExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
      })),
    };

    persistTemplates([newTemplate, ...templates]);
    resetTemplateForm();
    setIsCreatingTemplate(false);
  };

  const applyTemplate = (template) => {
    const hasExistingExercises = exercises.some(
      (exercise) => exercise.name.trim() !== ""
    );

    if (hasExistingExercises) {
      const shouldReplace = window.confirm(
        "This will replace your current exercises. Continue?"
      );
      if (!shouldReplace) return;
    }

    const newExercises = template.exercises.map((exercise) => ({
      id: crypto.randomUUID(),
      name: exercise.name,
      sets: [createSet()],
    }));

    setExercises(newExercises);
    setWorkoutName(template.name);
  };

  const editWorkout = (workout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutName(workout.name);
    setWorkoutDate(workout.date);
    setWorkoutNotes(workout.notes || "");
    setExercises(
      workout.exercises.map((exercise) => ({
        id: crypto.randomUUID(),
        name: exercise.name,
        sets: exercise.sets.map((set) => ({
          id: crypto.randomUUID(),
          weight: set.weight,
          reps: set.reps,
        })),
      }))
    );
    setIsCreating(true);
  };

  if (view === "history") {
    return (
      <div className="page">
        <div className="container">
          <header className="header">
            <div>
              <h1>Exercise History</h1>
              <p>Review every logged set and your personal records.</p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setView("dashboard");
                setSelectedExercise("");
              }}
            >
              Back
            </button>
          </header>

          <section className="card">
            <div className="card-header">
              <h2>All Exercises</h2>
            </div>
            {uniqueExercises.length === 0 ? (
              <p className="empty-state">No exercises logged yet. Save a workout to see history.</p>
            ) : (
              <div className="exercise-chip-list">
                {uniqueExercises.map((exerciseName) => (
                  <button
                    type="button"
                    key={exerciseName}
                    className={`exercise-chip ${
                      selectedExercise === exerciseName ? "exercise-chip-active" : ""
                    }`}
                    onClick={() => setSelectedExercise(exerciseName)}
                  >
                    {exerciseName}
                  </button>
                ))}
              </div>
            )}
          </section>

          {selectedExercise && (
            <>
              <section className="card">
                <div className="card-header">
                  <h2>Exercise Analytics - {selectedExercise}</h2>
                </div>
                {exerciseAnalytics ? (
                  <div className="analytics-grid">
                    <div className="analytics-stat-card">
                      <span className="analytics-stat-label">Total Sessions</span>
                      <strong className="analytics-stat-value">{exerciseAnalytics.totalSessions}</strong>
                    </div>
                    <div className="analytics-stat-card">
                      <span className="analytics-stat-label">Best Weight</span>
                      <strong className="analytics-stat-value">{exerciseAnalytics.bestWeight} kg</strong>
                    </div>
                    <div className="analytics-stat-card">
                      <span className="analytics-stat-label">Best Reps</span>
                      <strong className="analytics-stat-value">{exerciseAnalytics.bestReps}</strong>
                    </div>
                    <div className="analytics-stat-card">
                      <span className="analytics-stat-label">First Logged</span>
                      <strong className="analytics-stat-value">
                        {formatDate(exerciseAnalytics.firstLogged)}
                      </strong>
                    </div>
                    <div className="analytics-stat-card">
                      <span className="analytics-stat-label">Last Logged</span>
                      <strong className="analytics-stat-value">
                        {formatDate(exerciseAnalytics.lastLogged)}
                      </strong>
                    </div>
                    <div className="analytics-stat-card">
                      <span className="analytics-stat-label">Total Sets</span>
                      <strong className="analytics-stat-value">{exerciseAnalytics.totalSets}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="empty-state">No analytics available for this exercise.</p>
                )}
              </section>

              <section className="card">
                <div className="card-header">
                  <h2>Personal Record - {selectedExercise}</h2>
                </div>
                <div className="pr-grid">
                  <div className="pr-item">
                    <span>Highest Weight</span>
                    <strong>
                      {personalRecord.highestWeight !== null ? `${personalRecord.highestWeight} kg` : "-"}
                    </strong>
                  </div>
                  <div className="pr-item">
                    <span>Highest Reps</span>
                    <strong>
                      {personalRecord.highestReps !== null ? `${personalRecord.highestReps} reps` : "-"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="card-header">
                  <h2>{selectedExercise} Entries</h2>
                </div>
                {selectedExerciseEntries.length === 0 ? (
                  <p className="empty-state">No entries found for this exercise.</p>
                ) : (
                  <div className="history-list">
                    {selectedExerciseEntries.map((entry) => (
                      <article key={entry.id} className="history-item">
                        <div className="history-row">
                          <span className="history-label">Date</span>
                          <strong>{formatDate(entry.date)}</strong>
                        </div>
                        <div className="history-row">
                          <span className="history-label">Workout</span>
                          <strong>{entry.workoutName}</strong>
                        </div>
                        <div className="history-row">
                          <span className="history-label">Weight</span>
                          <strong>{entry.weight} kg</strong>
                        </div>
                        <div className="history-row">
                          <span className="history-label">Reps</span>
                          <strong>{entry.reps}</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    );
  }

  if (view === "templates") {
    return (
      <div className="page">
        <div className="container">
          <header className="header">
            <div>
              <h1>Workout Templates</h1>
              <p>Save and reuse your workout routines.</p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setView("dashboard");
                setIsCreatingTemplate(false);
                resetTemplateForm();
              }}
            >
              Back
            </button>
          </header>

          <section className="card">
            <div className="card-header">
              <h2>Saved Templates</h2>
            </div>
            {templates.length === 0 ? (
              <p className="empty-state">No templates saved yet. Create one to get started.</p>
            ) : (
              <div className="workout-list">
                {templates.map((template) => (
                  <article key={template.id} className="workout-item">
                    <div className="workout-top">
                      <div className="workout-heading">
                        <h3>{template.name}</h3>
                        <time>{template.exercises.length} exercise{template.exercises.length !== 1 ? "s" : ""}</time>
                      </div>
                      <button
                        type="button"
                        className="ghost-button danger"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        Delete
                      </button>
                    </div>
                    <ul className="exercise-summary">
                      {template.exercises.map((exercise) => (
                        <li key={exercise.id}>
                          <strong>{exercise.name}</strong>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Create Template</h2>
            </div>
            {!isCreatingTemplate ? (
              <button
                type="button"
                className="primary-button"
                onClick={() => setIsCreatingTemplate(true)}
              >
                New Template
              </button>
            ) : (
              <form onSubmit={handleSaveTemplate} className="form-grid">
                <label>
                  Template Name
                  <input
                    type="text"
                    placeholder="Push A"
                    value={templateName}
                    onChange={(event) => setTemplateName(event.target.value)}
                    required
                  />
                </label>

                <div className="exercise-section">
                  <h3>Exercises</h3>
                  {templateExercises.map((exercise, index) => {
                    const exerciseSuggestions = getMatchingExerciseSuggestions(
                      uniqueExercises,
                      exercise.name
                    );
                    const showExerciseAutocomplete =
                      templateAutocompleteExerciseId === exercise.id && exerciseSuggestions.length > 0;

                    return (
                      <div key={exercise.id} className="exercise-card">
                        <div className="exercise-header">
                          <h4>Exercise {index + 1}</h4>
                          <button
                            type="button"
                            className="ghost-button danger"
                            onClick={() => removeTemplateExercise(exercise.id)}
                          >
                            Remove
                          </button>
                        </div>

                        <label>
                          Exercise Name
                          <div className="autocomplete-field">
                            <input
                              type="text"
                              placeholder="Bench Press"
                              value={exercise.name}
                              autoComplete="off"
                              onChange={(event) => updateTemplateExerciseName(exercise.id, event.target.value)}
                              onFocus={() => setTemplateAutocompleteExerciseId(exercise.id)}
                              onBlur={() => {
                                window.setTimeout(() => setTemplateAutocompleteExerciseId(null), 150);
                              }}
                              onKeyDown={(event) => {
                                if (event.key !== "Enter" || !exerciseSuggestions.length) return;

                                event.preventDefault();
                                updateTemplateExerciseName(exercise.id, exerciseSuggestions[0]);
                              }}
                            />
                            {showExerciseAutocomplete && (
                              <ul className="autocomplete-dropdown" role="listbox">
                                {exerciseSuggestions.map((suggestion) => (
                                  <li key={suggestion}>
                                    <button
                                      type="button"
                                      className="autocomplete-option"
                                      role="option"
                                      onMouseDown={(event) => {
                                        event.preventDefault();
                                        updateTemplateExerciseName(exercise.id, suggestion);
                                        setTemplateAutocompleteExerciseId(null);
                                      }}
                                    >
                                      {suggestion}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}

                  <button type="button" className="ghost-button" onClick={addTemplateExercise}>
                    + Add Exercise
                  </button>
                </div>

                <div className="actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      resetTemplateForm();
                      setIsCreatingTemplate(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button">
                    Save Template
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div>
            <h1>Venato</h1>
            <p>Track every workout. Progress with purpose.</p>
          </div>
          <div className="header-actions">
            <button type="button" className="ghost-button" onClick={() => setView("templates")}>
              Templates
            </button>
            <button type="button" className="ghost-button" onClick={() => setView("history")}>
              Exercise History
            </button>
            {!isCreating && (
              <button className="primary-button" onClick={() => setIsCreating(true)}>
                New Workout
              </button>
            )}
          </div>
        </header>

        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-value">{stats.totalWorkouts}</p>
              <p className="stat-label">Total Workouts</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">{stats.totalExercises}</p>
              <p className="stat-label">Total Exercises Trained</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">{stats.totalTemplates}</p>
              <p className="stat-label">Total Templates</p>
            </div>
          </div>
        </section>

        {isCreating && (
          <section className="card">
            <div className="card-header">
              <h2>{editingWorkoutId ? "Edit Workout" : "Create Workout"}</h2>
            </div>
            <form onSubmit={handleSaveWorkout} className="form-grid">
              <label>
                Workout Name
                <input
                  type="text"
                  placeholder="Push A"
                  value={workoutName}
                  onChange={(event) => setWorkoutName(event.target.value)}
                  required
                />
              </label>
              <label>
                Workout Date
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(event) => setWorkoutDate(event.target.value)}
                  required
                />
              </label>

              <div className="exercise-section">
                <div className="exercise-header">
                  <h3>Exercises</h3>
                  {templates.length > 0 && (
                    <div className="template-selector">
                      <select
                        value=""
                        onChange={(event) => {
                          if (event.target.value) {
                            const template = templates.find((t) => t.id === event.target.value);
                            if (template) applyTemplate(template);
                          }
                        }}
                        className="template-select"
                      >
                        <option value="">Use Template...</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {exercises.map((exercise, index) => {
                  const exerciseSuggestions = getMatchingExerciseSuggestions(
                    uniqueExercises,
                    exercise.name
                  );
                  const showExerciseAutocomplete =
                    autocompleteExerciseId === exercise.id && exerciseSuggestions.length > 0;
                  const trimmedExerciseName = exercise.name.trim();
                  const lastPerformance = trimmedExerciseName
                    ? getLastExercisePerformance(workouts, trimmedExerciseName)
                    : null;
                  const trainingSuggestion = getTrainingSuggestion(lastPerformance);

                  return (
                  <div key={exercise.id} className="exercise-card">
                    <div className="exercise-header">
                      <h4>Exercise {index + 1}</h4>
                      <div className="exercise-actions">
                        <button
                          type="button"
                          className="ghost-button reorder-button"
                          onClick={() => moveExerciseUp(index)}
                          disabled={index === 0}
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="ghost-button reorder-button"
                          onClick={() => moveExerciseDown(index)}
                          disabled={index === exercises.length - 1}
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="ghost-button danger"
                          onClick={() => removeExercise(exercise.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <label>
                      Exercise Name
                      <div className="autocomplete-field">
                        <input
                          type="text"
                          placeholder="Bench Press"
                          value={exercise.name}
                          autoComplete="off"
                          onChange={(event) => updateExerciseName(exercise.id, event.target.value)}
                          onFocus={() => setAutocompleteExerciseId(exercise.id)}
                          onBlur={() => {
                            window.setTimeout(() => setAutocompleteExerciseId(null), 150);
                          }}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter" || !exerciseSuggestions.length) return;

                            event.preventDefault();
                            updateExerciseName(exercise.id, exerciseSuggestions[0]);
                          }}
                        />
                        {showExerciseAutocomplete && (
                            <ul className="autocomplete-dropdown" role="listbox">
                              {exerciseSuggestions.map(
                                (suggestion) => (
                                  <li key={suggestion}>
                                    <button
                                      type="button"
                                      className="autocomplete-option"
                                      role="option"
                                      onMouseDown={(event) => {
                                        event.preventDefault();
                                        updateExerciseName(exercise.id, suggestion);
                                        setAutocompleteExerciseId(null);
                                      }}
                                    >
                                      {suggestion}
                                    </button>
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                      </div>
                    </label>

                    {trimmedExerciseName && (
                      <div className="previous-performance-card">
                        <p className="previous-performance-title">Last Performance</p>
                        {lastPerformance ? (
                          <>
                            <p className="previous-performance-exercise">{lastPerformance.exerciseName}</p>
                            <p className="previous-performance-meta">{formatDate(lastPerformance.date)}</p>
                            <p className="previous-performance-meta">{lastPerformance.workoutName}</p>
                            <ul className="previous-performance-sets">
                              {lastPerformance.sets.map((set, setIndex) => (
                                <li key={set.id}>
                                  Set {setIndex + 1}: {set.weight}kg × {set.reps}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="previous-performance-empty">No previous performance found.</p>
                        )}
                      </div>
                    )}

                    {trimmedExerciseName && (
                      <div className="training-suggestion-card">
                        <p className="training-suggestion-title">Suggested Next Session</p>
                        {trainingSuggestion.sets ? (
                          <>
                            <p className="training-suggestion-subtitle">
                              Double progression · {trainingSuggestion.repRangeLabel} · one set at a
                              time
                            </p>
                          <ul className="training-suggestion-sets">
                            {trainingSuggestion.sets.map((set, setIndex) => (
                              <li key={`${set.weight}-${set.reps}-${setIndex}`}>
                                Set {setIndex + 1}: {formatSetSuggestion(set.weight, set.reps)}
                              </li>
                            ))}
                          </ul>
                          </>
                        ) : (
                          <p className="training-suggestion-empty">{trainingSuggestion.message}</p>
                        )}
                      </div>
                    )}

                    <div className="sets-list">
                      {exercise.sets.map((set, setIndex) => (
                        <div className="set-row" key={set.id}>
                          <span>Set {setIndex + 1}</span>
                          <input
                            type="number"
                            placeholder="Weight"
                            min="0"
                            step="0.5"
                            value={set.weight}
                            onChange={(event) =>
                              updateSetField(exercise.id, set.id, "weight", event.target.value)
                            }
                          />
                          <input
                            type="number"
                            placeholder="Reps"
                            min="0"
                            step="1"
                            value={set.reps}
                            onChange={(event) =>
                              updateSetField(exercise.id, set.id, "reps", event.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => removeSet(exercise.id, set.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => addSetToExercise(exercise.id)}
                    >
                      + Add Set
                    </button>
                  </div>
                  );
                })}

                <button type="button" className="ghost-button" onClick={addExercise}>
                  + Add Exercise
                </button>
              </div>

              <label>
                Notes
                <textarea
                  placeholder="Optional notes about this workout..."
                  value={workoutNotes}
                  onChange={(event) => setWorkoutNotes(event.target.value)}
                  rows={3}
                />
              </label>

              <div className="actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    resetForm();
                    setIsCreating(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingWorkoutId ? "Update Workout" : "Save Workout"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="card">
          <div className="card-header">
            <h2>Saved Workouts</h2>
          </div>
          {sortedWorkouts.length === 0 ? (
            <p className="empty-state">No workouts saved yet. Click "New Workout" to start.</p>
          ) : (
            <div className="workout-list">
              {sortedWorkouts.map((workout) => (
                <article key={workout.id} className="workout-item">
                  <div className="workout-top">
                    <div className="workout-heading">
                      <h3>{workout.name}</h3>
                      <time>{formatDate(workout.date)}</time>
                    </div>
                    <div className="workout-actions">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => editWorkout(workout)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-button danger"
                        onClick={() => deleteWorkout(workout.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <ul className="exercise-summary">
                    {workout.exercises.map((exercise) => (
                      <li key={exercise.id}>
                        <strong>{exercise.name}</strong>
                        <span>
                          {exercise.sets
                            .map((set) => `${set.weight} kg x ${set.reps} reps`)
                            .join(" • ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {workout.notes && (
                    <div className="workout-notes">
                      <p className="workout-notes-label">Notes</p>
                      <p className="workout-notes-text">{workout.notes}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dev-tools">
          <button type="button" className="danger-button" onClick={clearAllData}>
            Clear All Data
          </button>
        </section>
      </div>
    </div>
  );
}

export default App;
