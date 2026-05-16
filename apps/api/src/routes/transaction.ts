import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/transaction';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getTransactions);
router.post('/', createTransaction);

export default router;
