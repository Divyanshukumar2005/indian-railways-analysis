import React from 'react';
import { 
  Train, 
  Download, 
  SlidersHorizontal, 
  Sun, 
  Moon, 
  Activity, 
  MapPin, 
  Layers
} from 'lucide-react';
import { NETWORK_STATS, ZONE_COUNT } from '../data/railwayData';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSimulator: () => void;
  onExportCSV: () => void;
  filteredCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenSimulator,
  onExportCSV,
  filteredCount,
  totalCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors bg-white/95 dark:bg-slate-900/95 border-slate-200/90 dark:border-slate-800/80 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-2">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white shadow-md shadow-blue-900/20 ring-1 ring-blue-500/30 shrink-0">
              {/* Modern aerodynamic high-speed locomotive crest */}
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-5 sm:h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v9z" />
                <path d="M4 11h16" />
                <circle cx="8" cy="15" r="1" fill="currentColor" />
                <circle cx="16" cy="15" r="1" fill="currentColor" />
                <path d="m5 19-2 3" />
                <path d="m19 19 2 3" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-heading font-extrabold tracking-wider text-lg sm:text-2xl uppercase text-slate-900 dark:text-white truncate">
                  RailGati
                </span>
                <span className="hidden sm:inline-block text-blue-700 dark:text-cyan-300 text-[11px] font-mono font-semibold tracking-normal px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30 whitespace-nowrap">
                  IR Analytics
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden md:block font-medium truncate">
                Indian Railways timetable analysis
              </p>
            </div>
          </div>

          {/* Center Telemetry Badges (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SERVICES:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-semibold tabular-nums">{filteredCount}</strong>
              <span className="text-slate-400">/ {totalCount}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>STATIONS:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-semibold tabular-nums">{NETWORK_STATS.nStations.toLocaleString()}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>ZONES:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">{ZONE_COUNT} DIVISIONS</strong>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* What-If Simulator Trigger */}
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Open Stoppage Rationalization Simulator"
              aria-label="Open Policy Simulator"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Policy Simulator</span>
              <span className="sm:hidden text-[11px]">Simulate</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="p-1.5 sm:px-2.5 sm:py-1.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              title="Export filtered trains to CSV"
              aria-label="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
