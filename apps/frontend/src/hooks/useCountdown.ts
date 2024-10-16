import { useState, useEffect } from 'react';

interface UseCountdownProps {
  isGuessing: boolean;
  startTime: number | null;
  waitTime: number;
}

export function useCountdown({
  isGuessing,
  startTime,
  waitTime,
}: UseCountdownProps) {
  const [countdown, setCountdown] = useState<number | null>(() =>
    isGuessing && startTime ? waitTime : null
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGuessing && startTime) {
      setCountdown(waitTime);
      interval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const remainingTime = Math.max(0, waitTime - Math.floor(elapsedTime));

        setCountdown(remainingTime);

        if (remainingTime <= 0) {
          clearInterval(interval);
        }
      }, 1000);
    } else {
      setCountdown(null);
    }
    return () => clearInterval(interval);
  }, [isGuessing, startTime, waitTime]);

  return { countdown };
}
