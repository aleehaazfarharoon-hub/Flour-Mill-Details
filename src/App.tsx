/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { EmployeeManagement } from './components/EmployeeManagement';
import { MaterialInventory } from './components/MaterialInventory';
import { ClientManagement } from './components/ClientManagement';
import { FinancialManagement } from './components/FinancialManagement';
import { MillingBlendLab } from './components/MillingBlendLab';
import { AiAnalytics } from './components/AiAnalytics';
import {
  INITIAL_EMPLOYEES,
  INITIAL_MATERIALS,
  INITIAL_CLIENTS,
  INITIAL_FINANCIALS,
} from './data/initialData';
import { Employee, Material, Client, FinancialItem } from './types';
import { checkServerStatus } from './services/geminiService';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('Dashboard Overview');
  const [aiPresetPrompt, setAiPresetPrompt] = useState<string>(
    'Analyze my raw material quality and financial risk based on the current records.'
  );

  // Server & AI Status
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Data States with LocalStorage Persistence
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('flour_mill_employees');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const saved = localStorage.getItem('flour_mill_materials');
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('flour_mill_clients');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [financials, setFinancials] = useState<FinancialItem[]>(() => {
    try {
      const saved = localStorage.getItem('flour_mill_financials');
      return saved ? JSON.parse(saved) : INITIAL_FINANCIALS;
    } catch {
      return INITIAL_FINANCIALS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flour_mill_employees', JSON.stringify(employees));
    } catch (e) {
      console.error(e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('flour_mill_materials', JSON.stringify(materials));
    } catch (e) {
      console.error(e);
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem('flour_mill_clients', JSON.stringify(clients));
    } catch (e) {
      console.error(e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('flour_mill_financials', JSON.stringify(financials));
    } catch (e) {
      console.error(e);
    }
  }, [financials]);

  // Check server Gemini connection on mount
  useEffect(() => {
    checkServerStatus().then((status) => {
      setHasApiKey(status.hasApiKey);
    });
  }, []);

  // Handlers for Employees
  const handleAddEmployee = (emp: Employee) => {
    setEmployees((prev) => [emp, ...prev]);
  };
  const handleUpdateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
  };
  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Handlers for Materials
  const handleAddMaterial = (mat: Material) => {
    setMaterials((prev) => [mat, ...prev]);
  };
  const handleUpdateMaterial = (mat: Material) => {
    setMaterials((prev) => prev.map((m) => (m.batchId === mat.batchId ? mat : m)));
  };
  const handleDeleteMaterial = (batchId: string) => {
    setMaterials((prev) => prev.filter((m) => m.batchId !== batchId));
  };

  // Handlers for Clients
  const handleAddClient = (client: Client) => {
    setClients((prev) => [client, ...prev]);
  };
  const handleUpdateClient = (client: Client) => {
    setClients((prev) => prev.map((c) => (c.clientId === client.clientId ? client : c)));
  };
  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.clientId !== clientId));
  };

  // Handlers for Financials
  const handleAddFinancial = (item: FinancialItem) => {
    setFinancials((prev) => [item, ...prev]);
  };
  const handleUpdateFinancial = (item: FinancialItem) => {
    setFinancials((prev) => prev.map((f) => (f.id === item.id ? item : f)));
  };
  const handleDeleteFinancial = (id: string) => {
    setFinancials((prev) => prev.filter((f) => f.id !== id));
  };

  // Reset to initial factory data
  const handleResetData = () => {
    if (
      confirm(
        'Reset all mill data back to default initial records? This will restore initial staff, grain batches, clients, and loan records.'
      )
    ) {
      setEmployees(INITIAL_EMPLOYEES);
      setMaterials(INITIAL_MATERIALS);
      setClients(INITIAL_CLIENTS);
      setFinancials(INITIAL_FINANCIALS);
      localStorage.removeItem('flour_mill_employees');
      localStorage.removeItem('flour_mill_materials');
      localStorage.removeItem('flour_mill_clients');
      localStorage.removeItem('flour_mill_financials');
    }
  };

  // Export full backup
  const handleExportBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      employees,
      materials,
      clients,
      financials,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', jsonStr);
    dlAnchor.setAttribute('download', `flour_mill_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // Navigation to AI with prompt
  const handleNavigateToAi = (prompt?: string) => {
    if (prompt) {
      setAiPresetPrompt(prompt);
    }
    setCurrentTab('AI Studio Analytics');
  };

  // Derived alert badges
  const hasMoistureWarning = materials.some(
    (m) => m.category === 'Raw Wheat' && m.moisturePercent > 13.5
  );
  const hasCreditWarning = clients.some(
    (c) => c.creditLimit > 0 && c.outstandingBalance / c.creditLimit >= 0.8
  );
  const totalWheatStock = materials
    .filter((m) => m.category === 'Raw Wheat')
    .reduce((sum, m) => sum + m.stockTons, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onResetData={handleResetData}
        onExportBackup={handleExportBackup}
        hasApiKey={hasApiKey}
        totalWheatStock={totalWheatStock}
        activeStaffCount={employees.length}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          employeeCount={employees.length}
          materialCount={materials.length}
          clientCount={clients.length}
          financialCount={financials.length}
          hasMoistureWarning={hasMoistureWarning}
          hasCreditWarning={hasCreditWarning}
        />

        {/* Dynamic Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'Dashboard Overview' && (
            <DashboardOverview
              employees={employees}
              materials={materials}
              clients={clients}
              financials={financials}
              onNavigateToAi={handleNavigateToAi}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'Employee Details' && (
            <EmployeeManagement
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {currentTab === 'Material & Inventory' && (
            <MaterialInventory
              materials={materials}
              onAddMaterial={handleAddMaterial}
              onUpdateMaterial={handleUpdateMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onNavigateToBlendLab={() => setCurrentTab('Milling & Blend Lab')}
            />
          )}

          {currentTab === 'Client Management' && (
            <ClientManagement
              clients={clients}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {currentTab === 'Loans & Deposits' && (
            <FinancialManagement
              financials={financials}
              onAddFinancial={handleAddFinancial}
              onUpdateFinancial={handleUpdateFinancial}
              onDeleteFinancial={handleDeleteFinancial}
            />
          )}

          {currentTab === 'AI Studio Analytics' && (
            <AiAnalytics
              materials={materials}
              clients={clients}
              financials={financials}
              employees={employees}
              initialPrompt={aiPresetPrompt}
            />
          )}

          {currentTab === 'Milling & Blend Lab' && (
            <MillingBlendLab
              materials={materials}
              onConsultAi={handleNavigateToAi}
            />
          )}
        </main>
      </div>
    </div>
  );
}
