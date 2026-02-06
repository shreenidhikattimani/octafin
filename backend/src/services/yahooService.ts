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
    console.error("Yahoo Batch API failed:", error instanceof Error ? error.message : error);
  }

  return resultMap;
};