import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrentBTCPrice } from './CurrentBTCPrice';
import * as useLiveBtcPriceModule from '../../../hooks/useLiveBtcPrice';

describe('CurrentBTCPrice', () => {
  it('renders the current BTC price', () => {
    // Mock the useLiveBtcPrice hook
    vi.spyOn(useLiveBtcPriceModule, 'useLiveBtcPrice').mockReturnValue({
      price: 61726.21,
      error: null,
    });

    render(<CurrentBTCPrice />);

    expect(screen.getByText('Current BTC Price')).toBeDefined();
    expect(screen.getByText('$61,726.21')).toBeDefined();
  });

  it('renders loading state when price is null', () => {
    // Mock the useLiveBtcPrice hook with null price
    vi.spyOn(useLiveBtcPriceModule, 'useLiveBtcPrice').mockReturnValue({
      price: null,
      error: null,
    });

    render(<CurrentBTCPrice />);

    expect(screen.getByText('Current BTC Price')).toBeDefined();
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('renders error message when there is an error', () => {
    // Mock the useLiveBtcPrice hook with error
    vi.spyOn(useLiveBtcPriceModule, 'useLiveBtcPrice').mockReturnValue({
      price: null,
      error: 'Failed to connect to price feed',
    });

    render(<CurrentBTCPrice />);

    expect(screen.getByText('Current BTC Price')).toBeDefined();
    expect(screen.getByText('Failed to connect to price feed')).toBeDefined();
  });
});
