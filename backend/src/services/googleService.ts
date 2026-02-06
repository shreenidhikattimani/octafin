import axios from 'axios';
import * as cheerio from 'cheerio';

interface GoogleData {
  price: number;
  peRatio: number | string;
  eps: number | string;
}

export const fetchGoogleData = async (
  symbol: string,
  exchange: string = 'NSE'
): Promise<GoogleData> => {

  const isBSE = /^[0-9]+$/.test(symbol);
  const searchSymbol = exchange === 'BSE' || isBSE ? `BOM:${symbol}` : `NSE:${symbol}`;

  const url = `https://www.google.com/finance/quote/${searchSymbol}`;

  try {
    const { data } = await axios.get(url, {
      timeout: 6000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    const $ = cheerio.load(data);

    let price = 0;
    const priceText = $('[class*="YMlKec"]').first().text().trim();
    if (priceText) {
      price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
    }

    const getMetric = (keywords: string[]): string | null => {
      let result: string | null = null;

      $('.gyFHrc').each((_, el) => {
        if (result) return;

        const label = $(el).find('div').first().text().trim().toLowerCase();

        if (keywords.some(k => label.includes(k.toLowerCase()))) {
          const value = $(el).find('.P6K39c').text().trim();
          if (value) {
            result = value;
          }
        }
      });

      return result;
    };

    const rawPe = getMetric(['p/e', 'price to earnings']);
    const rawEps = getMetric(['earnings per share', 'eps']);

    const parseMetric = (val: string | null): number | string => {
      if (!val || val === '-' || val === 'N/A') return 'N/A';
      const cleaned = val.replace(/[₹,]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 'N/A' : num;
    };

    return {
      price,
      peRatio: parseMetric(rawPe),
      eps: parseMetric(rawEps)
    };

  } catch (error) {
    return { price: 0, peRatio: 'N/A', eps: 'N/A' };
  }
};