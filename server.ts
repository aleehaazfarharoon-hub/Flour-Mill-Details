import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client via server environment key
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint to check status and Gemini availability
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    model: 'gemini-3.8-flash',
  });
});

// Endpoint for AI Operational & Financial Advisory
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt, materials, clients, financials, employees, millingParameters } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY environment variable is not configured. Please ensure it is set in Settings > Secrets.',
      });
    }

    const context = `
You are a world-class Industrial Flour Mill Executive & Chief Operations/Financial Consultant.
Analyze the following live flour mill records and answer the user's specific request.

--- LIVE FLOUR MILL DATA ---
[RAW MATERIALS & WHEAT SILO STOCK]
${JSON.stringify(materials, null, 2)}

[CLIENT & ACCOUNTS RECEIVABLE / LEDGERS]
${JSON.stringify(clients, null, 2)}

[FINANCIAL LIABILITIES & SECURITY DEPOSITS]
${JSON.stringify(financials, null, 2)}

[MILL WORKFORCE & SHIFTS]
${JSON.stringify(employees, null, 2)}

${millingParameters ? `[ACTIVE MILLING GRINDING PARAMETERS & BLENDS]\n${JSON.stringify(millingParameters, null, 2)}\n` : ''}

--- USER ADVISORY QUERY ---
${prompt || 'Analyze my raw material quality, wheat moisture conditioning, and financial working capital risk based on the current records.'}

--- INSTRUCTIONS FOR RESPONSE ---
Provide an executive-level, mathematically sound, practical advisory. Include:
1. Executive Summary & Health Check
2. Technical Grain & Milling Assessment (Moisture conditioning, Gluten strength, Milling yield/extraction rate, Storage risk)
3. Commercial & Financial Risk Exposure (Credit concentration, Liquidity vs short-term bank loans, Deposit coverage)
4. Prioritized Action Matrix (Immediate 24h, Weekly Operational, Strategic)
Format with markdown headings, structured bullet points, and highlighted metric indicators (e.g. ⚠️ WARNING, ✅ OPTIMAL, 💡 RECOMMENDATION). Keep answers concrete and directly tailored to the data values provided.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: context,
    });

    res.json({
      text: response.text || 'No response generated from model.',
    });
  } catch (error: any) {
    console.error('Gemini Analysis Error:', error);
    res.status(500).json({
      error: error?.message || 'Error occurred while contacting Gemini API.',
    });
  }
});

// Mount Vite or serve static assets
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Flour Mill Enterprise server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
