import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useState } from "react";

function AnimatedStatValue({ value }) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const [displayValue, setDisplayValue] = useState(value);

  useMotionValueEvent(motionValue, "change", (latest) => {
    setDisplayValue(Math.round(latest));
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      motionValue.set(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => controls.stop();
  }, [motionValue, shouldReduceMotion, value]);

  return <p className="stat-value">{displayValue}</p>;
}

export function StatsCards({ stats }) {
  return (
    <section className="stats-section">
      <div className="stats-grid">
        <div className="stat-card">
          <AnimatedStatValue value={stats.totalWorkouts} />
          <p className="stat-label">Total Workouts</p>
        </div>
        <div className="stat-card">
          <AnimatedStatValue value={stats.totalExercises} />
          <p className="stat-label">Total Exercises Trained</p>
        </div>
        <div className="stat-card">
          <AnimatedStatValue value={stats.totalTemplates} />
          <p className="stat-label">Total Templates</p>
        </div>
      </div>
    </section>
  );
}
