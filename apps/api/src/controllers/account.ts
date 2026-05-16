import { Response } from 'express';
import { z } from 'zod';
import { prisma, AccountType } from '@banking/database';
import { AuthRequest } from '../middleware/auth';

const createAccountSchema = z.object({
  type: z.nativeEnum(AccountType).default(AccountType.SAVINGS),
  currency: z.string().default('USD'),
});

// Generate a random 10-digit account number
const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

export const getAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { type, currency } = createAccountSchema.parse(req.body);

    const account = await prisma.account.create({
      data: {
        userId,
        accountNumber: generateAccountNumber(),
        type,
        currency,
        balance: 0,
      },
    });

    res.status(201).json({ account });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error creating account:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
