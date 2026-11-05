import React, { useMemo } from 'react';
import { CATEGORIES, NETWORK_STATS, TRAINS_DATA } from '../data/railwayData';

const W = 520, H = 300, PL = 40, PB = 30, XMAX = 40, YMAX = 110;
const COLORS = ['#22d3ee', '#fb923c', '#34d399', '#a78bfa'];

export const SpeedHaltScatter: React.FC = () => {
  const { pts, line, hidden } = useMemo(() => {
    const n = TRAINS_DATA.length;
    const mx = TRAINS_DATA.reduce((a, t) => a + t.h100, 0) / n, my = TRAINS_DATA.reduce((a, t) => a + t.spd, 0) / n;
    const b = TRAINS_DATA.reduce((a, t) => a + (t.h100 - mx) * (t.spd - my), 0) / TRAINS_DATA.reduce((a, t) => a + (t.h100 - mx) ** 2, 0);
    const shown = TRAINS_DATA.filter(t => t.h100 <= XMAX);
    return { pts: shown, hidden: n - shown.length, line: { a: my - b * mx, b } };
  }, []);
  const X = (v: number) => PL + (v / XMAX) * (W - PL - 10);
  const Y = (v: number) => H - PB - (v / YMAX) * (H - PB - 10);
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">More stops, lower speed</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
        Each dot is one train: halts per 100 km against average speed (r = {NETWORK_STATS.haltSpeedCorrelation}). This is an association between trains, not proof that stops cause the slowdown.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0, 20, 40, 60, 80, 100].map(v => (
          <g key={v}><line x1={PL} x2={W - 10} y1={Y(v)} y2={Y(v)} className="stroke-slate-200 dark:stroke-slate-800" /><text x={PL - 6} y={Y(v) + 3} textAnchor="end" className="fill-slate-500 text-[9px]">{v}</text></g>
        ))}
        {[0, 10, 20, 30, 40].map(v => <text key={v} x={X(v)} y={H - 12} textAnchor="middle" className="fill-slate-500 text-[9px]">{v}</text>)}
        <text x={W / 2} y={H - 1} textAnchor="middle" className="fill-slate-500 text-[9px]">halts per 100 km</text>
        <text x={10} y={14} className="fill-slate-500 text-[9px]">km/h</text>
        {pts.map((t, i) => <circle key={i} cx={X(t.h100)} cy={Y(t.spd)} r={1.7} fill={COLORS[t.cat] ?? '#94a3b8'} fillOpacity={0.4} />)}
        <line x1={X(0)} y1={Y(line.a)} x2={X(XMAX)} y2={Y(Math.max(0, line.a + line.b * XMAX))} stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 4" />
      </svg>
      <div className="flex flex-wrap gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
        {CATEGORIES.map((c, i) => <span key={c} className="inline-flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i] }} />{c}</span>)}
        <span className="text-rose-500">dashed: straight-line fit, all trains</span>
      </div>
      {hidden > 0 && <p className="text-[11px] text-slate-400 mt-1">{hidden} trains above {XMAX} halts per 100 km are off the chart but are in the fit.</p>}
    </section>
  );
};
