import React from 'react';
import { 
  Gauge, 
  Wind, 
  Users, 
  GitMerge, 
  TrendingUp, 
  TrendingDown, 
  TrainTrack
} from 'lucide-react';
import { CUMULATIVE_HALTS } from '../data/railwayData';

interface KpiStripProps {
  totalCount: number;
  filteredCount: number;
  avgSpeed: number;
  networkAvgSpeed: number;
  acPercent: number;
  nonAcCount: number;
  passengerPercent: number;
  passengerAvgSpeed: number;
}

export const KpiStrip: React.FC<KpiStripProps> = ({
  totalCount,
  filteredCount,
  avgSpeed,
  networkAvgSpeed,
  acPercent,
  nonAcCount,
  passengerPercent,
  passengerAvgSpeed,
}) => {
  const speedDiff = avgSpeed - networkAvgSpeed;
  const isAboveSpeed = speedDiff >= 0;
  const top10Concentration = CUMULATIVE_HALTS[10] ? CUMULATIVE_HALTS[10].toFixed(1) : '51.5';

  return (
    <section aria-label="Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      
      {/* 1. Services Volume */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Timetable Services</span>
          <TrainTrack className="w-4 h-4 text-amber-600 dark:text-amber-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-heading font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white">
            {filteredCount.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">trains</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 font-mono">
          <span>Total Network:</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">{totalCount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* 2. Scheduled Speed */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Avg Scheduled Speed</span>
          <Gauge className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-heading font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white">
            {filteredCount ? avgSpeed.toFixed(1) : '-'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">km/h</span>
        </div>
        <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 font-mono">
          <span className="text-slate-500 dark:text-slate-400">Network avg ({networkAvgSpeed.toFixed(1)}):</span>
          <span className={`inline-flex items-center gap-0.5 font-semibold ${isAboveSpeed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
            {isAboveSpeed ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isAboveSpeed ? `+${speedDiff.toFixed(1)}` : speedDiff.toFixed(1)}
          </span>
        </div>
      </div>

      {/* 3. AC Availability */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Services with AC</span>
          <Wind className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-heading font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white">
            {filteredCount ? `${Math.round(acPercent)}%` : '-'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">equipped</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 font-mono">
          <span>Non-AC Deficit:</span>
          <span className="text-amber-700 dark:text-amber-400/90 font-medium tabular-nums">{nonAcCount.toLocaleString('en-IN')} runs</span>
        </div>
      </div>

      {/* 4. Passenger & Suburban Share */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Passenger / Suburban</span>
          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-heading font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white">
            {filteredCount ? `${Math.round(passengerPercent)}%` : '-'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">of volume</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 font-mono">
          <span>Local Speed:</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium tabular-nums">{filteredCount ? `${passengerAvgSpeed.toFixed(1)} km/h` : '-'}</span>
        </div>
      </div>

      {/* 5. Terminal Bottleneck Concentration */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Top 10% Junctions</span>
          <GitMerge className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-heading font-extrabold tabular-nums tracking-tight text-purple-700 dark:text-purple-300">
            {top10Concentration}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">of all halts</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 font-mono">
          <span>Pareto Skew:</span>
          <span className="text-slate-800 dark:text-slate-300 font-medium">High Load</span>
        </div>
      </div>

    </section>
  );
};
