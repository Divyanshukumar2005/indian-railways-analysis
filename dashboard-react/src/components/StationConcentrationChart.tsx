import React from 'react';
import { GitCommit, TrendingUp, Building2, MapPin } from 'lucide-react';
import { CUMULATIVE_HALTS, STATION_HUBS, NETWORK_STATS, FACTS } from '../data/railwayData';

interface StationConcentrationChartProps {
  onSelectHub: (stationName: string) => void;
  selectedStation: string;
}

export const StationConcentrationChart: React.FC<StationConcentrationChartProps> = ({
  onSelectHub,
  selectedStation,
}) => {
  // SVG dimensions for the Lorenz curve
  const W = 520;
  const H = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 16;
  const paddingBottom = 30;
  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingTop - paddingBottom;

  const getX = (percent: number) => paddingLeft + (percent / 100) * chartW;
  const getY = (val: number) => paddingTop + chartH - (val / 100) * chartH;

  const points = CUMULATIVE_HALTS.map((val, idx) => `${getX(idx).toFixed(1)},${getY(val).toFixed(1)}`).join(' ');
  const top10Val = CUMULATIVE_HALTS[10];

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-xs text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-heading font-bold text-lg tracking-wide uppercase text-slate-900 dark:text-white">
              Station Load Concentration & Busiest Hubs
            </h3>
          </div>
          <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/20">
            Top 10% of stations: {top10Val.toFixed(1)}% of halts
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-sans">
          Halting events are concentrated: the top 10% of stations handle <strong className="text-purple-700 dark:text-purple-300">{top10Val.toFixed(1)}%</strong> of all halting events, while <strong className="text-amber-700 dark:text-amber-400">{NETWORK_STATS.lowTrafficStationPercent}%</strong> of stations see 3 or fewer train services.
        </p>

        {/* Lorenz curve SVG */}
        <div className="w-full bg-slate-50 dark:bg-slate-950/80 rounded-lg p-2 border border-slate-200 dark:border-slate-800/80 mb-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible font-mono text-[10px]">
            {/* Grid horizontal lines */}
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line
                  x1={paddingLeft}
                  x2={W - paddingRight}
                  y1={getY(v)}
                  y2={getY(v)}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700/60"
                  strokeDasharray="2 2"
                />
                <text x={paddingLeft - 6} y={getY(v) + 3} textAnchor="end" className="fill-slate-400 dark:fill-slate-500">
                  {v}%
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {[0, 25, 50, 75, 100].map((p) => (
              <text key={p} x={getX(p)} y={H - 8} textAnchor="middle" className="fill-slate-400 dark:fill-slate-500">
                {p}%
              </text>
            ))}

            {/* Diagonal Equal share line */}
            <line
              x1={getX(0)}
              y1={getY(0)}
              x2={getX(100)}
              y2={getY(100)}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-600"
              strokeDasharray="4 4"
            />
            <text x={getX(65)} y={getY(52)} className="fill-slate-500 dark:fill-slate-500" transform={`rotate(-24 ${getX(65)} ${getY(52)})`}>
              Equal Distribution
            </text>

            {/* Actual Pareto / Lorenz polyline */}
            <polyline
              points={points}
              fill="none"
              stroke="#9333ea"
              strokeWidth="2.5"
            />

            {/* Top 10% marker point */}
            <circle
              cx={getX(10)}
              cy={getY(top10Val)}
              r="5"
              fill="#9333ea"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Callout text for top 10% */}
            <text
              x={getX(10) + 8}
              y={getY(top10Val) - 6}
              className="fill-slate-900 dark:fill-slate-100 font-bold"
            >
              Top 10% stations: {top10Val.toFixed(1)}% halts
            </text>
          </svg>
        </div>

        {/* Busiest Hubs Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" /> Top 10 busiest stations (by halts)
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Click a hub to list trains starting or ending there</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STATION_HUBS.map((hub) => {
              const isSelected = selectedStation.toLowerCase() === hub.name.toLowerCase();

              return (
                <div
                  key={hub.name}
                  onClick={() => onSelectHub(isSelected ? '' : hub.name)}
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-300 text-purple-950 dark:bg-purple-950/60 dark:border-purple-500 dark:ring-purple-500/40 dark:text-white'
                      : 'bg-slate-50/70 border-slate-200 hover:border-purple-300 hover:bg-slate-100 dark:bg-slate-950/60 dark:border-slate-800 dark:hover:border-purple-500/40 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                  title={`Click to list trains that start or end at ${hub.name}`}
                >
                  <div className="flex items-start gap-1 font-medium truncate mb-1">
                    <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <span className="truncate">{hub.name}</span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/60 pt-1">
                    <span>Halts: <strong className="text-slate-800 dark:text-slate-200">{hub.halting}</strong></span>
                    {hub.passing > 0 && <span>Pass: <strong className="text-blue-600 dark:text-cyan-400">{hub.passing}</strong></span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {FACTS.hubs[0].name} ({FACTS.hubs[0].halts}) & {FACTS.hubs[1].name} ({FACTS.hubs[1].halts}) lead
        </span>
        <span className="text-amber-700 dark:text-amber-400 font-semibold">
          {NETWORK_STATS.lowTrafficStationPercent}% stations have ≤3 halts
        </span>
      </div>
    </div>
  );
};
