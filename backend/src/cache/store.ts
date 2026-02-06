import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 5, checkperiod: 10 });
export default cache;