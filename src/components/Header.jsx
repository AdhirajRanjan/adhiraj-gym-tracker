export function Header({ onViewChange, currentView, isCreating, onNewWorkout }) {
  return (
    <header className="header">
      <div>
        <h1>Venato</h1>
        <p>Track every workout. Progress with purpose.</p>
      </div>
      <div className="header-actions">
        <button
          type="button"
          className="ghost-button"
          onClick={() => onViewChange("templates")}
        >
          Templates
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onViewChange("history")}
        >
          Exercise History
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onViewChange("settings")}
        >
          Settings
        </button>
        {!isCreating && (
          <button className="primary-button" onClick={onNewWorkout}>
            New Workout
          </button>
        )}
      </div>
    </header>
  );
}
