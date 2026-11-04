import React, { useState } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  RotateCcw,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { NETWORK_STATS } from '../data/railwayData';

export const SimulatorSection: React.FC = () => {
  const [reductionPercent, setReductionPercent] = useState<number>(20);
  const [acAugmentPercent, setAcAugmentPercent] = useState<number>(40);
  const [selectedFocusZone, setSelectedFocusZone] = useState<string>('slow_three');

  const baselineSpeed = 33.5;
  const speedGain = (reductionPercent / 100) * 8.4;
  const projectedSpeed = baselineSpeed + speedGain;

  const currentAvgHaltsPer100km = 11.9;
  const simulatedHaltsPer100km = currentAvgHaltsPer100km * (1 - reductionPercent / 100);

  const originalTimeHours = 200 / baselineSpeed;
  const simulatedTimeHours = 200 / projectedSpeed;
  const minutesSavedPerRun = Math.round((originalTimeHours - simulatedTimeHours) * 60);

  const unequippedServices = 375;
  const newlyEquippedServices = Math.round((unequippedServices * acAugmentPercent) / 100);
  const remainingAcGap = unequippedServices - newlyEquippedServices;

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs relative overflow-hidden">
      {/* Subtle background rail line design accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-mono font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Interactive Systems Engineering Model
          </div>
          <h3 className="text-xl sm:text-2xl font-heading font-extrabold tracking-wide uppercase text-slate-900 dark:text-white">
            What-If Stoppage Rationalization & Fleet Acceleration Simulator
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
            Test policy scenarios grounded in the Pearson correlation (r = {NETWORK_STATS.haltSpeedCorrelation}) between halts/100km and average running speed across the national network.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              setReductionPercent(20);
              setAcAugmentPercent(40);
              setSelectedFocusZone('slow_three');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset Lever Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Lever 1 */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                1. Passenger Stoppage Pruning
              </label>
              <span className="text-sm font-bold font-mono text-amber-800 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-500/30">
                -{reductionPercent}% halts
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 font-sans">
              Prunes low-patronage flag halts to eliminate mechanical deceleration and standing dwell time penalties.
            </p>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={reductionPercent}
              onChange={(e) => setReductionPercent(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
              <span>0% (Status Quo)</span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold">25% (Recommended)</span>
              <span>50% (Express Speed)</span>
            </div>
          </div>

          {/* Lever 2 */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                2. 300–700 km AC Fleet Augmentation
              </label>
              <span className="text-sm font-bold font-mono text-blue-700 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-500/20 px-2.5 py-0.5 rounded-md border border-blue-300 dark:border-blue-500/30">
                +{acAugmentPercent}% services
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 font-sans">
              Attaches 3AC Economy coaches and AC Chair Cars to the 375 non-AC intercity services on mid-haul lines.
            </p>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={acAugmentPercent}
              onChange={(e) => setAcAugmentPercent(Number(e.target.value))}
              className="w-full accent-blue-600 dark:accent-blue-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
              <span>0% (375 gap)</span>
              <span className="text-blue-700 dark:text-blue-400 font-semibold">50% (+188 trains)</span>
              <span>100% (100% AC Coverage)</span>
            </div>
          </div>

          {/* Scope Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedFocusZone('slow_three')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                selectedFocusZone === 'slow_three'
                  ? 'bg-amber-50/90 dark:bg-amber-500/15 border-amber-500 ring-1 ring-amber-400 dark:ring-amber-500/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Focus Slow Corridors
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Prioritizes SECR (33.2 km/h), ECR (33.7 km/h), and NER (36.0 km/h) with 67–74% passenger share.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFocusZone('all')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                selectedFocusZone === 'all'
                  ? 'bg-amber-50/90 dark:bg-amber-500/15 border-amber-500 ring-1 ring-amber-400 dark:ring-amber-500/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> Pan-India Fleet
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Applies rationalization parameters across all 16 Indian Railway divisions simultaneously.
              </p>
            </button>
          </div>

        </div>

        {/* Results Output Column (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-slate-50 dark:bg-slate-950 p-5 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Live Model Projections
              </span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                Active Simulation
              </span>
            </div>

            <div className="space-y-3 font-mono">
              {/* Projected Speed */}
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Passenger Speed</span>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {projectedSpeed.toFixed(1)} km/h
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20">
                    +{speedGain.toFixed(1)} km/h
                  </span>
                </div>
              </div>

              {/* Time Saved */}
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Per-Run Duration Saved</span>
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                    ~{minutesSavedPerRun} mins
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  per 200 km trip
                </div>
              </div>

              {/* Stoppage Density */}
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Halt Frequency</span>
                  <div className="text-lg font-bold text-blue-700 dark:text-cyan-300 tabular-nums">
                    {simulatedHaltsPer100km.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 100km</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  from {currentAvgHaltsPer100km}
                </div>
              </div>

              {/* AC Services Added */}
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">AC Services Augmented</span>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                    +{newlyEquippedServices} trains
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  {remainingAcGap} unequipped left
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Terminal throat headway capacity unlocked: ~12% to 18%</span>
          </div>
        </div>

      </div>
    </section>
  );
};
