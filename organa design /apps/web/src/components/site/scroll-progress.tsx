"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A thin gradient progress bar pinned under the fixed header.
 * Reflects how far the user has scrolled down the page.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand-teal via-brand-cyan to-brand-teal"
      aria-hidden
    />
  );
}
