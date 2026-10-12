import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Download,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Edit,
  Trash2,
  X,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Client } from '../types';
import { formatPKR, exportToCSV } from '../utils/formatters';

interface ClientManagementProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Good' | 'HighRisk'>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [transactingClient, setTransactingClient] = useState<Client | null>(null);

  // Transaction form state (Payment or Invoice)
  const [txType, setTxType] = useState<'Payment' | 'Invoice'>('Payment');
  const [txAmount, setTxAmount] = useState<number>(50000);
  const [txNote, setTxNote] = useState('');

  // Add/Edit Form State
  const nextClientId = `C0${clients.length + 1}`;
  const [formId, setFormId] = useState(nextClientId);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('0300-');
  const [formEmail, setFormEmail] = useState('');
  const [formCity, setFormCity] = useState('Lahore');
  const [formCreditLimit, setFormCreditLimit] = useState<number>(500000);
  const [formBalance, setFormBalance] = useState<number>(0);
  const [formDeposit, setFormDeposit] = useState<number>(100000);
  const [errorMsg, setErrorMsg] = useState('');

  const totalOutstanding = clients.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalCreditLimit = clients.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalSecurityDeposits = clients.reduce((sum, c) => sum + (c.securityDepositHeld || 0), 0);

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.includes(searchTerm);

    const utilization = c.creditLimit > 0 ? c.outstandingBalance / c.creditLimit : 0;
    const matchesRisk =
      riskFilter === 'All' ||
      (riskFilter === 'HighRisk' && utilization >= 0.8) ||
      (riskFilter === 'Good' && utilization < 0.8);

    return matchesSearch && matchesRisk;
  });

  const handleOpenAdd = () => {
    setFormId(`C0${clients.length + 1}`);
    setFormName('');
    setFormContact('0300-');
    setFormEmail('');
    setFormCity('Lahore');
    setFormCreditLimit(500000);
    setFormBalance(0);
    setFormDeposit(100000);
    setErrorMsg('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormId(client.clientId);
    setFormName(client.name);
    setFormContact(client.contact);
    setFormEmail(client.email || '');
    setFormCity(client.city || 'Lahore');
    setFormCreditLimit(client.creditLimit);
    setFormBalance(client.outstandingBalance);
    setFormDeposit(client.securityDepositHeld || 0);
    setErrorMsg('');
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Please enter client business name');
      return;
    }

    const utilization = formCreditLimit > 0 ? formBalance / formCreditLimit : 0;
    const status: Client['status'] =
      utilization >= 1.0 ? 'Credit Exceeded' : utilization >= 0.8 ? 'High Utilization' : 'Good Standing';

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        name: formName.trim(),
        contact: formContact.trim(),
        email: formEmail.trim(),
        city: formCity.trim(),
        creditLimit: Number(formCreditLimit),
        outstandingBalance: Number(formBalance),
        securityDepositHeld: Number(formDeposit),
        status,
      });
      setEditingClient(null);
    } else {
      if (clients.some((c) => c.clientId.toLowerCase() === formId.toLowerCase())) {
        setErrorMsg(`Client ID ${formId} already exists! Use a unique ID.`);
        return;
      }

      onAddClient({
        clientId: formId.trim().toUpperCase(),
        name: formName.trim(),
        contact: formContact.trim(),
        email: formEmail.trim(),
        city: formCity.trim(),
        creditLimit: Number(formCreditLimit),
        outstandingBalance: Number(formBalance),
        securityDepositHeld: Number(formDeposit),
        status,
        lastOrderDate: new Date().toISOString().split('T')[0],
      });
      setIsAddOpen(false);
    }
  };

  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactingClient || txAmount <= 0) return;

    let updatedBalance = transactingClient.outstandingBalance;
    if (txType === 'Payment') {
      updatedBalance = Math.max(0, updatedBalance - txAmount);
    } else {
      updatedBalance = updatedBalance + txAmount;
    }

    const utilization =
      transactingClient.creditLimit > 0 ? updatedBalance / transactingClient.creditLimit : 0;
    const status: Client['status'] =
      utilization >= 1.0 ? 'Credit Exceeded' : utilization >= 0.8 ? 'High Utilization' : 'Good Standing';

    onUpdateClient({
      ...transactingClient,
      outstandingBalance: updatedBalance,
      status,
      lastOrderDate: new Date().toISOString().split('T')[0],
    });

    setTransactingClient(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>🤝</span> Client & Ledger Accounts
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Accounts receivable, credit limits, ledger balance tracking, and risk exposure
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportToCSV(clients, 'flour_mill_clients')}
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
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Total Outstanding Balance</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {formatPKR(totalOutstanding)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Receivables from bakeries & traders</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Total Credit Line Extended</span>
            <div className="text-2xl font-bold text-blue-400 font-mono mt-1">
              {formatPKR(totalCreditLimit)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {totalCreditLimit > 0
                ? `${((totalOutstanding / totalCreditLimit) * 100).toFixed(1)}% utilized overall`
                : 'No credit'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Security Deposits Held</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatPKR(totalSecurityDeposits)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Cash collateral protection</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
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
            placeholder="Search by client ID, bakery/trader name, phone, or city..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setRiskFilter('All')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              riskFilter === 'All' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Clients
          </button>
          <button
            onClick={() => setRiskFilter('HighRisk')}
            className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              riskFilter === 'HighRisk' ? 'bg-red-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>High Risk (&gt;80%)</span>
          </button>
          <button
            onClick={() => setRiskFilter('Good')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              riskFilter === 'Good' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Good Standing
          </button>
        </div>
      </div>

      {/* Main Client Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Client ID</th>
                <th className="py-3.5 px-4">Client / Enterprise Name</th>
                <th className="py-3.5 px-4">Contact & City</th>
                <th className="py-3.5 px-4 text-right">Credit Limit</th>
                <th className="py-3.5 px-4 text-right">Outstanding Balance</th>
                <th className="py-3.5 px-4 text-right">Security Deposit</th>
                <th className="py-3.5 px-4">Credit Utilization</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No clients found for this search or filter.
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => {
                  const utilPercent =
                    c.creditLimit > 0 ? Math.round((c.outstandingBalance / c.creditLimit) * 100) : 0;
                  const isHighRisk = utilPercent >= 80;

                  return (
                    <tr key={c.clientId} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-amber-400">{c.clientId}</td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">
                        {c.name}
                        {c.email && (
                          <span className="block text-[11px] font-mono text-slate-400 font-normal">
                            {c.email}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">
                        <div>{c.contact}</div>
                        <div className="text-[11px] text-slate-400">{c.city}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300">
                        {formatPKR(c.creditLimit)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                        <span className={isHighRisk ? 'text-amber-400' : 'text-slate-100'}>
                          {formatPKR(c.outstandingBalance)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-400">
                        {c.securityDepositHeld ? formatPKR(c.securityDepositHeld) : 'PKR 0'}
                      </td>
                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">{utilPercent}% used</span>
                            <span className="text-slate-500 font-sans">
                              {formatPKR(Math.max(0, c.creditLimit - c.outstandingBalance))} left
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                utilPercent >= 90
                                  ? 'bg-red-500'
                                  : utilPercent >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, utilPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                            isHighRisk
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isHighRisk ? (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>{utilPercent >= 100 ? 'Limit Exceeded' : 'High Util'}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Good</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setTransactingClient(c);
                              setTxType('Payment');
                              setTxAmount(50000);
                              setTxNote('');
                            }}
                            title="Record Payment / Invoice"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/20 transition flex items-center gap-1"
                          >
                            <span>Ledger</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Edit client"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete client account ${c.name} (${c.clientId}) with PKR ${c.outstandingBalance} balance?`
                                )
                              ) {
                                onDeleteClient(c.clientId);
                              }
                            }}
                            title="Delete client"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment / Invoice Modal */}
      {transactingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Record Ledger Transaction</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {transactingClient.name} ({transactingClient.clientId})
                </p>
              </div>
              <button
                onClick={() => setTransactingClient(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs flex justify-between font-mono">
              <span className="text-slate-400">Current Outstanding:</span>
              <span className="text-amber-400 font-bold">
                {formatPKR(transactingClient.outstandingBalance)}
              </span>
            </div>

            <form onSubmit={handleRecordTransaction} className="space-y-4 text-xs">
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTxType('Payment')}
                  className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                    txType === 'Payment'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Customer Payment (Reduces Balance)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('Invoice')}
                  className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                    txType === 'Invoice'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Flour Invoice (Increases Balance)</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Amount ({txType === 'Payment' ? 'Received in PKR' : 'Billed in PKR'})
                </label>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Reference / Note</label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  placeholder="e.g. Bank Transfer Ref #9928 / 50 bags Maida dispatched"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransactingClient(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-bold shadow-md transition ${
                    txType === 'Payment'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  Post {txType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {(isAddOpen || editingClient) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{editingClient ? 'Edit Client Account' : 'Register New Commercial Client'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingClient(null);
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

            <form onSubmit={handleSaveClient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Client ID</label>
                  <input
                    type="text"
                    value={formId}
                    disabled={Boolean(editingClient)}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono disabled:opacity-60 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">City / Region</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Lahore, Rawalpindi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Business Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Supreme Bakery & Confectionery"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="orders@bakery.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Credit Limit (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Current Balance (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formBalance}
                    onChange={(e) => setFormBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Deposit Collateral</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition"
                >
                  {editingClient ? 'Update Client' : 'Save Client Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
