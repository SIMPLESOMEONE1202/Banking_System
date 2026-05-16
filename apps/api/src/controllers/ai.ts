import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import OpenAI from 'openai';
import { prisma } from '@banking/database';

// Initialize OpenAI conditionally
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const chatSchema = z.object({
  message: z.string(),
});

export const chatWithCopilot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = chatSchema.parse(req.body);
    const userRole = req.user?.role;

    // Build context
    const contextStr = `You are an AI Banking Compliance Assistant. The user you are talking to has the role: ${userRole}. Keep responses concise and professional.`;

    if (openai) {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: contextStr },
          { role: "user", content: message }
        ],
        model: "gpt-4-turbo-preview", // or gpt-3.5-turbo
      });
      res.status(200).json({ reply: completion.choices[0].message.content });
    } else {
      // Mock response if no API key
      setTimeout(() => {
        let reply = "I am the simulated AI Copilot. Since no OpenAI API key is configured, I am responding in mock mode.\n\n";
        
        if (message.toLowerCase().includes("report")) {
          reply += "I can generate automated regulatory reports. Based on the latest AML flags, there are 2 CRITICAL alerts that require immediate SAR filing.";
        } else if (message.toLowerCase().includes("fraud")) {
          reply += "Our fraud models indicate a 30% spike in geo-velocity mismatch across recent transactions. I recommend freezing accounts flagged with score > 80.";
        } else {
          reply += `I understood your message: "${message}". How else can I assist you with banking compliance today?`;
        }

        res.status(200).json({ reply });
      }, 1000); // Simulate network delay
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('AI Chat Error:', error);
      res.status(500).json({ error: 'Failed to communicate with AI Copilot' });
    }
  }
};

export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Generate a mock regulatory report
    const flaggedTxCount = await prisma.transaction.count({ where: { status: 'FLAGGED' } });
    const amlAlertsCount = await prisma.amlAlert.count({ where: { status: 'OPEN' } });

    const report = `REGULATORY COMPLIANCE REPORT\nDate: ${new Date().toISOString()}\n\nSummary:\n- Total Flagged Transactions: ${flaggedTxCount}\n- Open AML Alerts: ${amlAlertsCount}\n\nRecommendation:\nReview all CRITICAL alerts immediately. File SARs for confirmed suspicious activities.`;

    res.status(200).json({ report });
  } catch (error) {
    console.error('Report Gen Error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
