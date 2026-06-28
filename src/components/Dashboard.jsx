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
  onViewChange,
  onNewWorkout,
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
  onSaveWorkout,
  onCancelWorkout,
  onEditWorkout,
  onDeleteWorkout,
  onClearAllData,
}) {
  return (
    <div className="page">
      <div className="container">
        <Header
          onViewChange={onViewChange}
          currentView="dashboard"
          isCreating={isCreating}
          onNewWorkout={onNewWorkout}
        />

        <StatsCards stats={stats} />

        {isCreating && (
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
          />
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
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onEdit={onEditWorkout}
                  onDelete={onDeleteWorkout}
                />
              ))}
            </div>
          )}
        </section>

        <section className="dev-tools">
          <button type="button" className="danger-button" onClick={onClearAllData}>
            Clear All Data
          </button>
        </section>
      </div>
    </div>
  );
}
