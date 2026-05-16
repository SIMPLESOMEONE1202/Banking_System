import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

import authRoutes from './routes/auth';
import accountRoutes from './routes/account';
import transactionRoutes from './routes/transaction';
import complianceRoutes from './routes/compliance';
import aiRoutes from './routes/ai';

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Banking Compliance API is running' });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
