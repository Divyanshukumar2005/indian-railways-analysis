import React, { useState } from 'react';
import { Clock, Info } from 'lucide-react';
import { TrainService } from '../types';
import { getHourlyDistribution } from '../utils/analytics';
import { TRAINS_DATA } from '../data/railwayData';

const peakCount = TRAINS_DATA.filter(t => t.hr >= 5 && t.hr <= 8).length;

interface DepartureHistogramProps {
  trains: TrainService[];
}

export const DepartureHistogram: React.FC<DepartureHistogramProps> = ({ trains }) => {
  const [hoveredHour, setHoveredHour] = useState<{ hour: number; count: number } | null>(null);
  const { hours, max, morningRushPercent, nightDropPercent } = getHourlyDistribution(trains);

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-xs text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-heading font-bold text-lg tracking-wide uppercase text-slate-900 dark:text-white">
              When Services Depart (24-Hour Diurnal Cycle)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Departures by hour</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-sans">
          Departures cluster in the morning: <strong className="text-emerald-700 dark:text-emerald-400">{morningRushPercent.toFixed(1)}%</strong> depart between 05:00–08:59, whereas only <strong className="text-slate-700 dark:text-slate-300">{nightDropPercent.toFixed(1)}%</strong> depart 00:00–03:59.
        </p>

        {/* Hover readout indicator */}
        <div className="h-6 mb-2 flex items-center justify-between text-xs font-mono">
          {hoveredHour ? (
            <span className="text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/30">
              Slot {String(hoveredHour.hour).padStart(2, '0')}:00 - {String(hoveredHour.hour).padStart(2, '0')}:59 → <strong>{hoveredHour.count}</strong> departures
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Info className="w-3 h-3" /> Hover over any bar to inspect hourly departure density
            </span>
          )}
        </div>

        {/* Bar chart container */}
        <div className="h-40 flex items-end gap-1 sm:gap-1.5 pt-4 pb-1 border-b border-slate-200 dark:border-slate-800">
          {hours.map((val, hr) => {
            const heightPercent = max > 0 ? (val / max) * 100 : 0;
            const isMorningRush = hr >= 5 && hr <= 8;
            const isEveningPeak = hr >= 16 && hr <= 19;
            const isMiddayWindow = hr >= 10 && hr <= 13;

            let barColor = 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-500';
            if (isMorningRush) barColor = 'bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400';
            else if (isEveningPeak) barColor = 'bg-blue-600 hover:bg-blue-500 dark:bg-cyan-500 dark:hover:bg-cyan-400';
            else if (isMiddayWindow) barColor = 'bg-amber-500 hover:bg-amber-400';

            return (
              <div
                key={hr}
                onMouseEnter={() => setHoveredHour({ hour: hr, count: val })}
                onMouseLeave={() => setHoveredHour(null)}
                className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
              >
                <div
                  className={`w-full rounded-t-xs transition-all duration-200 ${barColor}`}
                  style={{ height: `${Math.max(4, heightPercent)}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis ticks */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2 px-1">
          <span>00:00 (Night)</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">06:00 (Morning Peak)</span>
          <span className="text-amber-700 dark:text-amber-400 font-semibold">12:00 (Midday Window)</span>
          <span className="text-blue-700 dark:text-cyan-400 font-semibold">18:00 (Evening Rush)</span>
          <span>23:00</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-xs bg-emerald-600 dark:bg-emerald-500"></span> 05:00-08:59 Peak ({peakCount.toLocaleString()} trains)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-xs bg-amber-500"></span> Midday window
        </span>
      </div>
    </div>
  );
};
