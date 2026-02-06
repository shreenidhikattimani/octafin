import xlsx from 'xlsx';

export interface StockHolding {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  purchasePrice: number;
  quantity: number;
  sector: string;
}

export const parseHoldings = (filePath: string): StockHolding[] => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData = xlsx.utils.sheet_to_json<(string | number | undefined)[]>(sheet, { header: 1 });

    const holdings: StockHolding[] = [];
    let currentSector = 'Uncategorized';

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const col0 = row[0]; 
      const col1 = row[1]; 
      const col2 = row[2]; 
      const col3 = row[3]; 
      const col6 = row[6]; 

      if (!col0 && typeof col1 === 'string' && !col2 && !col3) {
        currentSector = col1.trim();
        continue;
      }

      if (col1 && col6) {
         const rawSymbol = col6.toString().trim().toUpperCase();
         const stockName = col1.toString().trim().replace(/\s+/g, ' ');
         const price = Number(col2) || 0;
         const qty = Number(col3) || 0;

         if (!rawSymbol || price <= 0 || qty <= 0) continue;

         const isBSE = /^\d+$/.test(rawSymbol);

         holdings.push({
           id: `${rawSymbol}-${currentSector.replace(/\s/g, '')}`,
           name: stockName,
           symbol: rawSymbol,
           exchange: isBSE ? 'BSE' : 'NSE',
           purchasePrice: price,
           quantity: qty,
           sector: currentSector
         });
      }
    }

    console.log(`Parsed ${holdings.length} stocks from Excel.`);
    return holdings;

  } catch (error) {
    console.error("Excel parsing failed:", error);
    return []; 
  }
};