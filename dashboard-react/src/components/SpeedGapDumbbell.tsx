import React, { useMemo } from 'react';
import { TRAINS_DATA } from '../data/railwayData';

const MIN_N = 5, EXPRESS = 1, PASSENGER = 2;
const W = 520, ROW = 25, PL = 52, PR = 44, PT = 14, XMIN = 20, XMAX = 70;

export const SpeedGapDumbbell: React.FC = () => {
  const rows = useMemo(() => {
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
    return Array.from(new Set(TRAINS_DATA.map(t => t.zone))).filter(z => z !== 'Unknown').map(z => {
      const p = TRAINS_DATA.filter(t => t.zone === z && t.cat === PASSENGER).map(t => t.spd);
      const e = TRAINS_DATA.filter(t => t.zone === z && t.cat === EXPRESS).map(t => t.spd);
      return p.length >= MIN_N && e.length >= MIN_N ? { z, p: mean(p), e: mean(e) } : null;
    }).filter((r): r is { z: string; p: number; e: number } => r !== null).sort((a, b) => (b.e - b.p) - (a.e - a.p));
  }, []);
  const AX = PT + rows.length * ROW; // bottom of the plot area
  const H = AX + 38;
  const X = (v: number) => PL + ((v - XMIN) / (XMAX - XMIN)) * (W - PL - PR);
  const slower = rows.filter(r => r.p < r.e).length;
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">Passenger vs express speed by zone</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Passenger trains are slower than express trains in {slower} of {rows.length} zones. The label shows the gap in km/h, with the widest gap first. Zones with fewer than {MIN_N} trains of either type are left out.
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-2" role="img" aria-label="Passenger and express average speed for each railway zone">
        {[20, 30, 40, 50, 60, 70].map(v => (
          <g key={v}>
            <line x1={X(v)} x2={X(v)} y1={PT - 4} y2={AX} className="stroke-slate-200 dark:stroke-slate-800" />
            <text x={X(v)} y={AX + 14} textAnchor="middle" className="fill-slate-500 text-[10px]">{v}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = PT + i * ROW + ROW / 2;
          return (
            <g key={r.z}>
              <text x={PL - 8} y={y + 3} textAnchor="end" className="fill-slate-700 dark:fill-slate-300 text-[11px] font-semibold">{r.z}</text>
              <line x1={X(r.p)} x2={X(r.e)} y1={y} y2={y} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={3} strokeLinecap="round" />
              <circle cx={X(r.p)} cy={y} r={5} fill="#f59e0b"><title>{`${r.z} passenger: ${r.p.toFixed(1)} km/h`}</title></circle>
              <circle cx={X(r.e)} cy={y} r={5} fill="#2563eb"><title>{`${r.z} express: ${r.e.toFixed(1)} km/h`}</title></circle>
              <text x={X(r.e) + 11} y={y + 3} className="fill-slate-500 text-[10px]">{(r.e - r.p).toFixed(1)}</text>
            </g>
          );
        })}
        <text x={X(45)} y={AX + 31} textAnchor="middle" className="fill-slate-400 text-[9px]">average scheduled speed (km/h)</text>
      </svg>
      <div className="flex gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full inline-block bg-amber-500" />Passenger &amp; Suburban</span>
        <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full inline-block bg-blue-600" />Express &amp; Superfast</span>
      </div>
    </section>
  );
};
