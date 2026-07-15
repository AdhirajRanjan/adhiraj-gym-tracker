import { motion, useReducedMotion } from "framer-motion";
import { formatDate } from "../lib/formatters.js";

export function WorkoutCard({ workout, onEdit, onDelete, isDeleting = false }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      key={workout.id}
      className="workout-item"
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.985 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
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
            disabled={isDeleting}
          >
            Edit
          </button>
          <button
            type="button"
            className="ghost-button danger"
            onClick={() => onDelete(workout.id)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
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
    </motion.article>
  );
}
