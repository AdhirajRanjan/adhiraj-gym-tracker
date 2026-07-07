import { motion } from "framer-motion";
import { HeroMockup } from "../components/home/HeroMockup.jsx";
import {
  FadeUpSection,
  StaggerGrid,
  StaggerItem,
} from "../components/home/HomeMotion.jsx";

const githubUrl = "https://github.com/AdhirajRanjan/adhiraj-gym-tracker";

const principles = [
  {
    title: "Remember",
    copy: "Every workout starts where the last one ended.",
  },
  {
    title: "Progress",
    copy: "Small improvements compound over time.",
  },
  {
    title: "Grow",
    copy: "Consistency creates long-term progress.",
  },
];

const roadmapColumns = [
  {
    label: "Today",
    items: ["Workout Tracking", "Templates", "Cloud Sync"],
  },
  {
    label: "Next",
    items: ["Analytics", "Smarter Progression", "Better Insights"],
  },
  {
    label: "Future",
    items: ["AI Coaching", "Adaptive Programming", "Recovery Intelligence"],
  },
];

const technologies = [
  "React",
  "Supabase",
  "Google Authentication",
  "Cloud Sync",
  "Responsive Design",
  "Progressive Overload Engine",
];

const ease = [0.25, 0.1, 0.25, 1];

function HomeNav() {
  return (
    <nav className="home-nav" aria-label="Homepage navigation">
      <a className="home-brand" href="/" aria-label="Venato home">
        <img className="home-logo-mark" src="/venato-mark.svg" alt="" aria-hidden="true" />
        <span>Venato</span>
      </a>
      <div className="home-nav-actions">
        <a className="home-link-button" href={githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="home-primary-button" href="/app">
          Launch App
        </a>
      </div>
    </nav>
  );
}

function MobileShowcaseMockup() {
  return (
    <div className="home-showcase-mobile-frame">
      <div className="home-showcase-mobile-notch" aria-hidden="true" />
      <div className="home-showcase-mobile-screen">
        <p className="home-preview-kicker">Today</p>
        <h3>Push A</h3>
        <div className="home-showcase-mobile-card">
          <span>Last Performance</span>
          <strong>Bench Press</strong>
          <p>60kg x 8 · 60kg x 7</p>
        </div>
        <div className="home-showcase-mobile-card home-showcase-mobile-card-accent">
          <span>Suggested Next</span>
          <strong>60kg x 9</strong>
        </div>
        <div className="home-showcase-mobile-row">
          <span>Shoulder Press</span>
          <span>30 kg</span>
        </div>
        <div className="home-showcase-mobile-row">
          <span>Lat Raise</span>
          <span>10 kg</span>
        </div>
      </div>
    </div>
  );
}

function DesktopShowcaseMockup() {
  return (
    <div className="home-showcase-desktop-frame">
      <div className="home-preview-toolbar" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="home-showcase-desktop-screen">
        <div className="home-showcase-desktop-sidebar">
          <span className="home-showcase-sidebar-label">Venato</span>
          <span className="home-showcase-sidebar-item home-showcase-sidebar-item-active">
            Dashboard
          </span>
          <span className="home-showcase-sidebar-item">Templates</span>
          <span className="home-showcase-sidebar-item">History</span>
        </div>
        <div className="home-showcase-desktop-main">
          <div className="home-showcase-desktop-header">
            <div>
              <p className="home-preview-kicker">Workout</p>
              <h3>Push A</h3>
            </div>
            <span>Jun 2</span>
          </div>
          <div className="home-showcase-desktop-cards">
            <article>
              <span>Last Performance</span>
              <strong>Bench Press</strong>
              <p>60kg x 8 · 60kg x 7 · 60kg x 6</p>
            </article>
            <article className="home-preview-highlight">
              <span>Suggested Next Session</span>
              <strong>60kg x 9</strong>
              <p>One set at a time.</p>
            </article>
          </div>
          <div className="home-showcase-desktop-table">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <HomeNav />

        <motion.div
          className="home-hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.15, ease }}
        >
          <img className="home-logo-large" src="/venato-mark.svg" alt="" aria-hidden="true" />
          <h1>Venato</h1>
          <p className="home-subtitle">Remember your last workout. Train smarter.</p>
          <p className="home-origin-line">
            Inspired by the Latin word &apos;venator&apos;, meaning one who tracks.
          </p>
          <div className="home-actions">
            <a className="home-primary-button home-primary-button-large" href="/app">
              Launch App
            </a>
            <a
              className="home-secondary-button"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </motion.div>
      </section>

      <FadeUpSection className="home-preview-section" delay={0.08}>
        <HeroMockup />
      </FadeUpSection>

      <FadeUpSection className="home-section home-statement">
        <div className="home-statement-copy">
          <p className="home-statement-lead">
            Knowing what you lifted yesterday is useful.
          </p>
          <p className="home-statement-lead home-statement-lead-accent">
            Knowing what to lift next is better.
          </p>
          <p className="home-statement-body">
            Venato remembers every workout so every session begins with context instead of
            guesswork. Your last sets, your next targets, and the progression between them — all
            in one calm place.
          </p>
        </div>
      </FadeUpSection>

      <FadeUpSection className="home-section home-why">
        <div className="home-section-heading home-section-heading-centered">
          <h2 id="home-why-title">Why Venato?</h2>
          <p className="home-why-lead">
            Most workout apps tell you what you&apos;ve done.
          </p>
          <p className="home-why-lead home-why-lead-accent">
            Venato is being built to help you decide what&apos;s next.
          </p>
          <p className="home-why-body">
            Progress in the gym is rarely about logging more data. It is about turning what you
            already know into a clear next step — session after session.
          </p>
        </div>
      </FadeUpSection>

      <section className="home-section home-principles" aria-label="Product principles">
        <StaggerGrid className="home-principle-grid">
          {principles.map((principle) => (
            <StaggerItem key={principle.title}>
              <article className="home-principle-card">
                <h3>{principle.title}</h3>
                <p>{principle.copy}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      <FadeUpSection className="home-section home-showcase">
        <div className="home-showcase-layout">
          <div className="home-showcase-copy">
            <p className="home-showcase-kicker">Product</p>
            <h2>Designed for focus.</h2>
            <p>
              A quiet interface for the moments that matter — logging sets, reviewing history,
              and moving forward with intention.
            </p>
          </div>
          <div className="home-showcase-devices">
            <div className="home-showcase-desktop-wrap">
              <DesktopShowcaseMockup />
            </div>
            <div className="home-showcase-mobile-wrap">
              <MobileShowcaseMockup />
            </div>
          </div>
        </div>
      </FadeUpSection>

      <FadeUpSection className="home-section home-roadmap-next" aria-labelledby="home-whats-next">
        <div className="home-section-heading home-section-heading-centered">
          <h2 id="home-whats-next">What&apos;s Next</h2>
        </div>
        <StaggerGrid className="home-roadmap-columns">
          {roadmapColumns.map((column) => (
            <StaggerItem key={column.label}>
              <article className="home-roadmap-column">
                <h3>{column.label}</h3>
                <ul>
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </FadeUpSection>

      <FadeUpSection className="home-section home-tech">
        <div className="home-tech-inner">
          {technologies.map((tech) => (
            <span key={tech} className="home-tech-pill">
              {tech}
            </span>
          ))}
        </div>
      </FadeUpSection>

      <FadeUpSection className="home-footer home-footer-minimal">
        <p className="home-footer-label">Built independently by</p>
        <p className="home-footer-name">Adhiraj Ranjan</p>
      </FadeUpSection>
    </main>
  );
}
