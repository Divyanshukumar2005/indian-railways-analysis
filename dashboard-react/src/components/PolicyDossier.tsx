import React from 'react';
import { 
  FileText, 
  Scissors, 
  Wind, 
  GitMerge, 
  Clock, 
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { NETWORK_STATS, TRAINS_DATA, FACTS } from '../data/railwayData';

interface PolicyDossierProps {
  onApplyPreset: (type: 'slow_zones' | 'ac_gap' | 'peak_hours') => void;
}

export const PolicyDossier: React.FC<PolicyDossierProps> = ({ onApplyPreset }) => {
  const meanSpeed = (cat: number) => {
    const rows = TRAINS_DATA.filter(t => t.cat === cat);
    return rows.reduce((a, t) => a + t.spd, 0) / rows.length;
  };
  const speedDeficit = meanSpeed(2) - meanSpeed(1); // passenger & suburban minus express
  const slowZoneNames = FACTS.slow_zones.map(z => z.zone);
  const slowZoneList = `${slowZoneNames.slice(0, -1).join(', ')}, and ${slowZoneNames[slowZoneNames.length - 1]}`;
  const slowZoneSpeeds = FACTS.slow_zones.map(z => z.speed.toFixed(1)).join(', ');
  const paxMin = Math.min(...FACTS.slow_zones.map(z => z.passenger_pct));
  const paxMax = Math.max(...FACTS.slow_zones.map(z => z.passenger_pct));
  const lowAcList = FACTS.low_ac_zones.map(z => `${z.zone} (${z.ac_pct}% AC)`).join(', ');
  const lowAcZoneNames = FACTS.low_ac_zones.map(z => z.zone);
  const [hub1, hub2] = FACTS.hubs;
  return (
    <section className="mt-8 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 shadow-xs text-slate-800 dark:text-slate-100">
      
      {/* Dossier Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <h3 className="font-heading font-bold text-2xl tracking-wide uppercase text-slate-900 dark:text-white">
              Policy Dossier: Strategic Insights & Network Interventions
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed font-sans">
            Empirical findings derived from timetable parsing of {TRAINS_DATA.length.toLocaleString()} train services and {NETWORK_STATS.nStations.toLocaleString()} stations. Stoppage overhead and load skew require targeted structural remedies.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400">
          <span>Pearson r (halts/100km vs average speed):</span>
          <strong className="text-amber-700 dark:text-amber-400 font-bold">{NETWORK_STATS.haltSpeedCorrelation}</strong>
        </div>
      </div>

      {/* 4 Strategic Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Case 1: Slow Passenger Services & Stop Rationalization */}
        <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-xs font-mono font-medium">
                <Scissors className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Pillar 01 // Speed Recovery
              </span>
              <span className="text-[11px] font-mono text-red-700 dark:text-red-400 flex items-center gap-1 font-semibold">
                <TrendingDown className="w-3.5 h-3.5" /> {speedDeficit.toFixed(1)} km/h vs express
              </span>
            </div>

            <h4 className="text-base font-bold font-heading uppercase text-slate-900 dark:text-white mb-2">
              Rationalize Stoppages on Passenger & Suburban Lines
            </h4>

            {/* Finding */}
            <div className="mb-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-500" /> Empirical Finding:
              </div>
              <p>
                Passenger & suburban services comprise <strong>{FACTS.pas_share}%</strong> of the network but average only <strong>{FACTS.pas_speed} km/h</strong> (vs {FACTS.exp_speed} km/h for express). They stop far more often per 100 km ({FACTS.pas_h100} vs {FACTS.exp_h100} halts).
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Standing time accounts for about {Math.round(FACTS.dwell_share_pct)}% of journey time, which builds in some of the gap. Speed still falls as halts per 100 km rise (r = {FACTS.r_raw} for average speed, {FACTS.r_run} for running speed once standing time is removed; an association, not proof of cause). <strong>{slowZoneList}</strong> are slowest at {slowZoneSpeeds} km/h with {paxMin}% to {paxMax}% passenger share.
              </p>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                <Lightbulb className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Strategic Action:
              </div>
              <p>
                Review stoppage patterns on {slowZoneList} first. Long passenger runs could be tested as fast-passenger or MEMU-style skip-stop patterns. The data has no ridership, so which halts are low-use needs separate data.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Target Zones: {slowZoneNames.join(', ')}</span>
            <button
              onClick={() => onApplyPreset('slow_zones')}
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 cursor-pointer"
            >
              Filter Slow Zones <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Case 2: AC Supply Gap on 300 to 700 km */}
        <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-xs font-mono font-medium">
                <Wind className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Pillar 02 // Rolling Stock
              </span>
              <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300 font-semibold">
                {FACTS.mid_non_ac} services without AC
              </span>
            </div>

            <h4 className="text-base font-bold font-heading uppercase text-slate-900 dark:text-white mb-2">
              Augment AC Capacity on 300 to 700 km Corridors
            </h4>

            {/* Finding */}
            <div className="mb-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-500" /> Empirical Finding:
              </div>
              <p>
                While {FACTS.long_ac_pct[0]}% to {FACTS.long_ac_pct[1]}% of services of 700 km and above have AC classes, <strong>{FACTS.mid_non_ac} of {FACTS.mid_total} services ({(100 * FACTS.mid_non_ac / FACTS.mid_total).toFixed(1)}%)</strong> in the 300–700 km band have no AC class at all (AC chair car counts as AC).
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Within this distance band, <strong>{lowAcList}</strong> have the lowest AC share among zones with at least 20 services in the band; the dataset has no ridership figures, so this is a supply gap, not a demand finding.
              </p>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                <Lightbulb className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Strategic Action:
              </div>
              <p>
                Prioritize AC coaches (3AC or AC Chair Car) on the busiest non-AC 300–700 km corridors in {lowAcZoneNames.join(', ')} before adding long-haul AC capacity.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Non-AC in band: {FACTS.mid_non_ac} services</span>
            <button
              onClick={() => onApplyPreset('ac_gap')}
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
            >
              Filter 300-700km Non-AC <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Case 3: Station Hub Bottlenecks */}
        <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 text-xs font-mono font-medium">
                <GitMerge className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Pillar 03 // Infrastructure
              </span>
              <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300 font-semibold">
                Top 10% = {FACTS.top10_share}% Halts
              </span>
            </div>

            <h4 className="text-base font-bold font-heading uppercase text-slate-900 dark:text-white mb-2">
              Decouple Terminal Load from Primary Junction Hubs
            </h4>

            {/* Finding */}
            <div className="mb-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-500" /> Empirical Finding:
              </div>
              <p>
                Halting events are concentrated: the busiest 10% of stations account for <strong>{FACTS.top10_share}%</strong> of all train halting events.
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                <strong>{hub1.name} ({hub1.halts} halts)</strong> and <strong>{hub2.name} ({hub2.halts} halts)</strong> have the most halting services (the data has no platform or track capacity figures, so this shows volume, not congestion). In contrast, <strong>{NETWORK_STATS.lowTrafficStationPercent}% of stations</strong> see 3 or fewer halting services in the entire timetable.
              </p>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                <Lightbulb className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Strategic Action:
              </div>
              <p>
                Check platform and pit-line capacity at these top hubs, and review stoppages at the many stations with three or fewer halting services. Capacity itself needs infrastructure data that is not in this dataset.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Busiest: {FACTS.hubs.map(h => h.name).join(', ')}</span>
            <span className="text-[11px] font-mono text-purple-700 dark:text-purple-400 font-semibold">Infrastructure Focus</span>
          </div>
        </div>

        {/* Case 4: Diurnal Smoothing */}
        <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-xs font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Pillar 04 // Timetable Scheduling
              </span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                05:00-08:59 = {FACTS.dep_morning_pct}% rush
              </span>
            </div>

            <h4 className="text-base font-bold font-heading uppercase text-slate-900 dark:text-white mb-2">
              Test the Midday Window (10:00 to 12:59)
            </h4>

            {/* Finding */}
            <div className="mb-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-500" /> Empirical Finding:
              </div>
              <p>
                Departures are concentrated in the morning: <strong>{FACTS.dep_morning_pct}% of all departures</strong> fall in the 4-hour window 05:00 to 08:59, while 00:00 to 03:59 accounts for only {FACTS.dep_night_pct}%.
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                The midday slot (10:00 to 12:59) holds {FACTS.dep_midday_pct}% of departures, about {FACTS.dep_midday_per_hour}% per hour against a {FACTS.dep_per_hour_avg}% all-day average: a modest dip, so this is the weakest-evidenced of the four findings. Departure times are origin times, not station load.
              </p>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                <Lightbulb className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Strategic Action:
              </div>
              <p>
                Test moving some new or extra services into the midday window (10:00 to 12:59) to ease the morning peak. Whether that helps depends on terminal capacity, which is not in this data.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Slot Smoothing Strategy</span>
            <button
              onClick={() => onApplyPreset('peak_hours')}
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
            >
              Filter Morning Rush Trains <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </section>
  );
};
