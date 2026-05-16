import { Router } from 'express';
import { getAccounts, createAccount } from '../controllers/account';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAccounts);
router.post('/', createAccount);

export default router;
