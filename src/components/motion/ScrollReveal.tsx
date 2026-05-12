import { memo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const easeOut = [0.22, 1, 0.36, 1] as const;

const viewport = {
  once: true,
  amount: 0.12,
  margin: '0px 0px -40px 0px',
} as const;

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Retraso en segundos (p. ej. para escalonar hijos). */
  delay?: number;
};

/**
 * Entrada al entrar en vista: solo opacity + translateY (composición en GPU).
 * `viewport.once` evita trabajo continuo al hacer scroll después de revelar.
 */
export const ScrollReveal = memo(function ScrollReveal({
  children,
  className,
  delay = 0,
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{
        duration: 0.42,
        delay,
        ease: easeOut,
      }}
    >
      {children}
    </motion.div>
  );
});
