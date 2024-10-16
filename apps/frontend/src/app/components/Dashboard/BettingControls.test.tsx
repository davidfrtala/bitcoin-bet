import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Guess } from '../../../api/queries';

import { BettingControls } from './BettingControls';

describe('BettingControls', () => {
  const mockOnWaitingPeriodChange = vi.fn();
  const mockOnMakeGuess = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders waiting period buttons', () => {
    render(
      <BettingControls
        waitingPeriod={5}
        onWaitingPeriodChange={mockOnWaitingPeriodChange}
        onMakeGuess={mockOnMakeGuess}
      />
    );

    expect(screen.getByText('5s')).toBeDefined();
    expect(screen.getByText('15s')).toBeDefined();
    expect(screen.getByText('30s')).toBeDefined();
    expect(screen.getByText('60s')).toBeDefined();
  });

  it('calls onWaitingPeriodChange when a waiting period button is clicked', () => {
    render(
      <BettingControls
        waitingPeriod={5}
        onWaitingPeriodChange={mockOnWaitingPeriodChange}
        onMakeGuess={mockOnMakeGuess}
      />
    );

    fireEvent.click(screen.getByText('15s'));
    expect(mockOnWaitingPeriodChange).toHaveBeenCalledWith(15);
  });

  it('calls onMakeGuess with UP when "Guess Up" button is clicked', () => {
    render(
      <BettingControls
        waitingPeriod={5}
        onWaitingPeriodChange={mockOnWaitingPeriodChange}
        onMakeGuess={mockOnMakeGuess}
      />
    );

    fireEvent.click(screen.getByText('Guess Up'));
    expect(mockOnMakeGuess).toHaveBeenCalledWith(Guess.UP);
  });

  it('calls onMakeGuess with DOWN when "Guess Down" button is clicked', () => {
    render(
      <BettingControls
        waitingPeriod={5}
        onWaitingPeriodChange={mockOnWaitingPeriodChange}
        onMakeGuess={mockOnMakeGuess}
      />
    );

    fireEvent.click(screen.getByText('Guess Down'));
    expect(mockOnMakeGuess).toHaveBeenCalledWith(Guess.DOWN);
  });
});
