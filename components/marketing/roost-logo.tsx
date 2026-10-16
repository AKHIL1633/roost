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
 * Text-based wordmark. Replaces the old raster logo (which had the previous
 * "Vibehouse" artwork baked into the PNG, so it couldn't just be re-colored
 * or re-pointed during the rebrand) with a typographic mark using the
 * brand's existing display font, so it carries the new name with no stale
 * artwork and no image asset dependency.
 */
export function RoostLogo({
  variant = "white",
  className,
  imageClassName,
  onClick,
}: RoostLogoProps) {
  const isRed = variant === "red";

  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2 select-none transition-transform duration-200 hover:scale-[1.02]",
        className
      )}
      aria-label={`${siteMeta.name} - ${siteMeta.tagline}`}
    >
      <span
        className={cn(
          "font-display text-xl sm:text-2xl font-black uppercase tracking-tight leading-none",
          isRed ? "text-[var(--vh-pink,#E8144C)]" : "text-white",
          imageClassName
        )}
      >
        {siteMeta.name}
      </span>
    </Link>
  );
}
