import { Router } from 'express';
import { getAmlAlerts, getFraudReports } from '../controllers/compliance';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
// Restrict compliance endpoints to specific roles
router.use(authorize(['ADMIN', 'COMPLIANCE_OFFICER', 'FRAUD_ANALYST']));

router.get('/aml', getAmlAlerts);
router.get('/fraud', getFraudReports);

export default router;
