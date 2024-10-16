import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { usePlayerQuery } from '../../../api/queries';

import { ScoreCard } from './ScoreCard';

vi.mock('@aws-amplify/ui-react');
vi.mock('../../../api/queries');

describe('ScoreCard', () => {
  const mockUseAuthenticator = useAuthenticator as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockUsePlayerQuery = usePlayerQuery as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    mockUseAuthenticator.mockReturnValue({ authStatus: 'authenticated' });
    mockUsePlayerQuery.mockReturnValue({ data: { player: { score: 0 } } });
  });

  it('renders the score card title', () => {
    render(<ScoreCard />);
    expect(screen.getByText('Your Score')).toBeDefined();
  });

  it('displays the player score when authenticated', () => {
    mockUsePlayerQuery.mockReturnValue({ data: { player: { score: 100 } } });
    render(<ScoreCard />);
    expect(screen.getByText('100')).toBeDefined();
  });

  it('displays N/A when not authenticated', () => {
    mockUseAuthenticator.mockReturnValue({ authStatus: 'unauthenticated' });
    render(<ScoreCard />);
    expect(screen.getByText('N/A')).toBeDefined();
  });

  it('applies correct color class for positive score', () => {
    mockUsePlayerQuery.mockReturnValue({ data: { player: { score: 100 } } });
    render(<ScoreCard />);
    expect(screen.getByText('100').className).toContain('text-green-400');
  });

  it('applies correct color class for negative score', () => {
    mockUsePlayerQuery.mockReturnValue({ data: { player: { score: -50 } } });
    render(<ScoreCard />);
    expect(screen.getByText('-50').className).toContain('text-red-400');
  });

  it('applies correct color class for zero score', () => {
    mockUsePlayerQuery.mockReturnValue({ data: { player: { score: 0 } } });
    render(<ScoreCard />);
    expect(screen.getByText('0').className).toContain('text-gray-300');
  });
});
