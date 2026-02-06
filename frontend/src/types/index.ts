export interface Stock {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  cmp: number;            
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  portfolioWeight: number;
  sector: string;
  peRatio: number | string;
  marketCap: string;
}

export interface SectorSummary {
  name: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  stockCount: number;
}

export interface PortfolioResponse {
  summary: {
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
  };
  sectors: SectorSummary[];
  holdings: Stock[];
  lastUpdated: string;
}