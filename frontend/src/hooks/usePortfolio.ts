import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { PortfolioResponse } from '../types';

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');

export const usePortfolio = () => {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      setError('');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error(err);
      setError('Real-time connection failed');
      setIsConnected(false);
    });

    socket.on('portfolio_update', (newData: PortfolioResponse) => {
      setData(newData);
      setLoading(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('portfolio_update');
    };
  }, []);

  const refresh = () => {
    setLoading(true);
    socket.connect();
  };

  return { data, loading, error, isConnected, refresh };
};
