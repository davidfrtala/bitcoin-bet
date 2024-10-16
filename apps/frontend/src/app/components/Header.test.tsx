import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';

// Mock the hooks
vi.mock('@aws-amplify/ui-react');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('Header', () => {
  const mockUseAuthenticator = useAuthenticator as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockUseNavigate = useNavigate as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUseAuthenticator.mockReturnValue({
      user: null,
      authStatus: 'unauthenticated',
      signOut: vi.fn(),
    });
    mockUseNavigate.mockReturnValue(vi.fn());
  });

  it('renders the header title', () => {
    render(<Header />);
    expect(screen.getByText('BTC Price Predictor')).toBeDefined();
  });

  it('renders Sign In button when unauthenticated', () => {
    render(<Header />);
    expect(screen.getByText('Sign In')).toBeDefined();
  });

  it('renders Sign Out button and user email when authenticated', () => {
    mockUseAuthenticator.mockReturnValue({
      user: { signInDetails: { loginId: 'test@example.com' } },
      authStatus: 'authenticated',
      signOut: vi.fn(),
    });

    render(<Header />);
    expect(screen.getByText('test@example.com')).toBeDefined();
    expect(screen.getByText('Sign Out')).toBeDefined();
  });

  it('calls navigate when Sign In button is clicked', () => {
    const mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    render(<Header />);
    fireEvent.click(screen.getByText('Sign In'));

    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('calls signOut when Sign Out button is clicked', () => {
    const mockSignOut = vi.fn();
    mockUseAuthenticator.mockReturnValue({
      user: { signInDetails: { loginId: 'test@example.com' } },
      authStatus: 'authenticated',
      signOut: mockSignOut,
    });

    render(<Header />);
    fireEvent.click(screen.getByText('Sign Out'));

    expect(mockSignOut).toHaveBeenCalled();
  });
});
