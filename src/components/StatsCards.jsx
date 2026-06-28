export function StatsCards({ stats }) {
  return (
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
  );
}
