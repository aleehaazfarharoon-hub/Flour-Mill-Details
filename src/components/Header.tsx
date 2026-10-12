import React from 'react';
import { Factory, Sparkles, RefreshCw, Download, ShieldCheck, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onResetData: () => void;
  onExportBackup: () => void;
  hasApiKey: boolean;
  totalWheatStock: number;
  activeStaffCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onResetData,
  onExportBackup,
  hasApiKey,
  totalWheatStock,
  activeStaffCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Factory identity */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 font-bold">
            <Factory className="w-6 h-6 text-slate-950" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                Enterprise Flour Mill Management System
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Industrial V3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Processing &middot; Roller Mills Operating &middot; Active Staff: <span className="text-slate-200 font-medium">{activeStaffCount}</span> &middot; Raw Wheat: <span className="text-amber-300 font-medium">{totalWheatStock.toFixed(0)} Tons</span>
            </p>
          </div>
        </div>

        {/* Status badges & actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Gemini AI status badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
            hasApiKey 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Advisory:</span>
            <span className="font-semibold">
              {hasApiKey ? 'Gemini 3.8 Flash Ready' : 'Server Engine Active'}
            </span>
            {hasApiKey ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportBackup}
              title="Download JSON Snapshot"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>
            <button
              onClick={onResetData}
              title="Reset factory sample records"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
