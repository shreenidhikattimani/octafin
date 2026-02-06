export interface StockHolding {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  purchasePrice: number;
  quantity: number;
  sector: string;
  investment: number;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  status: 'active' | 'unavailable' | 'error';
  portfolioWeight: number;
  peRatio: number | string;
  eps: number | string;
  change: number;
  source: string;
}

export interface SectorData {
  name: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  stockCount: number;
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dataHealth: string;
  fetchTimeMs: number;
}

export interface PortfolioResponse {
  summary: PortfolioSummary;
  sectors: SectorData[];
  holdings: StockHolding[];
  lastUpdated: string;
  isCached: boolean;
}
