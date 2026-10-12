import { Material, Client, FinancialItem, Employee } from '../types';

export interface AnalyzePayload {
  prompt: string;
  materials: Material[];
  clients: Client[];
  financials: FinancialItem[];
  employees: Employee[];
  millingParameters?: Record<string, any>;
}

export interface AnalyzeResponse {
  text?: string;
  error?: string;
}

export async function requestGeminiAdvisory(payload: AnalyzePayload): Promise<string> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: AnalyzeResponse = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to generate advisory from server');
  }

  return data.text || 'No response returned from advisory system.';
}

export async function checkServerStatus(): Promise<{ status: string; hasApiKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch {
    return { status: 'offline', hasApiKey: false, model: 'gemini-3.8-flash' };
  }
}
