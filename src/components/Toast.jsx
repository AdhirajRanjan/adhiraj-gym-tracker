import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function Toast({ toast }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.tone}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="toast-dot" aria-hidden="true" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
