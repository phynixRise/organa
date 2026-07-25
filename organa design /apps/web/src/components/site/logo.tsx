import * as React from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
};

/**
 * Organa brand logo.
 * A puzzle-piece circle split into four interlocking quadrants —
 * the left half in dark teal ("Or"), the right half in bright cyan ("gana").
 * Represents one core connecting many business verticals.
 */
export function BrandLogo({
  size = 36,
  withWordmark = true,
  className,
  iconClassName,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 select-none",
        className,
      )}
    >
      <BrandMark
        size={size}
        className={iconClassName}
      />
      {withWordmark && (
        <span
          className={cn(
            "font-display font-extrabold tracking-tight leading-none",
            "text-[1.35rem]",
            wordmarkClassName,
          )}
          style={{ color: "var(--brand-teal)" }}
        >
          Or
          <span style={{ color: "var(--brand-cyan)" }}>gana</span>
        </span>
      )}
    </span>
  );
}

export function BrandMark({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Organa"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="organa-teal" x1="0" y1="0" x2="24" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#007985" />
          <stop offset="1" stopColor="#005f6b" />
        </linearGradient>
        <linearGradient id="organa-cyan" x1="24" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00b4d8" />
          <stop offset="1" stopColor="#0095b8" />
        </linearGradient>
      </defs>

      {/* outer rounded square container */}
      <rect x="0" y="0" width="48" height="48" rx="12" fill="url(#organa-teal)" />

      {/* right half overlay (cyan) */}
      <path
        d="M24 0h12a12 12 0 0 1 12 12v24a12 12 0 0 1-12 12H24V0Z"
        fill="url(#organa-cyan)"
      />

      {/* puzzle dividers — vertical with notch */}
      <path
        d="M24 0v18.5c-1.4-1.6-3.9-1.6-5.3 0-1.4 1.6-1.4 4.2 0 5.8 1.4 1.6 3.9 1.6 5.3 0V48"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.96"
      />
      {/* horizontal divider */}
      <path
        d="M0 24h18.5c-1.6-1.4-1.6-3.9 0-5.3 1.6-1.4 4.2-1.4 5.8 0 1.6 1.4 1.6 3.9 0 5.3H48"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.96"
      />

      {/* subtle inner highlight */}
      <circle cx="14" cy="14" r="1.6" fill="white" opacity="0.55" />
      <circle cx="34" cy="34" r="1.6" fill="white" opacity="0.45" />
    </svg>
  );
}
