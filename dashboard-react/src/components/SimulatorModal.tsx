import React, { useEffect, useState } from 'react';
import { 
  X, 
  Sliders, 
  TrendingUp, 
  Sparkles, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { NETWORK_STATS } from '../data/railwayData';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({ isOpen, onClose }) => {
  const [reductionPercent, setReductionPercent] = useState<number>(20);
  const [acAugmentPercent, setAcAugmentPercent] = useState<number>(40);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // All constants come from the data (see scripts/build_dashboard.py), none are typed in by hand.
  // Model: speed change = regression slope x change in halts per 100 km, fitted on passenger &
  // suburban services of 100 km or more. This is an association across trains, not a measured
  // effect of removing stops on any one train.
  const sim = NETWORK_STATS.sim;
  const baselineSpeed = sim.base_speed;
  const currentAvgHaltsPer100km = sim.base_h100;
  const simulatedHaltsPer100km = currentAvgHaltsPer100km * (1 - reductionPercent / 100);
  const speedGain = -sim.slope * (currentAvgHaltsPer100km - simulatedHaltsPer100km);
  const projectedSpeed = baselineSpeed + speedGain;

  // Travel time for an average passenger journey (mean distance of the fitted services)
  const originalTimeHours = sim.avg_dist / baselineSpeed;
  const simulatedTimeHours = sim.avg_dist / projectedSpeed;
  const minutesSavedPerRun = Math.round((originalTimeHours - simulatedTimeHours) * 60);

  // AC coach supply expansion on non-AC 300-700 km services
  const unequippedServices = sim.non_ac_mid;
  const newlyEquippedServices = Math.round((unequippedServices * acAugmentPercent) / 100);
  const remainingAcGap = unequippedServices - newlyEquippedServices;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 sm:p-7 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Sliders className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-mono font-medium mb-1">
                <Sparkles className="w-3 h-3" /> What-if Simulator (illustrative)
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white">
                Stoppage Rationalization & Corridor Acceleration
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Introduction note */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-sans">
          This is a what-if illustration, not a forecast. It applies the slope from a regression of average speed on halts per 100 km (<strong>{sim.slope} km/h per halt/100km</strong>, {sim.n.toLocaleString()} passenger &amp; suburban services of 100 km or more) to the halt cut you choose. The network-wide correlation is <strong>r = {NETWORK_STATS.haltSpeedCorrelation}</strong> for average speed and <strong>{NETWORK_STATS.haltRunningSpeedCorrelation}</strong> for running speed. It shows association between trains, not that cutting stops will cause this speedup.
        </p>

        {/* Simulation Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          
          {/* Lever 1: Halt Reduction */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                1. Passenger Halt Rationalization
              </label>
              <span className="text-sm font-bold font-mono text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                -{reductionPercent}% halts
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Cut the share of halts per 100 km on passenger &amp; suburban services (the data has no ridership, so it cannot say which stops are low-use).
            </p>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={reductionPercent}
              onChange={(e) => setReductionPercent(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
              <span>0% (today)</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Lever 2: AC Coach Augmentation on 300-700 km */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                2. 300-700 km AC Augmentation
              </label>
              <span className="text-sm font-bold font-mono text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                +{acAugmentPercent}% services
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Add 3AC or AC Chair Cars to the {sim.non_ac_mid} non-AC intercity services in the critical 300-700 km corridor.
            </p>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={acAugmentPercent}
              onChange={(e) => setAcAugmentPercent(Number(e.target.value))}
              className="w-full accent-blue-600 dark:accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
              <span>0% ({sim.non_ac_mid} non-AC)</span>
              <span>50% (+{Math.round(sim.non_ac_mid/2)} services)</span>
              <span>100% (all AC)</span>
            </div>
          </div>


        </div>

        {/* Projected Simulation Outcomes Banner */}
        <div className="rounded-xl bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-amber-500/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-heading font-bold text-base uppercase tracking-wider text-slate-900 dark:text-white">
              Illustrative Outcomes
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            {/* Speed outcome */}
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Passenger Speed</span>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
                {projectedSpeed.toFixed(1)} km/h
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">
                +{speedGain.toFixed(1)} km/h boost
              </div>
            </div>

            {/* Time saved */}
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Time Saved</span>
              <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1 tabular-nums">
                ~{minutesSavedPerRun} mins
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                per {sim.avg_dist} km run
              </div>
            </div>

            {/* Stoppages density */}
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Halts Density</span>
              <div className="text-xl font-bold text-blue-700 dark:text-cyan-300 mt-1 tabular-nums">
                {simulatedHaltsPer100km.toFixed(1)} /100km
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                down from {currentAvgHaltsPer100km}
              </div>
            </div>

            {/* AC Augmented */}
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">AC Services Added</span>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 tabular-nums">
                +{newlyEquippedServices} trains
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {remainingAcGap} services left
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Association across trains, not a forecast for any one train
            </span>
            <button
              onClick={() => {
                setReductionPercent(20);
                setAcAugmentPercent(40);
                
              }}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Lever Defaults
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-xs transition cursor-pointer"
          >
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
};
