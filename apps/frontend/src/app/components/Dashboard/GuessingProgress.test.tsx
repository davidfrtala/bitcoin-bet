import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Guess } from '../../../api/queries';

import { GuessingProgress } from './GuessingProgress';

describe('GuessingProgress', () => {
  it('renders correctly for an UP guess', () => {
    render(
      <GuessingProgress guess={Guess.UP} countdown={30} waitingPeriod={60} />
    );

    expect(screen.getByText('Your guess: Price will go up')).toBeDefined();
    expect(screen.getByText('Waiting for result...')).toBeDefined();
    expect(screen.getByText('30 seconds remaining')).toBeDefined();
  });

  it('renders correctly for a DOWN guess', () => {
    render(
      <GuessingProgress guess={Guess.DOWN} countdown={45} waitingPeriod={60} />
    );

    expect(screen.getByText('Your guess: Price will go down')).toBeDefined();
    expect(screen.getByText('Waiting for result...')).toBeDefined();
    expect(screen.getByText('45 seconds remaining')).toBeDefined();
  });
});
