import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Carousel } from '../src/components/Carousel';

describe('Carousel', () => {
  const mockItems = [
    { id: 1, title: 'Item 1' },
    { id: 2, title: 'Item 2' },
    { id: 3, title: 'Item 3' },
  ];

  it('renders all items', () => {
    render(
      <Carousel
        items={mockItems}
        renderItem={(item) => <div>{item.title}</div>}
      />
    );

    mockItems.forEach((item) => {
      expect(screen.getAllByText(item.title)).toHaveLength(3);
    });
  });

  it('renders navigation buttons', () => {
    render(
      <Carousel
        items={mockItems}
        renderItem={(item) => <div>{item.title}</div>}
      />
    );

    expect(screen.getByTitle('arrow left')).toBeInTheDocument();
    expect(screen.getByTitle('arrow right')).toBeInTheDocument();
  });

  it('scrolls only on timer ticks and cleans up the timer', () => {
    jest.useFakeTimers();
    const scroll = jest.spyOn(HTMLElement.prototype, 'scrollBy');
    const { unmount } = render(<Carousel items={mockItems} renderItem={item => item.title} />);
    expect(scroll).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(3000));
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll).toHaveBeenLastCalledWith({ left: 300, behavior: 'smooth' });
    act(() => jest.advanceTimersByTime(300000));
    expect(screen.getAllByText('Item 1')).toHaveLength(3);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
    scroll.mockRestore();
    jest.useRealTimers();
  });

  it('scrolls manually and accepts updated item props without duplicate keys', () => {
    const scroll = jest.spyOn(HTMLElement.prototype, 'scrollBy');
    const errors = jest.spyOn(console, 'error');
    const props = { renderItem: (item: { id: number; title: string }) => item.title, keyExtractor: (item: { id: number }) => item.id };
    const { rerender } = render(<Carousel {...props} items={mockItems} scrollInterval={0} scrollAmount={120} />);
    fireEvent.click(screen.getByRole('button', { name: 'Scroll left' }));
    expect(scroll).toHaveBeenLastCalledWith({ left: -120, behavior: 'smooth' });
    fireEvent.click(screen.getByRole('button', { name: 'Scroll right' }));
    expect(scroll).toHaveBeenLastCalledWith({ left: 120, behavior: 'smooth' });
    rerender(<Carousel {...props} items={[{ id: 4, title: 'Replacement' }]} scrollInterval={0} />);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    expect(screen.getAllByText('Replacement')).toHaveLength(3);
    expect(scroll).toHaveBeenCalledTimes(2);
    expect(errors).not.toHaveBeenCalled();
    scroll.mockRestore();
    errors.mockRestore();
  });

  it('handles empty items and disabled automatic scrolling', () => {
    jest.useFakeTimers();
    const { rerender } = render(<Carousel items={[]} renderItem={String} />);
    expect(screen.getByRole('button', { name: 'Scroll right' })).toBeDisabled();
    expect(jest.getTimerCount()).toBe(0);
    rerender(<Carousel items={[1]} renderItem={String} scrollInterval={0} />);
    expect(screen.getByRole('button', { name: 'Scroll right' })).toBeEnabled();
    expect(jest.getTimerCount()).toBe(0);
    rerender(<Carousel items={[]} renderItem={String} />);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('wraps actual scroll position in both directions and fills a wide viewport', () => {
    jest.useFakeTimers();
    const offset = jest.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
      return this.previousElementSibling ? 200 : 0;
    });
    const viewport = jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(900);
    try {
      render(<Carousel items={mockItems} renderItem={item => item.title} />);
      const container = screen.getByRole('region', { name: 'Carousel' });
      expect(screen.getAllByText('Item 1')).toHaveLength(7);
      expect(container.scrollLeft).toBe(200);
      container.scrollLeft = 450;
      fireEvent.scroll(container);
      expect(container.scrollLeft).toBe(450);
      act(() => jest.advanceTimersByTime(150));
      expect(container.scrollLeft).toBe(250);
      container.scrollLeft = 175;
      fireEvent.scroll(container);
      act(() => jest.advanceTimersByTime(150));
      expect(container.scrollLeft).toBe(375);
      const scroll = jest.spyOn(HTMLElement.prototype, 'scrollBy');
      fireEvent.click(screen.getByRole('button', { name: 'Scroll right' }));
      expect(scroll).toHaveBeenLastCalledWith({ left: 100, behavior: 'smooth' });
      scroll.mockRestore();
      expect(screen.getAllByText('Item 1')).toHaveLength(7);
    } finally {
      offset.mockRestore();
      viewport.mockRestore();
      jest.useRealTimers();
    }
  });

  it('updates copies when measured widths change and disconnects the observer', () => {
    const previousObserver = globalThis.ResizeObserver;
    let notify = () => {};
    const disconnect = jest.fn();
    globalThis.ResizeObserver = jest.fn(callback => {
      notify = () => callback([], {} as ResizeObserver);
      return { observe: jest.fn(), unobserve: jest.fn(), disconnect };
    }) as unknown as typeof ResizeObserver;
    let width = 200;
    const offset = jest.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
      return this.previousElementSibling ? width : 0;
    });
    const viewport = jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(900);
    try {
      const { unmount } = render(<Carousel items={mockItems} renderItem={item => item.title} />);
      expect(screen.getAllByText('Item 1')).toHaveLength(7);
      width = 600;
      act(notify);
      expect(screen.getAllByText('Item 1')).toHaveLength(4);
      expect(screen.getByRole('region', { name: 'Carousel' }).scrollLeft).toBe(600);
      unmount();
      expect(disconnect).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.ResizeObserver = previousObserver;
      offset.mockRestore();
      viewport.mockRestore();
    }
  });
});
