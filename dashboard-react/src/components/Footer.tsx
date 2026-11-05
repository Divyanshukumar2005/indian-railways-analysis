import React from 'react';
import { Database, Code2, Train, Cpu, ShieldCheck } from 'lucide-react';
import { NETWORK_STATS } from '../data/railwayData';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/90 py-10 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top summary row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Train className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm tracking-wide text-slate-900 dark:text-white uppercase">
                RailGati // Indian Railways Analysis
              </span>
              <p className="text-[11px] text-slate-500">
                National Railway Timetable Analytics & Empirical Transit Infrastructure Engineering
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 flex items-center gap-1 shadow-xs">
              <Database className="w-3 h-3 text-blue-600 dark:text-cyan-400" /> {NETWORK_STATS.totalServices.toLocaleString()} Services
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 flex items-center gap-1 shadow-xs">
              <Cpu className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {NETWORK_STATS.nStations.toLocaleString()} Stations
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-800 dark:text-amber-400 flex items-center gap-1 shadow-xs">
              <Code2 className="w-3 h-3 text-amber-600 dark:text-amber-400" /> React 19 + TypeScript + Tailwind
            </span>
          </div>
        </div>

        {/* Methodology Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] leading-relaxed font-sans">
          <div>
            <h5 className="font-mono text-slate-800 dark:text-slate-300 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Data Provenance & Cleaning
            </h5>
            <p className="text-slate-600 dark:text-slate-400">
              Dataset parsed from the Indian Railways National Timetable (CC0 public open transit data). Cleaned via Pandas: removed train runs without a valid distance or duration, resolved zone associations from originating station codes, and purged placeholder dummy junctions.
            </p>
          </div>

          <div>
            <h5 className="font-mono text-slate-800 dark:text-slate-300 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Stoppage & AC Definitions
            </h5>
            <p className="text-slate-600 dark:text-slate-400">
              A halt represents a timetable stop where arrival and departure times diverge; origin and terminus count as halts (+2 halts per train, averaging {NETWORK_STATS.avgHaltsPer100km} halts/100km network-wide). AC denotes availability of 1A, 2A, 3A, or AC Chair Car. Figures describe service supply distribution across the national network.
            </p>
          </div>
        </div>

        {/* Portfolio / CV Signature */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
          <span>
            Data analytics portfolio project | Indian Railways timetable analysis
          </span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            RailGati Dashboard &copy; {new Date().getFullYear()}
          </span>
        </div>

      </div>
    </footer>
  );
};
