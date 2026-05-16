import { Response } from 'express';
import { prisma } from '@banking/database';
import { AuthRequest } from '../middleware/auth';

export const getAmlAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alerts = await prisma.amlAlert.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        transaction: {
          select: { amount: true, currency: true, status: true, aiRiskScore: true }
        }
      }
    });
    res.status(200).json({ alerts });
  } catch (error) {
    console.error('Error fetching AML alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFraudReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.fraudReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        transaction: {
          select: { amount: true, currency: true, status: true, aiRiskScore: true }
        }
      }
    });
    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching Fraud reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
