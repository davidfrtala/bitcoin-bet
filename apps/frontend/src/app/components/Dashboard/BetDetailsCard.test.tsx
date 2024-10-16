import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useCurrentBetQuery } from '../../../api/queries';
import { BetDetailsCard } from './BetDetailsCard';

vi.mock('@aws-amplify/ui-react');
vi.mock('../../../api/queries');

describe('BetDetailsCard', () => {
  const mockUseAuthenticator = useAuthenticator as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockUseCurrentBetQuery = useCurrentBetQuery as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    mockUseAuthenticator.mockReturnValue({ authStatus: 'authenticated' });
    mockUseCurrentBetQuery.mockReturnValue({ data: { currentBet: null } });
  });

  it('renders nothing when there is no current bet', () => {
    render(<BetDetailsCard />);
    expect(screen.queryByText('Last Bet Details')).toBeNull();
  });

  it('renders bet details when there is a current bet', () => {
    mockUseCurrentBetQuery.mockReturnValue({
      data: {
        currentBet: {
          startPrice: 50000,
          endPrice: 51000,
          priceDiff: 1000,
          result: 'WIN',
          guess: 'UP',
          betTimestamp: '1617235200000',
        },
      },
    });

    render(<BetDetailsCard />);

    expect(screen.getByText('Last Bet Details')).toBeDefined();
    expect(screen.getByText('Your bet:')).toBeDefined();
    expect(screen.getByText('Up ▲')).toBeDefined();
    expect(screen.getByText('Price Difference:')).toBeDefined();
    expect(screen.getByText('$1,000 ▲')).toBeDefined();
    expect(screen.getByText('Starting Price:')).toBeDefined();
    expect(screen.getByText('$50,000')).toBeDefined();
    expect(screen.getByText('Final Price:')).toBeDefined();
    expect(screen.getByText('$51,000')).toBeDefined();
    // expect(screen.getByText('You Won 🎉 the bet!')).toBeDefined();
  });
});
