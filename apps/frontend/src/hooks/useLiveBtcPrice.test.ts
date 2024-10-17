import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveBtcPrice } from './useLiveBtcPrice';

describe('useLiveBtcPrice', () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      onmessage: null,
      onerror: null,
      close: vi.fn(),
    };

    (global as any).WebSocket = vi.fn().mockImplementation(() => mockSocket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with null price', () => {
    const { result } = renderHook(() => useLiveBtcPrice());
    expect(result.current.price).toBeNull();
  });

  it('should update price when receiving WebSocket message', async () => {
    const { result } = renderHook(() => useLiveBtcPrice());

    // Simulate WebSocket message
    act(() => {
      if (mockSocket.onmessage) {
        mockSocket.onmessage({
          data: JSON.stringify({ k: { c: '30000.50' } }),
        });
      }
    });

    // Use a timeout to wait for the state update
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current.price).toBe(30000.5);
  });
  it('should handle WebSocket error', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    renderHook(() => useLiveBtcPrice());

    // Simulate WebSocket error
    act(() => {
      if (mockSocket.onerror) {
        mockSocket.onerror(new Error('WebSocket error'));
      }
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'WebSocket Error:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it('should close WebSocket connection on unmount', () => {
    const { unmount } = renderHook(() => useLiveBtcPrice());
    unmount();
    expect(mockSocket.close).toHaveBeenCalled();
  });
});
