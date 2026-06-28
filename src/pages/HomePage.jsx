const availableFeatures = [
  "Workout Templates",
  "Progressive Overload Suggestions",
  "Previous Performance",
  "Exercise History",
  "Workout Notes",
  "Workout Editing",
  "Exercise Reordering",
];

const comingNext = ["Cloud Sync", "Google Authentication", "AI Training Coach"];
const githubUrl = "https://github.com/AdhirajRanjan/adhiraj-gym-tracker";

export function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <nav className="home-nav" aria-label="Homepage navigation">
          <a className="home-brand" href="/" aria-label="Venato home">
            <img className="home-logo-mark" src="/venato-mark.svg" alt="" aria-hidden="true" />
            <span>Venato</span>
          </a>
          <div className="home-nav-actions">
            <a
              className="home-link-button"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a className="home-primary-button" href="/app">
              Launch App
            </a>
          </div>
        </nav>

        <div className="home-hero-content">
          <img className="home-logo-large" src="/venato-mark.svg" alt="" aria-hidden="true" />
          <p className="home-origin">Venato — derived from the Latin word for tracker.</p>
          <h1>Venato</h1>
          <p className="home-subtitle">
            A modern workout tracker built around progressive overload.
          </p>
          <p className="home-supporting">Remember your last workout. Train smarter.</p>
          <div className="home-actions">
            <a className="home-primary-button home-primary-button-large" href="/app">
              <span>Launch App</span>
              <span aria-hidden="true"> →</span>
            </a>
            <a
              className="home-secondary-button"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>View GitHub</span>
            </a>
          </div>
          <p className="home-status"><span aria-hidden="true"></span>Currently in active development.</p>
        </div>
      </section>

      <section className="home-preview-section" aria-label="Venato product preview">
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
      </section>

      <section className="home-section home-features" aria-labelledby="home-features-title">
        <div className="home-section-heading">
          <p>Why Venato</p>
          <h2 id="home-features-title">Built for the next set.</h2>
        </div>
        <div className="home-feature-grid">
          <article className="home-feature-card">
            <span className="home-feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 16L9 11L13 15L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 8H20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <h3>Progressive Overload</h3>
              <p>See what to do next from your previous performance, without memory work.</p>
            </div>
          </article>
          <article className="home-feature-card">
            <span className="home-feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="4" y="5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                <rect x="4" y="15" width="6" height="4" rx="1.2" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="15" width="6" height="4" rx="1.2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <div>
              <h3>Workout Templates</h3>
              <p>Reuse the routines you repeat and start logging with less setup.</p>
            </div>
          </article>
          <article className="home-feature-card">
            <span className="home-feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <h3>Exercise History</h3>
              <p>Review logged sets, personal records, and exercise-level progress.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="home-section home-roadmap" aria-labelledby="home-roadmap-title">
        <div className="home-section-heading">
          <p>Roadmap</p>
          <h2 id="home-roadmap-title">Simple now. Smarter next.</h2>
        </div>
        <div className="home-roadmap-grid">
          <article className="home-roadmap-card">
            <h3>Available Today</h3>
            <ul>
              {availableFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
          <article className="home-roadmap-card home-roadmap-card-muted">
            <h3>Coming Next</h3>
            <ul>
              {comingNext.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <footer className="home-footer">
        <p>Built independently by Adhiraj Ranjan.</p>
        <img src="/venato-mark.svg" alt="" aria-hidden="true" />
        <p>
          Venato is an active side project focused on building a smarter workout
          tracking experience.
        </p>
      </footer>
    </main>
  );
}
