import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Download,
  DollarSign,
  Clock,
  Briefcase,
  CheckCircle,
  X,
} from 'lucide-react';
import { Employee, EmployeeRole, Shift } from '../types';
import { formatPKR, exportToCSV } from '../utils/formatters';

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const nextId = `EMP0${employees.length + 1}`;
  const [formId, setFormId] = useState(nextId);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<EmployeeRole>('Mill Operator');
  const [formShift, setFormShift] = useState<Shift>('Morning');
  const [formSalary, setFormSalary] = useState<number>(45000);
  const [formContact, setFormContact] = useState('+92 300 ');
  const [errorMsg, setErrorMsg] = useState('');

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = selectedShift === 'All' || emp.shift === selectedShift;
    const matchesRole = selectedRole === 'All' || emp.role === selectedRole;
    return matchesSearch && matchesShift && matchesRole;
  });

  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const avgSalary = employees.length > 0 ? Math.round(totalPayroll / employees.length) : 0;

  const handleOpenAdd = () => {
    setFormId(`EMP0${employees.length + 1}`);
    setFormName('');
    setFormRole('Mill Operator');
    setFormShift('Morning');
    setFormSalary(45000);
    setFormContact('+92 300 ');
    setErrorMsg('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormId(emp.id);
    setFormName(emp.name);
    setFormRole(emp.role);
    setFormShift(emp.shift);
    setFormSalary(emp.salary);
    setFormContact(emp.contact || '');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Please enter an employee name');
      return;
    }
    if (!formId.trim()) {
      setErrorMsg('Please enter a valid employee ID');
      return;
    }

    if (editingEmployee) {
      onUpdateEmployee({
        ...editingEmployee,
        name: formName.trim(),
        role: formRole,
        shift: formShift,
        salary: Number(formSalary) || 0,
        contact: formContact.trim(),
      });
      setEditingEmployee(null);
    } else {
      // Check duplicate ID
      if (employees.some((e) => e.id.toLowerCase() === formId.toLowerCase())) {
        setErrorMsg(`Employee ID ${formId} already exists! Use a unique ID.`);
        return;
      }

      onAddEmployee({
        id: formId.trim().toUpperCase(),
        name: formName.trim(),
        role: formRole,
        shift: formShift,
        salary: Number(formSalary) || 0,
        contact: formContact.trim(),
        joinedDate: new Date().toISOString().split('T')[0],
      });
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>👨💼</span> Staff & Labor Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage mill workforce, shifts, operator allocations, and monthly payroll budget
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportToCSV(employees, 'flour_mill_employees')}
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
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Total Workforce</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{employees.length}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Active across 3 shifts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Monthly Payroll Budget</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatPKR(totalPayroll)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Fixed monthly wages</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Average Monthly Wage</span>
            <div className="text-2xl font-bold text-amber-300 font-mono mt-1">
              {formatPKR(avgSalary)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Per operator / staff</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee by name or ID (e.g. EMP01, Ahmed)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shift Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            {['All', 'Morning', 'Evening', 'Night'].map((shift) => (
              <button
                key={shift}
                onClick={() => setSelectedShift(shift)}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  selectedShift === shift
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {shift}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 py-1.5 px-3 rounded-xl focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Roles</option>
            <option value="Mill Operator">Mill Operator</option>
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Head Miller">Head Miller</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Accountant">Accountant</option>
            <option value="Laborer">Laborer</option>
          </select>
        </div>
      </div>

      {/* Main Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4 text-right">Monthly Salary (PKR)</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No employees matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-amber-400">{emp.id}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      {emp.name}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium ${
                          emp.shift === 'Morning'
                            ? 'bg-amber-500/10 text-amber-300'
                            : emp.shift === 'Evening'
                            ? 'bg-blue-500/10 text-blue-300'
                            : 'bg-purple-500/10 text-purple-300'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{emp.shift} Shift</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {formatPKR(emp.salary)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {emp.contact || '--'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit employee"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(`Are you sure you want to remove employee ${emp.name} (${emp.id})?`)
                            ) {
                              onDeleteEmployee(emp.id);
                            }
                          }}
                          title="Delete employee"
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

      {/* Modal / Dialog for Add & Edit Employee */}
      {(isAddOpen || editingEmployee) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{editingEmployee ? 'Edit Employee Details' : 'Add New Mill Staff Member'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingEmployee(null);
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
              <div>
                <label className="block text-slate-400 font-medium mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formId}
                  disabled={Boolean(editingEmployee)}
                  onChange={(e) => setFormId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono disabled:opacity-60 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as EmployeeRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mill Operator">Mill Operator</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Head Miller">Head Miller</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Laborer">Laborer</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Shift</label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value as Shift)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Salary (PKR/month)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="+92 300 ..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition"
                >
                  {editingEmployee ? 'Update Details' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
