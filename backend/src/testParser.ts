import { parseHoldings } from './parsers/excelParser';
import path from 'path';
const data = parseHoldings(path.join(__dirname, '../../data/holdings.xlsx'));
console.log(JSON.stringify(data, null, 2));