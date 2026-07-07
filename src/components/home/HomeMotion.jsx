import { motion } from "framer-motion";

export const ease = [0.25, 0.1, 0.25, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.12, ease },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.14,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.98, ease },
  },
};

export function FadeUpSection({ children, className = "", delay = 0 }) {
  return (
    <section className={className}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
        variants={{
          hidden: fadeUp.hidden,
          visible: {
            ...fadeUp.visible,
            transition: {
              ...fadeUp.visible.transition,
              delay,
            },
          },
        }}
      >
        {children}
      </motion.div>
    </section>
  );
}

export function StaggerGrid({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -40px 0px" }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
