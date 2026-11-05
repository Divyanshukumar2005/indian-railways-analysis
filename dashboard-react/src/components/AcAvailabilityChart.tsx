import React from 'react';
import { Wind, AlertCircle, Check } from 'lucide-react';
import { TrainService } from '../types';
import { getBandStats } from '../utils/analytics';
import { TRAINS_DATA } from '../data/railwayData';

const LONG_HAUL = TRAINS_DATA.filter(t => t.dist >= 700);
const longHaulAcShare = LONG_HAUL.length ? (100 * LONG_HAUL.filter(t => t.ac === 1).length) / LONG_HAUL.length : 0;

interface AcAvailabilityChartProps {
  trains: TrainService[];
  allTrainsWithoutBand: TrainService[];
  selectedBand: string;
  onSelectBand: (bandIdx: string) => void;
}

export const AcAvailabilityChart: React.FC<AcAvailabilityChartProps> = ({
  trains,
  allTrainsWithoutBand,
  selectedBand,
  onSelectBand,
}) => {
  const bandStats = getBandStats(trains, allTrainsWithoutBand);

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-xs text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-heading font-bold text-lg tracking-wide uppercase text-slate-900 dark:text-white">
              AC Availability by Distance Band
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Click band to filter</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-sans">
          Share of services offering 1A/2A/3A/CC. The 300–700 km intercity corridor represents the major coach deficit.
        </p>

        <div className="fill-list flex flex-col gap-3 flex-1 my-1">
          {bandStats.map((band) => {
            const isSelected = selectedBand === String(band.index);
            const isCriticalGap = band.index === 2; // 300-700 km

            return (
              <div
                key={band.index}
                onClick={() => onSelectBand(isSelected ? '' : String(band.index))}
                className={`group p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-400/40 dark:bg-slate-800/90 dark:border-blue-500'
                    : 'bg-slate-50/70 border-slate-200/90 hover:border-blue-400 hover:bg-slate-100/70 dark:bg-slate-950/60 dark:border-slate-800/80 dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition">
                      {band.label}
                    </span>
                    {isCriticalGap && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40">
                        <AlertCircle className="w-2.5 h-2.5" /> High Deficit
                      </span>
                    )}
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40">
                        <Check className="w-2.5 h-2.5" /> Filtered
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                      {band.count ? `${Math.round(band.acPercent)}%` : '-'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">AC share</span>
                  </div>
                </div>

                {/* Stacked bar: AC (blue) vs Non-AC (slate) */}
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden mb-2 flex">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                    style={{ width: `${band.acPercent}%` }}
                    title={`AC: ${band.acCount} services`}
                  />
                  <div
                    className="h-full bg-slate-300 dark:bg-slate-700/80 transition-all duration-500"
                    style={{ width: `${100 - band.acPercent}%` }}
                    title={`Non-AC: ${band.nonAcCount} services`}
                  />
                </div>

                {/* Sub details */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>
                    AC: <strong className="text-blue-700 dark:text-blue-300">{band.acCount.toLocaleString()}</strong> runs
                  </span>
                  <span>
                    Non-AC: <strong className="text-amber-700 dark:text-amber-400">{band.nonAcCount.toLocaleString()}</strong>
                  </span>
                  <span>
                    Avg: <strong className="text-slate-700 dark:text-slate-300">{band.count ? `${band.avgSpd.toFixed(1)} km/h` : '-'}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
        <span>Long-haul (700 km and above) AC share:</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{longHaulAcShare.toFixed(1)}%</span>
      </div>
    </div>
  );
};
