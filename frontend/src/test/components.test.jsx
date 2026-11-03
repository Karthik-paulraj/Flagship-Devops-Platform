import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingStars } from '../components/RatingStars';
import { EmptyState } from '../components/EmptyState';
import { BrowserRouter } from 'react-router-dom';

describe('Frontend Key Components', () => {
  it('renders RatingStars with correct count', () => {
    render(<RatingStars rating={4.5} numReviews={18} />);
    expect(screen.getByText('(18)')).toBeInTheDocument();
  });

  it('renders EmptyState with custom title, message and action', () => {
    render(
      <BrowserRouter>
        <EmptyState
          title="Custom Empty Title"
          message="Custom empty message content"
          actionLabel="Go Somewhere"
          actionLink="/products"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Custom Empty Title')).toBeInTheDocument();
    expect(screen.getByText('Custom empty message content')).toBeInTheDocument();
    expect(screen.getByText('Go Somewhere')).toBeInTheDocument();
  });
});
