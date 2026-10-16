"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { cn } from "@/lib/utils";

export type LightboxImage = {
  src: string;
  alt: string;
};

type PhotoLightboxProps = {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

/**
 * Full-screen photo viewer: click any gallery tile to open the image large,
 * with prev/next navigation, a thumbnail strip, and keyboard support
 * (Escape / arrow keys). Built as a lightweight standalone component rather
 * than pulling in a Dialog dependency, since none exists in the codebase yet.
 */
export function PhotoLightbox({ images, index, onIndexChange, onClose }: PhotoLightboxProps) {
  const total = images.length;
  const safeIndex = ((index % total) + total) % total;
  const active = images[safeIndex];

  const goPrev = useCallback(() => onIndexChange(safeIndex - 1), [onIndexChange, safeIndex]);
  const goNext = useCallback(() => onIndexChange(safeIndex + 1), [onIndexChange, safeIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [goPrev, goNext, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      aria-label="Photo gallery"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <p className="font-body text-xs font-bold uppercase tracking-[0.14em] text-white/60">
          {safeIndex + 1} / {total}
        </p>
        <button
          aria-label="Close gallery"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2 md:px-16">
        {total > 1 ? (
          <button
            aria-label="Previous photo"
            className="absolute left-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 md:left-6"
            onClick={goPrev}
            type="button"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : null}

        <div className="relative h-full max-h-[70vh] w-full max-w-5xl overflow-hidden rounded-[14px]">
          <ImageWithFallback alt={active.alt} className="h-full w-full object-contain" src={active.src} />
        </div>

        {total > 1 ? (
          <button
            aria-label="Next photo"
            className="absolute right-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 md:right-6"
            onClick={goNext}
            type="button"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="flex items-center justify-center gap-2 overflow-x-auto px-4 pb-6 pt-2 md:px-8">
          {images.map((image, i) => (
            <button
              aria-current={i === safeIndex}
              aria-label={`View photo ${i + 1}`}
              className={cn(
                "h-12 w-16 shrink-0 overflow-hidden rounded-[8px] border-2 transition",
                i === safeIndex ? "border-[var(--vh-pink)] opacity-100" : "border-transparent opacity-50 hover:opacity-80",
              )}
              key={image.src}
              onClick={() => onIndexChange(i)}
              type="button"
            >
              <ImageWithFallback alt="" className="h-full w-full object-cover" src={image.src} />
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
