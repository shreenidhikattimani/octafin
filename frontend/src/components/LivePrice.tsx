import React, { useEffect, useState, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface LivePriceProps {
  price: number;
  format: (val: number) => string;
}

export const LivePrice: React.FC<LivePriceProps> = ({ price, format }) => {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price > prevPrice.current) {
      setDirection('up');
    } else if (price < prevPrice.current) {
      setDirection('down');
    }

    const timer = setTimeout(() => setDirection(null), 1000);
    
    prevPrice.current = price;
    return () => clearTimeout(timer);
  }, [price]);

  return (
    <div className={`
      transition-colors duration-500 px-2 py-1 rounded
      ${direction === 'up' ? 'bg-emerald-100 text-emerald-800' : ''}
      ${direction === 'down' ? 'bg-red-100 text-red-800' : ''}
    `}>
      <span className="font-mono font-bold flex items-center gap-1">
        {format(price)}
        {direction === 'up' && <ArrowUp size={12} className="animate-bounce" />}
        {direction === 'down' && <ArrowDown size={12} className="animate-bounce" />}
      </span>
    </div>
  );
};