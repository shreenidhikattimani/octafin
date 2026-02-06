import { Router } from 'express';
import { getPortfolioData } from '../controllers/portfolioController';

const router = Router();

router.get('/portfolio', getPortfolioData);

export default router;