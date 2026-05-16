import { Router } from 'express';
import { chatWithCopilot, generateReport } from '../controllers/ai';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/chat', chatWithCopilot);
router.get('/report', generateReport);

export default router;
