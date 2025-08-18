import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Carousel } from './Carousel';

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
      expect(screen.getByText(item.title)).toBeInTheDocument();
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
});