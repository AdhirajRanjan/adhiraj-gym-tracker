import { formatDate, formatSetSuggestion } from "../lib/formatters.js";
import {
  getMatchingExerciseSuggestions,
  getLastExercisePerformance,
} from "../lib/analytics.js";
import { getTrainingSuggestion } from "../lib/progression.js";

export function WorkoutForm({
  workoutName,
  workoutDate,
  exercises,
  workoutNotes,
  editingWorkoutId,
  templates,
  uniqueExercises,
  autocompleteExerciseId,
  workouts,
  onWorkoutNameChange,
  onWorkoutDateChange,
  onWorkoutNotesChange,
  onExerciseNameChange,
  onSetFieldChange,
  onAddExercise,
  onRemoveExercise,
  onMoveExerciseUp,
  onMoveExerciseDown,
  onAddSet,
  onRemoveSet,
  onAutocompleteFocus,
  onAutocompleteBlur,
  onApplyTemplate,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>{editingWorkoutId ? "Edit Workout" : "Create Workout"}</h2>
      </div>
      <form onSubmit={onSubmit} className="form-grid">
        <label>
          Workout Name
          <input
            type="text"
            placeholder="Push A"
            value={workoutName}
            onChange={(event) => onWorkoutNameChange(event.target.value)}
            required
          />
        </label>
        <label>
          Workout Date
          <input
            type="date"
            value={workoutDate}
            onChange={(event) => onWorkoutDateChange(event.target.value)}
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
                      if (template) onApplyTemplate(template);
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
              ? getLastExercisePerformance(workouts, trimmedExerciseName, editingWorkoutId)
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
                      onClick={() => onMoveExerciseUp(index)}
                      disabled={index === 0}
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="ghost-button reorder-button"
                      onClick={() => onMoveExerciseDown(index)}
                      disabled={index === exercises.length - 1}
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="ghost-button danger"
                      onClick={() => onRemoveExercise(exercise.id)}
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
                      onChange={(event) => onExerciseNameChange(exercise.id, event.target.value)}
                      onFocus={() => onAutocompleteFocus(exercise.id)}
                      onBlur={() => {
                        window.setTimeout(() => onAutocompleteBlur(null), 150);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" || !exerciseSuggestions.length) return;

                        event.preventDefault();
                        onExerciseNameChange(exercise.id, exerciseSuggestions[0]);
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
                                onExerciseNameChange(exercise.id, suggestion);
                                onAutocompleteBlur(null);
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
                          onSetFieldChange(exercise.id, set.id, "weight", event.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        min="0"
                        step="1"
                        value={set.reps}
                        onChange={(event) =>
                          onSetFieldChange(exercise.id, set.id, "reps", event.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => onRemoveSet(exercise.id, set.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => onAddSet(exercise.id)}
                >
                  + Add Set
                </button>
              </div>
            );
          })}

          <button type="button" className="ghost-button" onClick={onAddExercise}>
            + Add Exercise
          </button>
        </div>

        <label>
          Notes
          <textarea
            placeholder="Optional notes about this workout..."
            value={workoutNotes}
            onChange={(event) => onWorkoutNotesChange(event.target.value)}
            rows={3}
          />
        </label>

        <div className="actions">
          <button
            type="button"
            className="ghost-button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="primary-button">
            {editingWorkoutId ? "Update Workout" : "Save Workout"}
          </button>
        </div>
      </form>
    </section>
  );
}
