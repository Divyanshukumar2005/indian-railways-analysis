import React from 'react';
import { Layers, Check } from 'lucide-react';
import { TrainService } from '../types';
import { getZoneMetrics } from '../utils/analytics';

interface ZonePerformanceChartProps {
  zones: string[];
  allTrainsWithoutZone: TrainService[];
  networkAvgSpeed: number;
  selectedZone: string;
  onSelectZone: (zone: string) => void;
}

export const ZonePerformanceChart: React.FC<ZonePerformanceChartProps> = ({
  zones,
  allTrainsWithoutZone,
  networkAvgSpeed,
  selectedZone,
  onSelectZone,
}) => {
  const zoneMetrics = getZoneMetrics(zones, allTrainsWithoutZone);
  const maxSpd = 75;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-xs text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <h3 className="font-heading font-bold text-lg tracking-wide uppercase text-slate-900 dark:text-white">
              Speed by Railway Zone (16 Divisions)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Sorted: Slowest first</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed font-sans">
          Zones below the national benchmark of <strong className="text-amber-700 dark:text-amber-400">{networkAvgSpeed.toFixed(1)} km/h</strong> are bottlenecked by heavy local passenger stoppage patterns (67–74% passenger fleet share).
        </p>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-3 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
            Below Benchmark (&lt;{networkAvgSpeed.toFixed(1)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 dark:bg-cyan-500"></span>
            At / Above Benchmark
          </span>
        </div>

        {/* Scrollable list of 16 zones */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {zoneMetrics.map((item) => {
            const isSelected = selectedZone === item.zone;
            const isBelowAvg = item.avgSpeed < networkAvgSpeed;
            const barWidth = Math.min(100, Math.max(5, (item.avgSpeed / maxSpd) * 100));

            return (
              <div
                key={item.zone}
                onClick={() => onSelectZone(isSelected ? '' : item.zone)}
                className={`group p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-400 dark:bg-slate-800 dark:border-cyan-500 dark:ring-cyan-500/40'
                    : 'bg-slate-50/70 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/70 dark:bg-slate-950/60 dark:border-slate-800/80 dark:hover:border-slate-700 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                      Zone {item.zone}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      ({item.totalServices} trains, {Math.round(item.passengerPercent)}% passenger)
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-cyan-500/20 dark:text-cyan-300">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 font-mono">
                    <span className={`text-sm font-bold tabular-nums ${isBelowAvg ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-cyan-400'}`}>
                      {item.avgSpeed.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">km/h</span>
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isBelowAvg ? 'bg-amber-500' : 'bg-blue-600 dark:bg-cyan-500'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
        <span>Slowest corridor zone:</span>
        <span className="text-amber-700 dark:text-amber-400 font-bold">SECR (33.2 km/h)</span>
      </div>
    </div>
  );
};
