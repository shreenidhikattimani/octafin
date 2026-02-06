import { Request, Response } from 'express';
import path from 'path';
import { parseHoldings, StockHolding } from '../parsers/excelParser';
import { fetchYahooBatch } from '../services/yahooService';
import { fetchGoogleData } from '../services/googleService';
import cache from '../cache/store';
import { STOCK_MAP } from '../utils/stockMapping';

const EXCEL_PATH = path.join(__dirname, '../../data/holdings.xlsx');
let staticHoldings: StockHolding[] = [];

const GOOGLE_CACHE_TTL = 10 * 60 * 1000;
interface GoogleCacheItem {
  peRatio: number | string;
  eps: number | string;
  timestamp: number;
}
const googleMetricsCache: Record<string, GoogleCacheItem> = {};

try {
  const rawHoldings = parseHoldings(EXCEL_PATH);
  staticHoldings = rawHoldings.filter(h => h.symbol !== 'NSE/BSE' && h.purchasePrice > 0);
  console.log(`Loaded ${staticHoldings.length} valid stocks.`);
} catch (err) {
  console.error("Failed to load Excel:", err);
}

const refreshGoogleAuthorityData = async (symbol: string, exchange: string) => {
  try {
    const gData = await fetchGoogleData(symbol, exchange);
    if (gData.peRatio !== 'N/A') {
        googleMetricsCache[symbol] = {
            peRatio: gData.peRatio,
            eps: gData.eps,
            timestamp: Date.now()
        };
    }
  } catch (e) {
  }
};

export const fetchPortfolioLogic = async () => {
  const start = Date.now();

  const cachedData = cache.get('portfolio_data');
  if (cachedData) return { ...cachedData, isCached: true };

  const batchSymbols = staticHoldings.map(stock => {
      const mapped = STOCK_MAP[stock.symbol as keyof typeof STOCK_MAP] || stock.symbol;
      return mapped.match(/^[0-9]+$/) ? `${mapped}.BO` : `${mapped}.NS`;
  });

  const batchResults = await fetchYahooBatch(batchSymbols);

  const enrichedStocks = await Promise.all(staticHoldings.map(async (stock) => {
    try {
      const mapped = STOCK_MAP[stock.symbol as keyof typeof STOCK_MAP] || stock.symbol;
      const yahooKey = mapped.match(/^[0-9]+$/) ? `${mapped}.BO` : `${mapped}.NS`;

      let yahooData = batchResults.get(yahooKey);
      let source = 'YAHOO_LIVE';

      if (!yahooData) {
         try {
             const gData = await fetchGoogleData(stock.symbol, stock.exchange);
             if (gData.price > 0) {
                 yahooData = {
                     symbol: stock.symbol, price: gData.price, currency: 'INR', exchange: 'NSE',
                     previousClose: 0, change: 0, changePercent: 0,
                     peRatio: Number(gData.peRatio) || null, eps: Number(gData.eps) || null,
                     marketCap: null, volume: null, high52: null, low52: null,
                     timestamp: new Date(), source: 'YAHOO'
                 } as any;
             }
         } catch (e) {}
      }

      let finalPe = yahooData?.peRatio ?? 'N/A';
      let finalEps = yahooData?.eps ?? 'N/A';

      let cachedGoogle = googleMetricsCache[stock.symbol];
      const isGoogleStale = !cachedGoogle || (Date.now() - cachedGoogle.timestamp > GOOGLE_CACHE_TTL);

      if (cachedGoogle) {
          finalPe = cachedGoogle.peRatio;
          finalEps = cachedGoogle.eps;
          source = 'GOOGLE_AUTHORITY';
      }

      if (isGoogleStale) {
          refreshGoogleAuthorityData(stock.symbol, stock.exchange);
      }

      if ((finalPe === 'N/A' || !finalPe) && yahooData?.peRatio) finalPe = yahooData.peRatio;
      if ((finalEps === 'N/A' || !finalEps) && yahooData?.eps) finalEps = yahooData.eps;

      const cmp = yahooData?.price || 0;
      const investment = stock.purchasePrice * stock.quantity;
      const presentValue = cmp * stock.quantity;
      const gainLoss = presentValue - investment;
      const gainLossPercent = investment > 0 ? (gainLoss / investment) * 100 : 0;

      return {
        ...stock, investment, cmp, presentValue, gainLoss, gainLossPercent,
        status: cmp > 0 ? 'active' : 'unavailable',
        portfolioWeight: 0,
        peRatio: finalPe,
        eps: finalEps,
        change: yahooData?.change || 0,
        source
      };

    } catch (err) {
      return { ...stock, investment: 0, cmp: 0, presentValue: 0, gainLoss: 0, gainLossPercent: 0, status: 'error', portfolioWeight: 0, peRatio: 'N/A', eps: 'N/A', change: 0 };
    }
  }));

  const activeHoldings = enrichedStocks.filter(s => s.cmp > 0);
  const totalInvestment = activeHoldings.reduce((sum, s) => sum + s.investment, 0);
  const totalPresentValue = activeHoldings.reduce((sum, s) => sum + s.presentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;

  const finalStocks = enrichedStocks.map(s => ({
    ...s,
    portfolioWeight: (s.presentValue > 0 && totalPresentValue > 0)
        ? Number(((s.presentValue / totalPresentValue) * 100).toFixed(2))
        : 0
  }));

  const sectorMap: Record<string, any> = {};
  finalStocks.forEach(stock => {
    if (!sectorMap[stock.sector]) sectorMap[stock.sector] = { name: stock.sector, totalInvestment: 0, totalPresentValue: 0, gainLoss: 0, stockCount: 0 };
    if (stock.status === 'active') {
      sectorMap[stock.sector].totalInvestment += stock.investment;
      sectorMap[stock.sector].totalPresentValue += stock.presentValue;
      sectorMap[stock.sector].gainLoss += stock.gainLoss;
    }
    sectorMap[stock.sector].stockCount += 1;
  });

  const responseData = {
    summary: {
      totalInvestment, totalPresentValue, totalGainLoss,
      totalGainLossPercent: totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0,
      dataHealth: `${activeHoldings.length}/${enrichedStocks.length} Feeds Active`,
      fetchTimeMs: Date.now() - start
    },
    sectors: Object.values(sectorMap),
    holdings: finalStocks,
    lastUpdated: new Date().toISOString(),
    isCached: false
  };

  cache.set('portfolio_data', responseData, 5);
  return responseData;
};

export const getPortfolioData = async (req: Request, res: Response) => {
  try {
    const data = await fetchPortfolioLogic();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};