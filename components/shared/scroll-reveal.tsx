"use client";

import { motion, type Variants } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  amount?: number;
  as?: "div" | "section" | "article" | "header" | "footer";
};

/**
 * Scroll-triggered reveal. `once: true` keeps the page calm after the first
 * pass. Reduced-motion users are handled in CSS (`[data-reveal]`) so the server
 * and client render the same markup; no media-query branch is needed here.
 */
export function ScrollReveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  amount = 0.2,
  as = "div",
}: ScrollRevealProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={cn(className)}
      data-reveal
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: "-80px" }}
      variants={variants}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}

type RevealGroupProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
};

export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
}: RevealGroupProps) {
  return (
    <motion.div
      className={className}
      data-reveal
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: "-60px" }}
      variants={staggerContainer(stagger, delayChildren)}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={className} variants={variants} data-reveal>
      {children}
    </motion.div>
  );
}
