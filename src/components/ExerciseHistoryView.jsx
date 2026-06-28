import { formatDate } from "../lib/formatters.js";

export function ExerciseHistoryView({
  uniqueExercises,
  selectedExercise,
  exerciseAnalytics,
  personalRecord,
  selectedExerciseEntries,
  onExerciseSelect,
  onBack,
}) {
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
            onClick={onBack}
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
                  onClick={() => onExerciseSelect(exerciseName)}
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
