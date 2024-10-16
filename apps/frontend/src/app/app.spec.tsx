import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './app';
import { useAuthenticator, UseAuthenticator } from '@aws-amplify/ui-react';

// Mock the useAuthenticator hook
vi.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: vi.fn(),
}));

// Mock the components
vi.mock('./components/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard</div>,
}));
vi.mock('./components/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));
vi.mock('./components/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
  Content: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content">{children}</div>
  ),
}));
vi.mock('./components/Auth', () => ({
  Auth: () => <div data-testid="auth">Auth</div>,
}));

describe('App', () => {
  it('renders the layout with header', () => {
    vi.mocked(useAuthenticator).mockReturnValue({
      authStatus: 'authenticated',
    } as UseAuthenticator);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('layout')).toBeDefined();
    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('content')).toBeDefined();
  });

  it('renders the dashboard when authenticated', () => {
    vi.mocked(useAuthenticator).mockReturnValue({
      authStatus: 'authenticated',
    } as UseAuthenticator);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('dashboard')).toBeDefined();
  });

  it('renders the auth component when unauthenticated and on /auth route', () => {
    vi.mocked(useAuthenticator).mockReturnValue({
      authStatus: 'unauthenticated',
    } as UseAuthenticator);

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('auth')).toBeDefined();
  });

  it('redirects to home when authenticated and on /auth route', () => {
    vi.mocked(useAuthenticator).mockReturnValue({
      authStatus: 'authenticated',
    } as UseAuthenticator);

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('dashboard')).toBeDefined();
    expect(screen.queryByTestId('auth')).toBeNull();
  });
});
