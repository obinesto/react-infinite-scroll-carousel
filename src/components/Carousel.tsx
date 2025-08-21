import React from 'react';
import { useEffect, useState, useRef, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
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
  keyExtractor,
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

  return (
    <div className="infinite-scroll-carousel-body">
      <section
        ref={scrollContainerRef}
        className={`infinite-scroll-carousel-container scroll-bar-hide ${containerClassName}`}
      >
        {displayItems.map((item, index) => (
          <div key={keyExtractor ? keyExtractor(item, index) : index} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </section>
      
      <button
        type="button"
        title="arrow left"
        className={`infinite-scroll-carousel-nav-button left-position ${navigationButtonClassName}`}
        onClick={scrollLeft}
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        title="arrow right"
        className={`infinite-scroll-carousel-nav-button right-position ${navigationButtonClassName}`}
        onClick={scrollRight}
      >
        <ChevronRight />
      </button>
    </div>
  );
}