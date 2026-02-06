'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Layers, 
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const LivePrice = ({ price, format }: { price: number, format: (v: number) => string }) => {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price > prevPrice.current) {
      setDirection('up');
    } else if (price < prevPrice.current) {
      setDirection('down');
    }

    const timer = setTimeout(() => setDirection(null), 1500); 
    prevPrice.current = price;
    return () => clearTimeout(timer);
  }, [price]);

  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 rounded transition-colors duration-300
      ${direction === 'up' ? 'bg-emerald-100 text-emerald-800' : 'text-black'}
      ${direction === 'down' ? 'bg-rose-100 text-rose-800' : 'text-black'}
    `}>
      <span className="font-mono text-sm">{format(price)}</span>
      {direction === 'up' && <ArrowUp size={12} className="animate-bounce text-emerald-600" />}
      {direction === 'down' && <ArrowDown size={12} className="animate-bounce text-rose-600" />}
    </div>
  );
};

export default function Dashboard() {
  const { data, error, refresh } = usePortfolio();

  const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(val);

  if (!data && !error) return null;

  if (error) return (
    <div className="flex h-screen w-full items-center justify-center bg-white p-6">
      <div className="border-2 border-black p-8 max-w-md text-center">
        <AlertTriangle className="mx-auto mb-4 text-black" size={32} />
        <h2 className="font-mono text-black text-xl mb-2">FEED DISRUPTED</h2>
        <p className="text-sm font-sans text-gray-500 mb-6">{error}</p>
        <button onClick={refresh} className="px-6 py-2 bg-black text-white font-mono text-xs hover:bg-gray-800 transition-colors uppercase tracking-widest">
          Reconnect
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
      
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-black/5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold text-lg">O</div>
            <span className="font-bold tracking-tighter text-xl">OCTAFIN</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => refresh()}
              className="group flex items-center gap-2 px-4 py-2 border border-black hover:bg-black hover:text-white transition-all duration-300"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-xs font-bold tracking-widest uppercase">Sync</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-[1600px] mx-auto flex-grow w-full">
        
        <section className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-black">
            PORTFOLIO <span className="text-gray-300">ANALYTICS</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 border-y border-black">
            <div className="border-b md:border-b-0 md:border-r border-black p-8 group hover:bg-gray-50 transition-colors">
              <p className="font-mono text-xs text-gray-400 mb-2 uppercase tracking-widest">Total Investment</p>
              <p className="text-4xl font-medium tracking-tight">
                {formatINR(data?.summary.totalInvestment || 0)}
              </p>
            </div>

            <div className="border-b md:border-b-0 md:border-r border-black p-8 group hover:bg-gray-50 transition-colors">
              <p className="font-mono text-xs text-gray-400 mb-2 uppercase tracking-widest">Current Value</p>
              <p className="text-4xl font-medium tracking-tight flex items-center gap-2">
                {formatINR(data?.summary.totalPresentValue || 0)}
              </p>
            </div>

            <div className="p-8 bg-black text-white group relative overflow-hidden">
              <p className="font-mono text-xs text-gray-500 mb-2 uppercase tracking-widest">Total P&L</p>
              <div className="flex flex-col items-start gap-1">
                <p className="text-4xl font-medium tracking-tight z-10">
                  {formatINR(data?.summary.totalGainLoss || 0)}
                </p>
                <div className={`z-10 inline-flex items-center gap-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                  (data?.summary.totalGainLoss || 0) >= 0 ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400'
                }`}>
                  {(data?.summary.totalGainLoss || 0) >= 0 ? 'Profit' : 'Loss'} 
                  <span className="font-mono ml-1">
                    {(data?.summary.totalGainLossPercent || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-4">
             <Layers size={16} />
             <h3 className="font-bold tracking-tight uppercase text-sm">Sector Allocation</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data?.sectors.map((sector) => (
              <div key={sector.name} className="border border-gray-200 p-4 hover:border-black transition-colors cursor-default">
                <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1 truncate">{sector.name}</p>
                <p className="font-bold text-lg">{formatINR(sector.totalPresentValue)}</p>
                <div className={`text-xs font-mono mt-1 ${sector.gainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                   {sector.gainLoss >= 0 ? '+' : ''}{formatINR(sector.gainLoss)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-6 border-b-2 border-black pb-4">
            <h3 className="text-2xl font-bold tracking-tight">ASSETS & HOLDINGS</h3>
            <div className="hidden md:flex items-center gap-4 text-xs font-mono text-gray-400">
               <span>• {data?.summary.dataHealth}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 pr-4 font-mono text-xs text-gray-400 uppercase tracking-widest font-normal">Instrument</th>
                  <th className="py-4 px-4 font-mono text-xs text-gray-400 uppercase tracking-widest font-normal">Allocation</th>
                  <th className="py-4 px-4 font-mono text-xs text-gray-400 uppercase tracking-widest font-normal text-right">Bought @</th>
                  <th className="py-4 px-4 font-mono text-xs text-gray-400 uppercase tracking-widest font-normal text-right">Live Price</th>
                  <th className="py-4 px-4 font-mono text-xs text-gray-400 uppercase tracking-widest font-normal text-right">PE / EPS</th>
                  <th className="py-4 px-4 font-mono text-xs text-gray-400 uppercase tracking-widest font-normal text-right">Valuation</th>
                  <th className="py-4 pl-4 font-mono text-xs text-gray-400 uppercase tracking-widest font-normal text-right">Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {data?.holdings.map((stock) => {
                  const isActive = stock.status === 'active';
                  const weight = parseFloat(stock.portfolioWeight?.toString() || "0");

                  return (
                    <tr key={stock.id} className={`border-b border-gray-100 transition-colors duration-200 group cursor-default ${isActive ? 'hover:bg-gray-50' : 'bg-gray-50/50'}`}>
                      
                      <td className="py-5 pr-4">
                        <div className="flex flex-col">
                          <span className={`font-bold text-base tracking-tight transition-transform duration-300 ${isActive ? 'group-hover:translate-x-1' : 'text-gray-400'}`}>
                            {stock.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="font-mono text-[10px] uppercase opacity-60 bg-gray-200 text-black px-1.5 py-0.5 rounded-sm">
                               {stock.sector}
                             </span>
                             <span className="font-mono text-[10px] uppercase opacity-50">
                               {stock.symbol}
                             </span>
                             {!isActive && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={8} /> OFFLINE</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-5 px-4 w-40">
                         {isActive ? (
                           <div className="w-full">
                             <div className="flex justify-between text-[10px] font-mono mb-1 opacity-70">
                               <span>{weight}%</span>
                             </div>
                             <div className="h-1.5 w-full bg-gray-200 rounded-sm overflow-hidden">
                               <div 
                                 className="h-full bg-black group-hover:bg-emerald-500 transition-all duration-500" 
                                 style={{ width: `${Math.min(weight, 100)}%` }}
                               ></div>
                             </div>
                           </div>
                         ) : (
                           <span className="text-[10px] font-mono text-gray-300">--</span>
                         )}
                      </td>

                      <td className="py-5 px-4 text-right font-mono text-sm text-gray-500">
                          {formatINR(stock.purchasePrice)}
                      </td>

                      <td className="py-5 px-4 text-right">
                        {isActive ? (
                          <LivePrice price={stock.cmp} format={formatINR} />
                        ) : (
                          <span className="text-gray-300 text-xs italic">Unavailable</span>
                        )}
                      </td>

                      <td className="py-5 px-4 text-right">
                        {isActive ? (
                           <div className="flex flex-col items-end text-[10px] font-mono text-gray-500">
                             <span>PE: {stock.peRatio}</span>
                             <span>EPS: {stock.eps}</span>
                           </div>
                        ) : <span className="text-gray-300">--</span>}
                      </td>

                      <td className="py-5 px-4 text-right">
                         {isActive ? (
                            <span className="font-medium">{formatINR(stock.presentValue)}</span>
                         ) : <span className="text-gray-300">--</span>}
                      </td>

                      <td className="py-5 pl-4 text-right">
                        {isActive ? (
                          <div className={`flex flex-col items-end gap-1 ${
                            stock.gainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            <div className="flex items-center gap-1 font-bold">
                              {stock.gainLoss >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                              {formatINR(Math.abs(stock.gainLoss))}
                            </div>
                            <span className="font-mono text-[10px] opacity-70">
                              {stock.gainLossPercent.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs font-mono">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <footer className="border-t border-black bg-gray-50 py-12 mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="font-black text-2xl tracking-tighter mb-2">OCTAFIN.</h2>
            <div className="text-gray-500 text-xs space-y-1">
              <p>Architecture: Next.js • Node.js • WebSockets • Yahoo Finance</p>
              <p className="text-blue-600 underline hover:text-blue-800 transition-colors">
                 <a href="https://shreenidhi-kattimani.vercel.app/" target="_blank" rel="noopener noreferrer">
                   Portfolio - https://shreenidhi-kattimani.vercel.app/
                 </a>
              </p>
            </div>
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-2">
                <span className="font-bold text-sm tracking-wide">
                  Shreenidhi Kattimani
                </span>
             </div>
             <p className="font-mono text-[10px] text-gray-400 uppercase mt-1">
               Last Sync: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Waiting...'}
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}