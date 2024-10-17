import { useState, useEffect } from 'react';

export const useLiveBtcPrice = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(
      'wss://stream.binance.com:9443/ws/btcusdt@kline_1s'
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data?.k?.c) {
        setPrice(parseFloat(data.k.c));
        setError(null);
      }
    };

    socket.onerror = (event) => {
      console.error('WebSocket Error:', event);
      setError('Failed to connect to price feed');
    };

    socket.onclose = () => {
      setError('Connection to price feed closed');
    };

    return () => {
      socket.close();
    };
  }, []);

  return { price, error };
};
