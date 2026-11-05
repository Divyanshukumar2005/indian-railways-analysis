import React, { useEffect } from 'react';
import { 
  X, 
  Train, 
  MapPin, 
  Gauge, 
  Clock, 
  Layers, 
  Wind, 
  AlertCircle, 
  CheckCircle2, 
  Timer, 
  GitCommit
} from 'lucide-react';
import { TrainService } from '../types';
import { CATEGORIES, DISTANCE_BANDS, NETWORK_STATS } from '../data/railwayData';

interface TrainDetailModalProps {
  train: TrainService | null;
  onClose: () => void;
  networkAvgSpeed: number;
}

export const TrainDetailModal: React.FC<TrainDetailModalProps> = ({
  train,
  onClose,
  networkAvgSpeed,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!train) return null;

  // Approximate journey duration in hours
  const journeyDurationHours = train.spd > 0 ? train.dist / train.spd : 0;
  // Standing time estimate: intermediate halts x the network-average dwell per halt (measured from the schedules)
  const estimatedHaltOverheadMinutes = Math.max(0, train.halts - 2) * NETWORK_STATS.sim.dwell_per_halt;
  const haltTimeRatio = journeyDurationHours > 0 
    ? Math.min(60, (estimatedHaltOverheadMinutes / (journeyDurationHours * 60)) * 100) 
    : 0;

  const isBelowAvg = train.spd < networkAvgSpeed;
  const speedDiff = train.spd - networkAvgSpeed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal card */}
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-800 dark:text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Train className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-base font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-200 dark:border-slate-700">
                  #{train.no}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Zone {train.zone}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                  {CATEGORIES[train.cat] || 'Standard'}
                </span>
              </div>
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mt-1">
                {train.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route Corridor Banner */}
        <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Origin:</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{train.from}</p>
            </div>
          </div>

          <div className="flex flex-col items-center shrink-0 px-2">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{train.dist} km corridor</span>
            <div className="w-20 h-0.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-cyan-500 my-1 relative">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500" />
            </div>
          </div>

          <div className="flex items-center gap-2 min-w-0 text-right justify-end">
            <div className="truncate">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Terminus:</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{train.to}</p>
            </div>
            <MapPin className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
          </div>
        </div>

        {/* 6 Key Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          
          {/* Scheduled Speed */}
          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-blue-600 dark:text-cyan-400" /> Scheduled Speed
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              {train.spd.toFixed(1)} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="text-[11px] font-mono mt-1">
              <span className={isBelowAvg ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>
                {speedDiff >= 0 ? `+${speedDiff.toFixed(1)}` : speedDiff.toFixed(1)} vs benchmark
              </span>
            </div>
          </div>

          {/* Stoppages */}
          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Total Stoppages
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              {train.halts} <span className="text-xs font-normal text-slate-400">halts</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
              {train.h100.toFixed(2)} halts / 100km
            </div>
          </div>

          {/* Stoppage Time Overhead */}
          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Timer className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Est. Standing Time
            </span>
            <div className="text-xl font-bold font-mono text-purple-700 dark:text-purple-300 mt-1 tabular-nums">
              ~{Math.round(estimatedHaltOverheadMinutes)} <span className="text-xs font-normal text-slate-400">mins</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
              ~{Math.round(haltTimeRatio)}% of journey time
            </div>
          </div>

          {/* Scheduled Departure */}
          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Departure Slot
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              {String(train.hr).padStart(2, '0')}:00 <span className="text-xs font-normal text-slate-400">hrs</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
              {train.hr >= 5 && train.hr <= 8 ? 'Morning Peak Window' : 'Off-Peak Window'}
            </div>
          </div>

          {/* Distance Band */}
          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Distance Band
            </span>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1 truncate">
              {DISTANCE_BANDS[train.band] || 'Regional'}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
              {train.dist} total kilometers
            </div>
          </div>

          {/* AC Equipment */}
          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Wind className="w-3 h-3 text-blue-600 dark:text-blue-400" /> AC Configuration
            </span>
            <div className="text-base font-bold font-mono mt-1">
              {train.ac ? (
                <span className="text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> AC Equipped
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Non-AC Service
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
              {train.ac ? '1A / 2A / 3A / CC' : 'No AC class listed'}
            </div>
          </div>

        </div>

        {/* Operational Analysis Assessment */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-white font-mono block mb-1">
            Diagnosis:
          </strong>
          {train.h100 > 6 ? (
            <p className="text-amber-800 dark:text-amber-300/90">
              ⚠️ <strong>High Stoppage Penalty:</strong> With {train.h100.toFixed(1)} stops per 100 km, this service experiences heavy mechanical acceleration/braking penalties. Across passenger services, 20% fewer halts per 100 km goes with an average speed about {(-NETWORK_STATS.sim.slope * train.h100 * 0.2).toFixed(1)} km/h higher (an association between trains, not a guaranteed gain).
            </p>
          ) : train.spd > 65 ? (
            <p className="text-emerald-800 dark:text-emerald-300/90">
              ⚡ <strong>High-Efficiency Fast-Track Corridor:</strong> This train exhibits streamlined stoppage discipline ({train.h100.toFixed(2)} stops/100km), operating at {train.spd.toFixed(1)} km/h.
            </p>
          ) : (
            <p className="text-slate-700 dark:text-slate-300">
              Standard intercity service profile with balanced operational parameters across {train.zone} division.
            </p>
          )}
        </div>

        {/* Close Button Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-xs transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
