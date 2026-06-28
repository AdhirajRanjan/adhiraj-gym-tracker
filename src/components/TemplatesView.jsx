import { getMatchingExerciseSuggestions } from "../lib/analytics.js";

export function TemplatesView({
  templates,
  templateName,
  templateExercises,
  templateAutocompleteExerciseId,
  isCreatingTemplate,
  uniqueExercises,
  onTemplateNameChange,
  onTemplateExerciseNameChange,
  onAddTemplateExercise,
  onRemoveTemplateExercise,
  onTemplateAutocompleteFocus,
  onTemplateAutocompleteBlur,
  onSaveTemplate,
  onDeleteTemplate,
  onCancelTemplate,
  onNewTemplate,
  onBack,
}) {
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
            onClick={onBack}
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
                      onClick={() => onDeleteTemplate(template.id)}
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
              onClick={onNewTemplate}
            >
              New Template
            </button>
          ) : (
            <form onSubmit={onSaveTemplate} className="form-grid">
              <label>
                Template Name
                <input
                  type="text"
                  placeholder="Push A"
                  value={templateName}
                  onChange={(event) => onTemplateNameChange(event.target.value)}
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
                          onClick={() => onRemoveTemplateExercise(exercise.id)}
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
                            onChange={(event) => onTemplateExerciseNameChange(exercise.id, event.target.value)}
                            onFocus={() => onTemplateAutocompleteFocus(exercise.id)}
                            onBlur={() => {
                              window.setTimeout(() => onTemplateAutocompleteBlur(null), 150);
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter" || !exerciseSuggestions.length) return;

                              event.preventDefault();
                              onTemplateExerciseNameChange(exercise.id, exerciseSuggestions[0]);
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
                                      onTemplateExerciseNameChange(exercise.id, suggestion);
                                      onTemplateAutocompleteBlur(null);
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

                <button type="button" className="ghost-button" onClick={onAddTemplateExercise}>
                  + Add Exercise
                </button>
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={onCancelTemplate}
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
