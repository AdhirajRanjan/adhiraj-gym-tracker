import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Header } from "./Header.jsx";
import { StatsCards } from "./StatsCards.jsx";
import { WorkoutForm } from "./WorkoutForm.jsx";
import { WorkoutCard } from "./WorkoutCard.jsx";

export function Dashboard({
  stats,
  isCreating,
  editingWorkoutId,
  workoutName,
  workoutDate,
  exercises,
  workoutNotes,
  templates,
  uniqueExercises,
  autocompleteExerciseId,
  sortedWorkouts,
  workouts,
  isDataLoading,
  isSavingWorkout,
  deletingWorkoutId,
  onViewChange,
  onNewWorkout,
  onWorkoutNameChange,
  onWorkoutDateChange,
  onWorkoutNotesChange,
  onExerciseNameChange,
  onSetFieldChange,
  onReplaceExerciseSets,
  onAddExercise,
  onRemoveExercise,
  onMoveExerciseUp,
  onMoveExerciseDown,
  onAddSet,
  onRemoveSet,
  onAutocompleteFocus,
  onAutocompleteBlur,
  onApplyTemplate,
  onSaveWorkout,
  onCancelWorkout,
  onEditWorkout,
  onDeleteWorkout,
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="page">
      <div className="container">
        <Header
          onViewChange={onViewChange}
          currentView="dashboard"
          isCreating={isCreating}
          onNewWorkout={onNewWorkout}
        />

        {isDataLoading && (
          <p className="data-status">Loading cloud data...</p>
        )}

        <StatsCards stats={stats} />

        <AnimatePresence initial={false}>
          {isCreating && (
            <motion.div
              key="workout-form"
              layout
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <WorkoutForm
                workoutName={workoutName}
                workoutDate={workoutDate}
                exercises={exercises}
                workoutNotes={workoutNotes}
                editingWorkoutId={editingWorkoutId}
                templates={templates}
                uniqueExercises={uniqueExercises}
                autocompleteExerciseId={autocompleteExerciseId}
                workouts={workouts}
                onWorkoutNameChange={onWorkoutNameChange}
                onWorkoutDateChange={onWorkoutDateChange}
                onWorkoutNotesChange={onWorkoutNotesChange}
                onExerciseNameChange={onExerciseNameChange}
                onSetFieldChange={onSetFieldChange}
                onReplaceExerciseSets={onReplaceExerciseSets}
                onAddExercise={onAddExercise}
                onRemoveExercise={onRemoveExercise}
                onMoveExerciseUp={onMoveExerciseUp}
                onMoveExerciseDown={onMoveExerciseDown}
                onAddSet={onAddSet}
                onRemoveSet={onRemoveSet}
                onAutocompleteFocus={onAutocompleteFocus}
                onAutocompleteBlur={onAutocompleteBlur}
                onApplyTemplate={onApplyTemplate}
                onSubmit={onSaveWorkout}
                onCancel={onCancelWorkout}
                isSubmitting={isSavingWorkout}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <section className="card">
          <div className="card-header">
            <h2>Saved Workouts</h2>
          </div>
          {sortedWorkouts.length === 0 ? (
            <p className="empty-state">No workouts saved yet. Click "New Workout" to start.</p>
          ) : (
            <div className="workout-list">
              <AnimatePresence initial={false}>
                {sortedWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onEdit={onEditWorkout}
                    onDelete={onDeleteWorkout}
                    isDeleting={deletingWorkoutId === workout.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
