import { formatDate } from "../lib/formatters.js";

export function WorkoutCard({ workout, onEdit, onDelete }) {
  return (
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
            onClick={() => onEdit(workout)}
          >
            Edit
          </button>
          <button
            type="button"
            className="ghost-button danger"
            onClick={() => onDelete(workout.id)}
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
  );
}
