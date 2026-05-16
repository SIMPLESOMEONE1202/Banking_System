import { Response } from 'express';
import { z } from 'zod';
import { prisma, TransactionStatus } from '@banking/database';
import { AuthRequest } from '../middleware/auth';

const createTransactionSchema = z.object({
  sourceAccountId: z.string(),
  targetAccountId: z.string().optional(),
  amount: z.number().positive(),
  description: z.string().optional(),
  currency: z.string().default('USD'),
});

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const accountId = req.query.accountId as string;

    const whereClause: any = {
      OR: [
        { sourceAccount: { userId } },
        { targetAccount: { userId } },
      ],
    };

    if (accountId) {
      whereClause.OR = [
        { sourceAccountId: accountId },
        { targetAccountId: accountId },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        sourceAccount: { select: { accountNumber: true, type: true } },
        targetAccount: { select: { accountNumber: true, type: true } },
      },
    });
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { sourceAccountId, targetAccountId, amount, description, currency } = createTransactionSchema.parse(req.body);

    // Verify source account belongs to user
    const sourceAccount = await prisma.account.findUnique({ where: { id: sourceAccountId } });
    if (!sourceAccount || sourceAccount.userId !== userId) {
      res.status(403).json({ error: 'Invalid source account' });
      return;
    }

    if (sourceAccount.balance < amount) {
      res.status(400).json({ error: 'Insufficient funds' });
      return;
    }

    // Simulate AI Fraud Engine scoring (0-100)
    // High amounts or specific patterns increase risk
    let riskScore = amount > 10000 ? 75 : amount > 1000 ? 30 : 5;
    
    // Create transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Deduct from source
      await tx.account.update({
        where: { id: sourceAccountId },
        data: { balance: { decrement: amount } },
      });

      // Add to target if internal
      if (targetAccountId) {
        await tx.account.update({
          where: { id: targetAccountId },
          data: { balance: { increment: amount } },
        });
      }

      // Record transaction
      const createdTx = await tx.transaction.create({
        data: {
          sourceAccountId,
          targetAccountId,
          amount,
          description,
          currency,
          aiRiskScore: riskScore,
          status: riskScore > 70 ? TransactionStatus.FLAGGED : TransactionStatus.COMPLETED,
        },
      });

      // If risk score is high, generate a Fraud Report and AML Alert
      if (riskScore > 70) {
        await tx.fraudReport.create({
          data: {
            transactionId: createdTx.id,
            score: riskScore,
            factors: JSON.stringify(["High transaction amount", "Unusual pattern"]),
          }
        });

        await tx.amlAlert.create({
          data: {
            transactionId: createdTx.id,
            severity: riskScore > 90 ? 'CRITICAL' : 'HIGH',
            reason: "Suspiciously large transfer triggering AML thresholds.",
          }
        });
      }

      return createdTx;
    });

    res.status(201).json({ transaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
