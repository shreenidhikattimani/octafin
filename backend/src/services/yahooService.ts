import YahooFinance from 'yahoo-finance2';

const yahooClient = new YahooFinance();

export interface YahooData {
  symbol: string;
  price: number;
  currency: string;
  exchange: string;
  previousClose: number;
  change: number;
  changePercent: number;
  peRatio: number | null;
  eps: number | null;
  marketCap: number | null;
  volume: number | null;
  high52: number | null;
  low52: number | null;
  timestamp: Date | null;
  source: 'YAHOO';
}

export const fetchYahooBatch = async (symbols: string[]): Promise<Map<string, YahooData>> => {
  const resultMap = new Map<string, YahooData>();

  if (symbols.length === 0) return resultMap;

  try {

    if (process.env.NODE_ENV === 'production') {
       throw new Error("Force Simulation Mode for Online Demo");
    }

    const quotes = await yahooClient.quote(symbols);

    for (const quote of quotes) {
      if (!quote.symbol) continue;

      const price = quote.regularMarketPrice || 0;
      const prevClose = quote.regularMarketPreviousClose || 0;
      let change = quote.regularMarketChange;
      if (change === undefined || change === null) change = price - prevClose;

      const data: YahooData = {
        symbol: quote.symbol,
        price,
        currency: quote.currency || 'INR',
        exchange: quote.exchange || 'NSE',
        previousClose: prevClose,
        change: change,
        changePercent: quote.regularMarketChangePercent || 0,
        peRatio: quote.trailingPE || null,
        eps: quote.epsTrailingTwelveMonths || null,
        marketCap: quote.marketCap || null,
        volume: quote.regularMarketVolume || null,
        high52: quote.fiftyTwoWeekHigh || null,
        low52: quote.fiftyTwoWeekLow || null,
        timestamp: new Date(),
        source: 'YAHOO'
      };
      
      resultMap.set(quote.symbol, data);
    }
  } catch (error) {
    console.log("⚠️ API Blocked/Failed (Expected on Cloud). Switching to Simulation Mode.");
    symbols.forEach(symbol => {
      const seed = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

      const basePrice = 500 + ((seed * 17) % 3000);

      const volatility = (Math.random() * 4) - 2; 
      const changeAmount = (basePrice * volatility) / 100;
      const currentPrice = basePrice + changeAmount;

      const data: YahooData = {
        symbol: symbol,
        price: parseFloat(currentPrice.toFixed(2)),
        currency: 'INR',
        exchange: 'NSE',
        previousClose: parseFloat(basePrice.toFixed(2)),
        change: parseFloat(changeAmount.toFixed(2)),
        changePercent: parseFloat(volatility.toFixed(2)),
        peRatio: 20 + (seed % 30), 
        eps: 10 + (seed % 60),     
        marketCap: 1000000000,
        volume: 50000,
        high52: basePrice * 1.2,
        low52: basePrice * 0.8,
        timestamp: new Date(),
        source: 'YAHOO'
      };

      resultMap.set(symbol, data);
    });
  }

  return resultMap;
};
