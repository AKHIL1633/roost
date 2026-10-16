"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteMeta } from "@/content/site";

interface RoostLogoProps {
  variant?: "white" | "red";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  onClick?: () => void;
}

/**
 * Icon mark + wordmark lockup (replacing the plain-text-only version). The
 * icon is a simple roof/perch glyph in an SVG badge — drawn as code, not a
 * raster asset, so it re-colors with the theme and needs no image file.
 */
export function RoostLogo({
  variant = "white",
  className,
  imageClassName,
  onClick,
}: RoostLogoProps) {
  const isRed = variant === "red";
  const textColorClass = isRed ? "text-[var(--vh-pink,#E8144C)]" : "text-white";

  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2.5 select-none transition-transform duration-200 hover:scale-[1.02]",
        className
      )}
      aria-label={`${siteMeta.name} - ${siteMeta.tagline}`}
    >
      <span
        className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-[9px] bg-[var(--vh-pink)] shadow-[0_4px_14px_rgba(242,101,10,0.45)]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none">
          {/* Roof / perch glyph: a simple apex over a horizon line, evoking
              nesting under a roof. */}
          <path
            d="M4 13.5 12 5l8 8.5"
            stroke="#07070A"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 12.5V19h10v-6.5"
            stroke="#07070A"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="15.6" r="1.4" fill="#07070A" />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-xl sm:text-2xl font-black uppercase tracking-tight leading-none",
          textColorClass,
          imageClassName
        )}
      >
        {siteMeta.name}
      </span>
    </Link>
  );
}
