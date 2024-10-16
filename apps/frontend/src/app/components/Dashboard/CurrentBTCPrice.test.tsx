import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrentBTCPrice } from './CurrentBTCPrice';

describe('CurrentBTCPrice', () => {
  it('renders the current BTC price', () => {
    render(<CurrentBTCPrice />);

    expect(screen.getByText('Current BTC Price')).toBeDefined();
    expect(screen.getByText('$61,726.21')).toBeDefined();
  });
});
