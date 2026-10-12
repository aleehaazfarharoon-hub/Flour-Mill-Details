import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Wheat,
  Building2,
  Landmark,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { Material, Client, FinancialItem, Employee } from '../types';
import { requestGeminiAdvisory } from '../services/geminiService';

interface AiAnalyticsProps {
  materials: Material[];
  clients: Client[];
  financials: FinancialItem[];
  employees: Employee[];
  initialPrompt?: string;
}

export const AiAnalytics: React.FC<AiAnalyticsProps> = ({
  materials,
  clients,
  financials,
  employees,
  initialPrompt = 'Analyze my raw material quality and financial risk based on the current records.',
}) => {
  const [query, setQuery] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showContextPreview, setShowContextPreview] = useState(false);

  // Quick preset queries
  const presetQueries = [
    {
      label: 'Default Streamlit Audit',
      prompt: 'Analyze my raw material quality and financial risk based on the current records.',
    },
    {
      label: 'Moisture & Conditioning Strategy',
      prompt:
        'Batch B02 has high moisture (14.1%). How should we blend and condition it with Hard Wheat (12.5%) before grinding?',
    },
    {
      label: 'Client Default Risk & Recovery',
      prompt:
        'Examine client credit limits and outstanding receivables. Which clients represent the biggest default risk, and what credit policies should we enforce?',
    },
    {
      label: 'Debt Servicing & Cash Flow',
      prompt:
        'Evaluate our active bank loans (PKR 4,000,000) against client receivables and security deposits. Give us a working capital risk forecast.',
    },
  ];

  const handleRunAnalysis = async (customPrompt?: string) => {
    const promptToRun = customPrompt || query;
    if (!promptToRun.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await requestGeminiAdvisory({
        prompt: promptToRun,
        materials,
        clients,
        financials,
        employees,
      });
      setResponse(result);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          'Failed to communicate with Gemini API on the server. Please check your network and server configuration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>🤖</span> AI Studio Operational & Financial Advisory
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-medium">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            PhD-level flour mill engineering & financial risk advisory grounded in live mill records
          </p>
        </div>

        {/* Live data sync status */}
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Live Factory Context Synced</span>
        </div>
      </div>

      {/* Live Context Snapshot summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Active Factory Data Injected into AI Prompt:</span>
          </div>
          <button
            onClick={() => setShowContextPreview(!showContextPreview)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
          >
            <span>{showContextPreview ? 'Hide Raw JSON' : 'Inspect Context Payload'}</span>
            {showContextPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2">
            <Wheat className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Grain Silos</span>
              <span className="font-bold text-white">{materials.length} Batches</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Client Ledgers</span>
              <span className="font-bold text-white">{clients.length} Accounts</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Loans & Deposits</span>
              <span className="font-bold text-white">{financials.length} Instruments</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Staff Roster</span>
              <span className="font-bold text-white">{employees.length} Personnel</span>
            </div>
          </div>
        </div>

        {/* Collapsible raw data payload */}
        {showContextPreview && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto">
            <pre>
              {JSON.stringify(
                {
                  materials,
                  clients,
                  financials,
                  employees,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Preset Query Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 block">
          Recommended Advisory Inquiries:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {presetQueries.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(pq.prompt);
                handleRunAnalysis(pq.prompt);
              }}
              className="text-left p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-850 transition group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
                <span>{pq.label}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400/60 group-hover:text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{pq.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          Ask Google AI Studio about your Flour Mill data:
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about grain conditioning, milling extraction yield, client credit risk, or bank loan exposure..."
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setQuery('Analyze my raw material quality and financial risk based on the current records.')
            }
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to default prompt</span>
          </button>

          <button
            onClick={() => handleRunAnalysis()}
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Evaluating Mill Records...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate AI Insights</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Error communicating with Gemini API:</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            <div>
              <h3 className="text-sm font-bold text-white">Consulting Gemini 3.8 Flash...</h3>
              <p className="text-xs text-slate-400">
                Cross-referencing wheat moisture, customer receivables, and financial gearing
              </p>
            </div>
          </div>
          <div className="space-y-2 pt-2 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
            <div className="h-4 bg-slate-800 rounded w-2/3"></div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {response && !isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-0">
          <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">AI Analysis & Recommendations</h3>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 text-sm text-slate-200 leading-relaxed font-sans space-y-3 prose-invert max-w-none">
            {/* Simple Clean Markdown Styler */}
            <div className="whitespace-pre-line font-sans text-sm text-slate-200">
              {response}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
