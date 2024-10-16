import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return null countdown when not guessing', () => {
    const { result } = renderHook(() =>
      useCountdown({ isGuessing: false, startTime: null, waitTime: 10 })
    );

    expect(result.current.countdown).toBe(null);
  });

  it('should return correct countdown when guessing', () => {
    const startTime = Date.now();
    const waitTime = 10;

    const { result } = renderHook(() =>
      useCountdown({ isGuessing: true, startTime, waitTime })
    );

    // Initial state
    expect(result.current.countdown).toBe(10);

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.countdown).toBe(5);
  });

  it('should return 0 when countdown reaches 0', () => {
    const startTime = Date.now();
    const waitTime = 5;

    const { result } = renderHook(() =>
      useCountdown({ isGuessing: true, startTime, waitTime })
    );

    // Wait for the countdown to reach 0
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.countdown).toBe(0);

    // Ensure it stays at 0
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.countdown).toBe(0);
  });

  it('should update countdown when props change', () => {
    const startTime = Date.now();
    const waitTime = 10;

    const { result, rerender } = renderHook(
      ({ isGuessing, startTime, waitTime }) =>
        useCountdown({ isGuessing, startTime, waitTime }),
      {
        initialProps: { isGuessing: true, startTime, waitTime },
      }
    );

    expect(result.current.countdown).toBe(10);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.countdown).toBe(5);

    const newStartTime = Date.now();
    rerender({ isGuessing: true, startTime: newStartTime, waitTime: 15 });

    expect(result.current.countdown).toBe(15);
  });

  it('should clear interval when component unmounts', () => {
    const startTime = Date.now();
    const waitTime = 10;

    const { unmount } = renderHook(() =>
      useCountdown({ isGuessing: true, startTime, waitTime })
    );

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
