import React, { useEffect, useRef, useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  /** Set to zero to disable automatic scrolling. */
  scrollInterval?: number;
  scrollAmount?: number;
  itemClassName?: string;
  containerClassName?: string;
  navigationButtonClassName?: string;
  /** @deprecated Copies now depend on viewport width. Retained for compatibility. */
  loadMoreThreshold?: number;
}

export function Carousel<T>({
  items,
  renderItem,
  keyExtractor,
  scrollInterval = 3000,
  scrollAmount = 300,
  itemClassName = "",
  containerClassName = "",
  navigationButtonClassName = "",
}: CarouselProps<T>) {
  const containerRef = useRef<HTMLElement>(null);
  const cycleWidthRef = useRef(0);
  const wrapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copyCount, setCopyCount] = useState(3);

  // Keep one copy behind the viewport and enough copies ahead to fill it.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const firstCopy = container.firstElementChild as HTMLElement | null;
    const measure = () => {
      const nextCopy = firstCopy?.nextElementSibling as HTMLElement | null;
      const width = firstCopy && nextCopy ? nextCopy.offsetLeft - firstCopy.offsetLeft : 0;
      const previousWidth = cycleWidthRef.current;
      cycleWidthRef.current = width;
      if (width <= 0) return;
      setCopyCount(Math.max(3, Math.ceil(container.clientWidth / width) + 2));
      if (previousWidth !== width || container.scrollLeft < width) container.scrollLeft = width;
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(container);
    if (firstCopy) observer?.observe(firstCopy);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      if (wrapTimerRef.current !== null) clearTimeout(wrapTimerRef.current);
    };
  }, [items, itemClassName, containerClassName]);

  useEffect(() => {
    if (items.length === 0 || !Number.isFinite(scrollInterval) || scrollInterval <= 0) return;
    const timer = setInterval(() => {
      scrollByAmount(containerRef.current, cycleWidthRef.current, scrollAmount);
    }, scrollInterval);
    return () => clearInterval(timer);
  }, [items.length, scrollInterval, scrollAmount]);

  const wrapScroll = () => {
    const container = containerRef.current;
    const width = cycleWidthRef.current;
    if (!container || width <= 0) return;
    if (container.scrollLeft < width || container.scrollLeft >= width * 2) {
      const offset = ((container.scrollLeft - width) % width + width) % width;
      container.style.scrollBehavior = "auto";
      container.scrollLeft = width + offset;
      container.style.scrollBehavior = "";
    }
  };

  const scheduleWrap = () => {
    // Wait for smooth scrolling or touch momentum to finish before rebasing.
    if (wrapTimerRef.current !== null) clearTimeout(wrapTimerRef.current);
    wrapTimerRef.current = setTimeout(wrapScroll, 150);
  };

  return (
    <div className="infinite-scroll-carousel-body">
      <section
        ref={containerRef}
        onScroll={scheduleWrap}
        aria-label="Carousel"
        className={`infinite-scroll-carousel-container scroll-bar-hide ${containerClassName}`}
      >
        {items.length > 0 && Array.from({ length: copyCount }, (_, copyIndex) => (
          <div key={copyIndex} className="infinite-scroll-carousel-copy">
            {items.map((item, index) => (
              <div key={keyExtractor ? keyExtractor(item, index) : index} className={itemClassName}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        ))}
      </section>
      <button
        type="button"
        title="arrow left"
        aria-label="Scroll left"
        disabled={items.length === 0}
        className={`infinite-scroll-carousel-nav-button left-position ${navigationButtonClassName}`}
        onClick={() => scrollByAmount(containerRef.current, cycleWidthRef.current, -scrollAmount)}
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        title="arrow right"
        aria-label="Scroll right"
        disabled={items.length === 0}
        className={`infinite-scroll-carousel-nav-button right-position ${navigationButtonClassName}`}
        onClick={() => scrollByAmount(containerRef.current, cycleWidthRef.current, scrollAmount)}
      >
        <ChevronRight />
      </button>
    </div>
  );
}

function scrollByAmount(container: HTMLElement | null, cycleWidth: number, amount: number) {
  if (!container || !Number.isFinite(amount)) return;
  // A full cycle has identical content. Limit long steps to the available buffer.
  const left = cycleWidth > 0 && Math.abs(amount) > cycleWidth
    ? (amount % cycleWidth || Math.sign(amount) * cycleWidth)
    : amount;
  container.scrollBy({ left, behavior: "smooth" });
}
