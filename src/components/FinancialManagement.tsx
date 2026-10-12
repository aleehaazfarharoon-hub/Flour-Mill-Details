import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Search,
  Download,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Trash2,
  Edit,
  X,
  Shield,
  CreditCard,
} from 'lucide-react';
import { FinancialItem, FinancialType } from '../types';
import { formatPKR, exportToCSV } from '../utils/formatters';

interface FinancialManagementProps {
  financials: FinancialItem[];
  onAddFinancial: (item: FinancialItem) => void;
  onUpdateFinancial: (item: FinancialItem) => void;
  onDeleteFinancial: (id: string) => void;
}

export const FinancialManagement: React.FC<FinancialManagementProps> = ({
  financials,
  onAddFinancial,
  onUpdateFinancial,
  onDeleteFinancial,
}) => {
  const [filterType, setFilterType] = useState<'All' | 'Deposit' | 'Loan'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);

  // Form state
  const nextId = `FIN-0${financials.length + 1}`;
  const [formId, setFormId] = useState(nextId);
  const [formEntity, setFormEntity] = useState('');
  const [formType, setFormType] = useState<FinancialType>('Loan');
  const [formAmount, setFormAmount] = useState<number>(1000000);
  const [formInterestRate, setFormInterestRate] = useState<number>(11.5);
  const [formTenure, setFormTenure] = useState<number>(24);
  const [formPurpose, setFormPurpose] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Settled'>('Active');
  const [errorMsg, setErrorMsg] = useState('');

  const activeLoans = financials.filter((f) => f.type === 'Loan' && f.status === 'Active');
  const activeDeposits = financials.filter((f) => f.type === 'Deposit' && f.status === 'Active');

  const totalLoansAmount = activeLoans.reduce((sum, f) => sum + f.amount, 0);
  const totalDepositsAmount = activeDeposits.reduce((sum, f) => sum + f.amount, 0);

  // Estimated annual interest expense
  const annualInterestExpense = activeLoans.reduce(
    (sum, f) => sum + (f.amount * (f.interestRate || 0)) / 100,
    0
  );
  const monthlyInterestBurden = Math.round(annualInterestExpense / 12);

  const filteredFinancials = financials.filter((f) => {
    const matchesSearch =
      f.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenAdd = () => {
    setFormId(`FIN-0${financials.length + 1}`);
    setFormEntity('');
    setFormType('Loan');
    setFormAmount(1000000);
    setFormInterestRate(11.5);
    setFormTenure(24);
    setFormPurpose('Wheat Stock Financing');
    setFormStatus('Active');
    setErrorMsg('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: FinancialItem) => {
    setEditingItem(item);
    setFormId(item.id);
    setFormEntity(item.entity);
    setFormType(item.type);
    setFormAmount(item.amount);
    setFormInterestRate(item.interestRate);
    setFormTenure(item.tenureMonths || 24);
    setFormPurpose(item.purpose);
    setFormStatus(item.status);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEntity.trim()) {
      setErrorMsg('Please enter financial institution or entity name');
      return;
    }

    if (editingItem) {
      onUpdateFinancial({
        ...editingItem,
        entity: formEntity.trim(),
        type: formType,
        amount: Number(formAmount),
        interestRate: Number(formInterestRate),
        tenureMonths: Number(formTenure),
        purpose: formPurpose.trim(),
        status: formStatus,
      });
      setEditingItem(null);
    } else {
      if (financials.some((f) => f.id.toLowerCase() === formId.toLowerCase())) {
        setErrorMsg(`ID ${formId} already exists! Use a unique ID.`);
        return;
      }

      onAddFinancial({
        id: formId.trim().toUpperCase(),
        entity: formEntity.trim(),
        type: formType,
        amount: Number(formAmount),
        interestRate: formType === 'Deposit' ? 0 : Number(formInterestRate),
        tenureMonths: Number(formTenure),
        startDate: new Date().toISOString().split('T')[0],
        status: formStatus,
        purpose: formPurpose.trim(),
      });
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>💳</span> Financial Loans & Security Deposits
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Institutional bank borrowing, interest rate obligations, and client security deposits
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportToCSV(financials, 'flour_mill_financials')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Instrument</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Total Active Bank Debt</span>
            <div className="text-2xl font-bold text-purple-400 font-mono mt-1">
              {formatPKR(totalLoansAmount)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {activeLoans.length} active credit facilities
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Security Deposits Held</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatPKR(totalDepositsAmount)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {activeDeposits.length} client collateral deposits (0% interest)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Monthly Interest Burden</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {formatPKR(monthlyInterestBurden)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {formatPKR(annualInterestExpense)} / year servicing cost
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by entity name, bank, or loan purpose..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterType('All')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              filterType === 'All' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Instruments
          </button>
          <button
            onClick={() => setFilterType('Loan')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              filterType === 'Loan' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bank Loans
          </button>
          <button
            onClick={() => setFilterType('Deposit')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              filterType === 'Deposit' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposits
          </button>
        </div>
      </div>

      {/* Main Financials Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Principal Amount</th>
                <th className="py-3.5 px-4 text-right">Interest Rate (%)</th>
                <th className="py-3.5 px-4">Tenure / Purpose</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredFinancials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No financial loans or deposits match the search.
                  </td>
                </tr>
              ) : (
                filteredFinancials.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-sans font-bold text-white">
                      {f.entity}
                      <span className="block text-[11px] font-mono text-slate-500 font-normal">
                        {f.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                          f.type === 'Loan'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {f.type === 'Loan' ? <Landmark className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        <span>{f.type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                      <span className={f.type === 'Loan' ? 'text-purple-300' : 'text-emerald-300'}>
                        {formatPKR(f.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {f.interestRate > 0 ? (
                        <span className="font-bold text-amber-400">{f.interestRate}% p.a.</span>
                      ) : (
                        <span className="text-slate-500">0.0%</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      <div>{f.purpose}</div>
                      {f.tenureMonths && (
                        <div className="text-[11px] text-slate-500">
                          {f.tenureMonths} Months tenure
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                          f.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {f.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                        <span>{f.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(f)}
                          title="Edit instrument"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove financial instrument for ${f.entity} (${formatPKR(f.amount)})?`)) {
                              onDeleteFinancial(f.id);
                            }
                          }}
                          title="Delete instrument"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog for Add & Edit Financial Item */}
      {(isAddOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-purple-400" />
                <span>{editingItem ? 'Edit Financial Record' : 'Register Loan / Deposit'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Instrument Type</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const t = e.target.value as FinancialType;
                      setFormType(t);
                      if (t === 'Deposit') setFormInterestRate(0);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Loan">Bank Loan</option>
                    <option value="Deposit">Client Security Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Settled')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Settled">Settled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Entity / Bank / Client Name
                </label>
                <input
                  type="text"
                  value={formEntity}
                  onChange={(e) => setFormEntity(e.target.value)}
                  placeholder="e.g. National Bank or Supreme Bakery"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    min="1000"
                    step="50000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    step="0.1"
                    disabled={formType === 'Deposit'}
                    value={formInterestRate}
                    onChange={(e) => setFormInterestRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono disabled:opacity-50 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formTenure}
                    onChange={(e) => setFormTenure(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Purpose</label>
                  <input
                    type="text"
                    value={formPurpose}
                    onChange={(e) => setFormPurpose(e.target.value)}
                    placeholder="e.g. Working Capital Credit"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition"
                >
                  {editingItem ? 'Update Instrument' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
