import React from 'react';
import { Gauge, Check } from 'lucide-react';
import { TrainService } from '../types';
import { getCategoryStats } from '../utils/analytics';

interface SpeedByCategoryChartProps {
  trains: TrainService[];
  allTrainsWithoutCat: TrainService[];
  selectedCategory: string;
  onSelectCategory: (catIdx: string) => void;
}

const CATEGORY_COLORS = [
  'from-cyan-500 to-blue-600',       // Premium
  'from-amber-500 to-orange-600',    // Express & Superfast
  'from-emerald-500 to-teal-600',    // Passenger & Suburban
  'from-purple-500 to-indigo-600',   // Heritage / Toy
];

const CATEGORY_BORDER_COLORS = [
  'hover:border-cyan-400 dark:hover:border-cyan-500/50',
  'hover:border-amber-400 dark:hover:border-amber-500/50',
  'hover:border-emerald-400 dark:hover:border-emerald-500/50',
  'hover:border-purple-400 dark:hover:border-purple-500/50',
];

export const SpeedByCategoryChart: React.FC<SpeedByCategoryChartProps> = ({
  trains,
  allTrainsWithoutCat,
  selectedCategory,
  onSelectCategory,
}) => {
  const stats = getCategoryStats(trains, allTrainsWithoutCat);
  const maxSpd = 85;
  const active = stats.filter(s => s.count > 0).map(s => s.avgSpd);
  const speedGap = active.length ? Math.max(...active) - Math.min(...active) : 0;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-xs text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            <h3 className="font-heading font-bold text-lg tracking-wide uppercase text-slate-900 dark:text-white">
              Speed by Train Category
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Click row to filter</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-sans">
          Average end-to-end scheduled speed (km/h). Passenger services run slowest and suffer from high stoppage frequency.
        </p>

        <div className="fill-list flex flex-col gap-3 flex-1 my-1">
          {stats.map((cat, idx) => {
            const isSelected = selectedCategory === String(cat.index);
            const barWidth = Math.min(100, Math.max(5, (cat.avgSpd / maxSpd) * 100));

            return (
              <div
                key={cat.index}
                onClick={() => onSelectCategory(isSelected ? '' : String(cat.index))}
                className={`group p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-50/70 border-amber-500 ring-1 ring-amber-400/40 dark:bg-slate-800/90 dark:border-amber-500'
                    : `bg-slate-50/70 border-slate-200/90 ${CATEGORY_BORDER_COLORS[idx]} hover:bg-slate-100/70 dark:bg-slate-950/60 dark:border-slate-800/80 dark:hover:bg-slate-800/50`
                }`}
              >
                {/* Header row for item */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition truncate">
                      {cat.label}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40">
                        <Check className="w-2.5 h-2.5" /> Selected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1 text-right font-mono">
                    <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                      {cat.count ? cat.avgSpd.toFixed(1) : '-'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">km/h</span>
                  </div>
                </div>

                {/* Bar track and fill */}
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden mb-2 relative">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_COLORS[idx]} transition-all duration-500 ease-out`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Sub metrics */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>
                    Stops: <strong className="text-slate-700 dark:text-slate-300">{cat.count ? cat.avgHalts100.toFixed(1) : '-'}</strong> / 100km
                  </span>
                  <span>
                    AC: <strong className="text-slate-700 dark:text-slate-300">{cat.count ? `${Math.round(cat.acPercent)}%` : '-'}</strong>
                  </span>
                  <span>
                    Services: <strong className="text-slate-800 dark:text-slate-200">{cat.count.toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
        <span>Fastest vs Slowest delta:</span>
        <span className="text-amber-700 dark:text-amber-400 font-bold">{speedGap.toFixed(1)} km/h gap</span>
      </div>
    </div>
  );
};
