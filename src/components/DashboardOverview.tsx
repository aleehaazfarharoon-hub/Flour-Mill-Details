import React from 'react';
import {
  Users,
  Wheat,
  Building2,
  Landmark,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { Employee, Material, Client, FinancialItem } from '../types';
import { formatPKR, formatTons } from '../utils/formatters';

interface DashboardOverviewProps {
  employees: Employee[];
  materials: Material[];
  clients: Client[];
  financials: FinancialItem[];
  onNavigateToAi: (prompt?: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  employees,
  materials,
  clients,
  financials,
  onNavigateToAi,
  onNavigateToTab,
}) => {
  // Aggregate Metrics matching Streamlit specifications
  const activeStaffCount = employees.length;
  const rawWheatStock = materials
    .filter((m) => m.category === 'Raw Wheat')
    .reduce((sum, m) => sum + m.stockTons, 0);
  const totalMaterialStock = materials.reduce((sum, m) => sum + m.stockTons, 0);
  const totalOutstandingBalance = clients.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalCreditLimit = clients.reduce((sum, c) => sum + c.creditLimit, 0);
  const activeFinancialCount = financials.filter((f) => f.status === 'Active').length;

  const totalLoans = financials
    .filter((f) => f.type === 'Loan' && f.status === 'Active')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalDeposits = financials
    .filter((f) => f.type === 'Deposit' && f.status === 'Active')
    .reduce((sum, f) => sum + f.amount, 0);

  // Moisture check: Grain moisture > 13.5% requires aeration / conditioning care
  const highMoistureBatches = materials.filter(
    (m) => m.category === 'Raw Wheat' && m.moisturePercent > 13.5
  );

  // Credit risk check: clients with > 80% credit utilization
  const atRiskClients = clients.filter(
    (c) => c.creditLimit > 0 && c.outstandingBalance / c.creditLimit >= 0.8
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>🏢</span> Flour Mill Executive Dashboard
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Real-time Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Overview of Mill Operations, Grain Silos & Financial Working Capital
          </p>
        </div>

        <button
          onClick={() =>
            onNavigateToAi(
              'Analyze my raw material quality and financial risk based on the current records.'
            )
          }
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Generate AI Operational Advisory</span>
        </button>
      </div>

      {/* 4 Core Streamlit Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Active Staff */}
        <div
          onClick={() => onNavigateToTab('Employee Details')}
          className="cursor-pointer bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Active Staff
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{activeStaffCount}</span>
            <span className="text-xs text-slate-400">Personnel on Roster</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>3 Operating Shifts</span>
            <span className="text-blue-400 flex items-center gap-0.5 group-hover:underline">
              Manage &rarr;
            </span>
          </div>
        </div>

        {/* Metric 2: Total Wheat Stock */}
        <div
          onClick={() => onNavigateToTab('Material & Inventory')}
          className="cursor-pointer bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Wheat Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wheat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {rawWheatStock} Tons
            </span>
            <span className="text-xs text-slate-400">Raw Grain</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Total All Stock: {totalMaterialStock} T</span>
            <span className="text-amber-400 flex items-center gap-0.5 group-hover:underline">
              Silos &rarr;
            </span>
          </div>
        </div>

        {/* Metric 3: Total Client Outstanding */}
        <div
          onClick={() => onNavigateToTab('Client Management')}
          className="cursor-pointer bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Client Outstanding
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {formatPKR(totalOutstandingBalance)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>
              Limit: {formatPKR(totalCreditLimit)} ({((totalOutstandingBalance / (totalCreditLimit || 1)) * 100).toFixed(0)}%)
            </span>
            <span className="text-emerald-400 flex items-center gap-0.5 group-hover:underline">
              Ledger &rarr;
            </span>
          </div>
        </div>

        {/* Metric 4: Active Loans / Deposits */}
        <div
          onClick={() => onNavigateToTab('Loans & Deposits')}
          className="cursor-pointer bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Loans / Deposits
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-400 font-mono">
              {activeFinancialCount}
            </span>
            <span className="text-xs text-slate-400">Instruments</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Debt: {formatPKR(totalLoans)}</span>
            <span className="text-purple-400 flex items-center gap-0.5 group-hover:underline">
              Banking &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Operational Quality Warnings & Insights */}
      {highMoistureBatches.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-200 text-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 md:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-amber-300">
                Moisture Conditioning Alert: Batch {highMoistureBatches.map((b) => b.batchId).join(', ')} exceed 13.5%
              </p>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Soft wheat moisture measured at{' '}
                {highMoistureBatches.map((b) => `${b.moisturePercent}%`).join(', ')}. Risk of fungal spoilage or roll gumming during break reduction. Recommended: Aerate silo or dry-blend with Hard Wheat ({materials.find((m) => m.batchId === 'B01')?.moisturePercent}%).
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              onNavigateToAi(
                'How should I handle high moisture in Batch B02 (14.1%) when milling with Hard Wheat Batch B01 (12.5%)?'
              )
            }
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border border-amber-500/40 transition shrink-0"
          >
            Consult Milling AI &rarr;
          </button>
        </div>
      )}

      {/* Silo Capacity Visualizer & Financial Health Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grain Silos Overview */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Grain Silo & Storage Capacity</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('Material & Inventory')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              View All Batches &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {materials.slice(0, 4).map((mat) => {
              const maxCap = mat.maxCapacityTons || 150;
              const fillPercent = Math.min(100, Math.round((mat.stockTons / maxCap) * 100));

              return (
                <div
                  key={mat.batchId}
                  className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {mat.batchId}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                        {mat.item}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        mat.moisturePercent > 13.5
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {mat.moisturePercent > 13.5 ? '⚠️ Moisture High' : 'Safe Storage'}
                    </span>
                  </div>

                  {/* Silo fill bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>{mat.siloLocation}</span>
                      <span className="font-mono text-slate-200">
                        {mat.stockTons}T / {maxCap}T ({fillPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          mat.moisturePercent > 13.5 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Lab specs */}
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-slate-400 border-t border-slate-800/60 font-mono">
                    <div>
                      <span className="text-slate-500 block">Moisture</span>
                      <span className={mat.moisturePercent > 13.5 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {mat.moisturePercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Gluten</span>
                      <span className="text-slate-300">{mat.glutenPercent}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ash</span>
                      <span className="text-slate-300">{mat.ashPercent || '--'}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Working Capital & Exposure Radar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Landmark className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">Liquidity & Collateral Coverage</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comparison between customer receivables, active credit lines, and cash security deposits held.
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Security Deposits Held
                  </span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {formatPKR(totalDeposits)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Against Receivables</span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {totalOutstandingBalance > 0
                      ? `${((totalDeposits / totalOutstandingBalance) * 100).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Bank Financing Outstanding
                  </span>
                  <span className="text-base font-bold text-purple-400 font-mono">
                    {formatPKR(totalLoans)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Avg Interest Rate</span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    11.8% p.a.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    At-Risk Accounts (&gt;80% Limit)
                  </span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {atRiskClients.length} of {clients.length} Clients
                  </span>
                </div>
                <button
                  onClick={() => onNavigateToTab('Client Management')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Review Risk &rarr;
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={() =>
                onNavigateToAi(
                  'Assess the financial health of the mill: Compare bank loans of PKR 4,000,000 against customer receivables of PKR ' +
                    totalOutstandingBalance.toLocaleString() +
                    ' and deposits of PKR ' +
                    totalDeposits.toLocaleString() +
                    '. What are the cash flow risks?'
                )
              }
              className="w-full py-2 px-3 text-xs font-medium rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Analyze Working Capital Risk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Streamlit Main Table: Raw Material Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Wheat className="w-4 h-4 text-amber-400" />
              <span>Raw Material & Grain Quality Overview</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live moisture, gluten content, and storage stock records
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('Material & Inventory')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
          >
            Manage Materials &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Stock (Tons)</th>
                <th className="py-3 px-4 text-right">Moisture (%)</th>
                <th className="py-3 px-4 text-right">Gluten (%)</th>
                <th className="py-3 px-4 text-right">Protein (%)</th>
                <th className="py-3 px-4">Silo / Bay</th>
                <th className="py-3 px-4 text-center">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {materials.map((m) => (
                <tr key={m.batchId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-amber-400">{m.batchId}</td>
                  <td className="py-3.5 px-4 font-sans font-medium text-slate-100">{m.item}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">{m.category}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">{m.stockTons}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        m.moisturePercent > 13.5
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'text-emerald-400'
                      }`}
                    >
                      {m.moisturePercent}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-300">{m.glutenPercent}%</td>
                  <td className="py-3.5 px-4 text-right text-slate-400">{m.proteinPercent || '--'}%</td>
                  <td className="py-3.5 px-4 font-sans text-slate-300">{m.siloLocation}</td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                        m.moisturePercent > 13.5
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {m.moisturePercent > 13.5 ? (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>High Moisture</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Optimal</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
