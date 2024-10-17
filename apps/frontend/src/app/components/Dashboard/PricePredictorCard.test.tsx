import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentBetQuery, usePlaceBetMutation } from '../../../api/queries';
import { useLiveBtcPrice } from '../../../hooks/useLiveBtcPrice';
import { useCountdown } from '../../../hooks/useCountdown';

import { PricePredictorCard } from './PricePredictorCard';

vi.mock('@aws-amplify/ui-react');
vi.mock('../../../api/queries');
vi.mock('../../../hooks/useLiveBtcPrice');
vi.mock('../../../hooks/useCountdown');
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: vi.fn(),
  };
});
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('PricePredictorCard', () => {
  const mockUseAuthenticator = useAuthenticator as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockUseCurrentBetQuery = useCurrentBetQuery as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockUsePlaceBetMutation = usePlaceBetMutation as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockUseLiveBtcPrice = useLiveBtcPrice as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockUseCountdown = useCountdown as unknown as ReturnType<typeof vi.fn>;
  const mockUseQueryClient = useQueryClient as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockUseNavigate = useNavigate as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUseAuthenticator.mockReturnValue({ authStatus: 'authenticated' });
    mockUseCurrentBetQuery.mockReturnValue({ data: { currentBet: null } });
    mockUsePlaceBetMutation.mockReturnValue({ mutate: vi.fn() });
    mockUseLiveBtcPrice.mockReturnValue({ price: 30000 });
    mockUseCountdown.mockReturnValue({ countdown: 0 });
    mockUseQueryClient.mockReturnValue({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    });
    mockUseNavigate.mockReturnValue(vi.fn());
  });

  it('renders the Bitcoin Price Predictor title', () => {
    render(<PricePredictorCard />);
    expect(screen.getByText('Bitcoin Price Predictor')).toBeDefined();
  });

  it('displays the current BTC price', () => {
    render(<PricePredictorCard />);
    expect(screen.getByText('$30,000')).toBeDefined();
  });

  it('renders BettingControls when authenticated and not guessing', () => {
    render(<PricePredictorCard />);
    expect(screen.getByText('Waiting Period')).toBeDefined();
    expect(screen.getByText('Guess Up')).toBeDefined();
    expect(screen.getByText('Guess Down')).toBeDefined();
  });

  it('renders SignInButton when not authenticated', () => {
    mockUseAuthenticator.mockReturnValue({ authStatus: 'unauthenticated' });
    render(<PricePredictorCard />);
    expect(screen.getByText('Sign In to Play')).toBeDefined();
  });
});
