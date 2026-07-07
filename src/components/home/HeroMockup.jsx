export function HeroMockup() {
  return (
    <div className="home-preview-frame">
      <div className="home-preview-toolbar" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="home-preview-screenshot">
        <div className="home-preview-header">
          <div>
            <p className="home-preview-kicker">Dashboard</p>
            <h2>Push A</h2>
          </div>
          <span>Today</span>
        </div>
        <div className="home-preview-grid">
          <article>
            <span>Last Performance</span>
            <strong>Bench Press</strong>
            <p>60kg x 8 · 60kg x 7 · 60kg x 6</p>
          </article>
          <article className="home-preview-highlight">
            <span>Suggested Next Session</span>
            <strong>60kg x 9</strong>
            <p>Progress one set at a time.</p>
          </article>
          <article>
            <span>Template</span>
            <strong>Push A</strong>
            <p>Bench Press · Shoulder Press · Triceps Pushdown</p>
          </article>
        </div>
        <div className="home-preview-table">
          <div>
            <span>Exercise</span>
            <span>Weight</span>
            <span>Reps</span>
          </div>
          <div>
            <strong>Bench Press</strong>
            <span>60 kg</span>
            <span>9</span>
          </div>
          <div>
            <strong>Shoulder Press</strong>
            <span>30 kg</span>
            <span>8</span>
          </div>
          <div>
            <strong>Lat Raise</strong>
            <span>10 kg</span>
            <span>12</span>
          </div>
        </div>
      </div>
    </div>
  );
}
