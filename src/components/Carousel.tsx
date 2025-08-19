import React from 'react';
import { useEffect, useState, useRef, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  scrollInterval?: number;
  scrollAmount?: number;
  itemClassName?: string;
  containerClassName?: string;
  navigationButtonClassName?: string;
  loadMoreThreshold?: number;
}

export function Carousel<T>({
  items,
  renderItem,
  scrollInterval = 3000,
  scrollAmount = 300,
  itemClassName = "",
  containerClassName = "",
  navigationButtonClassName = "",
  loadMoreThreshold = 5,
}: CarouselProps<T>) {
  const [displayItems, setDisplayItems] = useState([...items]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, scrollInterval);

    return () => {
      clearInterval(timer);
    };
  }, [scrollInterval]);

  useEffect(() => {
    if (currentIndex > 0 && currentIndex >= displayItems.length - loadMoreThreshold) {
      setDisplayItems((prevItems) => [...prevItems, ...items]);
    }

    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, [currentIndex, displayItems.length, items, scrollAmount, loadMoreThreshold]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const defaultContainerClass = "relative flex w-full overflow-x-scroll gap-4 scroll-smooth";
  const defaultNavigationButtonClass = "absolute top-1/2 -translate-y-1/2 rounded-full bg-gray-800 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed p-2";

  return (
    <div className="relative w-full">
      <section
        ref={scrollContainerRef}
        className={`${defaultContainerClass} ${containerClassName}`}
      >
        {displayItems.map((item, index) => (
          <div key={index} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </section>
      
      <button
        type="button"
        title="arrow left"
        className={`${defaultNavigationButtonClass} left-4 ${navigationButtonClassName}`}
        onClick={scrollLeft}
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        title="arrow right"
        className={`${defaultNavigationButtonClass} right-4 ${navigationButtonClassName}`}
        onClick={scrollRight}
      >
        <ChevronRight />
      </button>
    </div>
  );
}