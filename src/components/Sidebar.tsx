import React from 'react';
import {
  LayoutDashboard,
  Users,
  Wheat,
  Building2,
  Landmark,
  Sparkles,
  SlidersHorizontal,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export type NavigationTab =
  | 'Dashboard Overview'
  | 'Employee Details'
  | 'Material & Inventory'
  | 'Client Management'
  | 'Loans & Deposits'
  | 'AI Studio Analytics'
  | 'Milling & Blend Lab';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  employeeCount: number;
  materialCount: number;
  clientCount: number;
  financialCount: number;
  hasMoistureWarning: boolean;
  hasCreditWarning: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  employeeCount,
  materialCount,
  clientCount,
  financialCount,
  hasMoistureWarning,
  hasCreditWarning,
}) => {
  const menuItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number | string;
    alert?: boolean;
    tag?: string;
  }[] = [
    {
      id: 'Dashboard Overview',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'Employee Details',
      label: 'Employee Details',
      icon: Users,
      count: employeeCount,
    },
    {
      id: 'Material & Inventory',
      label: 'Material & Inventory',
      icon: Wheat,
      count: `${materialCount} B`,
      alert: hasMoistureWarning,
    },
    {
      id: 'Client Management',
      label: 'Client Management',
      icon: Building2,
      count: clientCount,
      alert: hasCreditWarning,
    },
    {
      id: 'Loans & Deposits',
      label: 'Loans & Deposits',
      icon: Landmark,
      count: financialCount,
    },
    {
      id: 'AI Studio Analytics',
      label: 'AI Studio Analytics',
      icon: Sparkles,
      tag: 'GenAI 3.8',
    },
    {
      id: 'Milling & Blend Lab',
      label: 'Milling & Blend Lab',
      icon: SlidersHorizontal,
      tag: 'Sim',
    },
  ];

  return (
    <aside className="w-full lg:w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Navigation Section title */}
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Factory Modules
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">Live ERP</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.alert && (
                      <span title="Operational warning flagged" className="flex items-center">
                        <AlertTriangle className={`w-3.5 h-3.5 ${isActive ? 'text-red-950' : 'text-amber-400 animate-pulse'}`} />
                      </span>
                    )}

                    {item.count !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                          isActive
                            ? 'bg-slate-900/20 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}

                    {item.tag && (
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-slate-950 text-amber-300'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}

                    {!isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Real-time Mill Status Info Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Silo Monitoring
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Operational</span>
          </div>

          <div className="space-y-1 text-slate-400 text-[11px]">
            <div className="flex justify-between">
              <span>Grain Intake Feed:</span>
              <span className="text-slate-200 font-mono">Continuous</span>
            </div>
            <div className="flex justify-between">
              <span>Grinding Temp:</span>
              <span className="text-slate-200 font-mono">34.2 °C (Normal)</span>
            </div>
            <div className="flex justify-between">
              <span>Shift Supervisor:</span>
              <span className="text-slate-200">Ahmed Khan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span>Enterprise Mill ID</span>
          <span className="font-mono text-slate-300">MILL-PK-04</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Automated conditioning, flour extraction & ledger accounting synchronized with Gemini AI.
        </p>
      </div>
    </aside>
  );
};
