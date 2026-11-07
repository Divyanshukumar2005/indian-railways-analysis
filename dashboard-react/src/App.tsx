import { useState, useMemo } from 'react';
import { 
  TRAINS_DATA, 
  NETWORK_STATS, 
  FACTS,
} from './data/railwayData';
import { FilterState, TrainService } from './types';
import { filterTrains, mean, exportToCSV } from './utils/analytics';

// Components
import { Header } from './components/Header';
import { KpiStrip } from './components/KpiStrip';
import { FilterToolbar } from './components/FilterToolbar';
import { SpeedByCategoryChart } from './components/SpeedByCategoryChart';
import { AcAvailabilityChart } from './components/AcAvailabilityChart';
import { ZonePerformanceChart } from './components/ZonePerformanceChart';
import { DepartureHistogram } from './components/DepartureHistogram';
import { StationConcentrationChart } from './components/StationConcentrationChart';
import { TrainTable } from './components/TrainTable';
import { TrainDetailModal } from './components/TrainDetailModal';
import { SimulatorModal } from './components/SimulatorModal';
import { PolicyDossier } from './components/PolicyDossier';
import { ScrollProgress } from './components/ScrollProgress';
import { SpeedGapDumbbell } from './components/SpeedGapDumbbell';
import { SpeedHaltScatter } from './components/SpeedHaltScatter';
import { Footer } from './components/Footer';

const INITIAL_FILTERS: FilterState = {
  search: '',
  zone: '',
  cat: '',
  band: '',
  ac: 'all',
  speedPreset: 'all',
  stationFilter: '',
  depWindow: 'all',
};

export default function App() {
  // Default to Light Theme as requested by the user
  const [isDark, setIsDark] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedTrain, setSelectedTrain] = useState<TrainService | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Network benchmark constants
  const networkAvgSpeed = useMemo(() => {
    return mean(TRAINS_DATA.map((t) => t.spd));
  }, []);

  const zones = useMemo(() => {
    return Array.from(new Set(TRAINS_DATA.map((t) => t.zone)))
      .filter((z) => z && z !== 'Unknown')
      .sort();
  }, []);

  // Filter trains
  const filteredTrains = useMemo(() => {
    return filterTrains(TRAINS_DATA, filters);
  }, [filters]);

  // Trains filtered skipping specific fields (for reactive drilldown charts)
  const trainsWithoutCat = useMemo(() => {
    return filterTrains(TRAINS_DATA, filters, 'cat');
  }, [filters]);

  const trainsWithoutBand = useMemo(() => {
    return filterTrains(TRAINS_DATA, filters, 'band');
  }, [filters]);

  const trainsWithoutZone = useMemo(() => {
    return filterTrains(TRAINS_DATA, filters, 'zone');
  }, [filters]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.zone) count++;
    if (filters.cat !== '') count++;
    if (filters.band !== '') count++;
    if (filters.ac !== 'all') count++;
    if (filters.speedPreset !== 'all') count++;
    if (filters.stationFilter) count++;
    if (filters.depWindow !== 'all') count++;
    return count;
  }, [filters]);

  // Filter metrics
  const filterMetrics = useMemo(() => {
    const n = filteredTrains.length;
    const avgSpd = n ? mean(filteredTrains.map((t) => t.spd)) : 0;
    const acEquippedCount = filteredTrains.filter((t) => t.ac === 1).length;
    const acPercent = n ? (acEquippedCount / n) * 100 : 0;
    const nonAcCount = n - acEquippedCount;

    const passengerServices = filteredTrains.filter((t) => t.cat === 2);
    const passengerPercent = n ? (passengerServices.length / n) * 100 : 0;
    const passengerAvgSpeed = passengerServices.length ? mean(passengerServices.map((t) => t.spd)) : 0;

    return {
      n,
      avgSpd,
      acPercent,
      nonAcCount,
      passengerPercent,
      passengerAvgSpeed,
    };
  }, [filteredTrains]);

  const handleFilterChange = (key: keyof FilterState, val: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Presets from Policy Dossier cards
  const handleApplyPolicyPreset = (type: 'slow_zones' | 'ac_gap' | 'peak_hours') => {
    if (type === 'slow_zones') {
      setFilters({
        ...INITIAL_FILTERS,
        zone: FACTS.slow_zones[0].zone,
      });
    } else if (type === 'ac_gap') {
      setFilters({
        ...INITIAL_FILTERS,
        band: '2', // 300-700km
        ac: 'no_ac',
      });
    } else if (type === 'peak_hours') {
      setFilters({
        ...INITIAL_FILTERS,
        depWindow: 'morning',
      });
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filteredTrains);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100/75 text-slate-900'} font-sans antialiased transition-colors duration-150`}>
      
      {/* Header */}
      <ScrollProgress />
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onExportCSV={handleExportCSV}
        filteredCount={filteredTrains.length}
        totalCount={TRAINS_DATA.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Title & Context Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-700 dark:text-cyan-400 uppercase tracking-wider mb-1 font-semibold">
              <span>National Transit Operations</span>
              <span className="text-slate-400">•</span>
              <span>Timetable & Speed Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight uppercase text-slate-900 dark:text-white">
              RailGati: Indian Railways Service Network Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1.5 leading-relaxed font-sans">
              Where is the network slow, short on AC, or overloaded? A look at <strong>{TRAINS_DATA.length.toLocaleString()} timetable train services</strong> and <strong>{NETWORK_STATS.nStations.toLocaleString()} stations</strong>: speed bottlenecks, stoppage overhead, AC availability and how halting traffic concentrates at a few hubs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
            <span className="px-3 py-1.5 whitespace-nowrap rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
              Avg speed, all services: <strong className="text-blue-700 dark:text-amber-400">{networkAvgSpeed.toFixed(1)} km/h</strong>
            </span>
          </div>
        </div>

        {/* 1. Key Performance Indicators (KPI Strip) */}
        <KpiStrip
          totalCount={TRAINS_DATA.length}
          filteredCount={filterMetrics.n}
          avgSpeed={filterMetrics.avgSpd}
          networkAvgSpeed={networkAvgSpeed}
          acPercent={filterMetrics.acPercent}
          nonAcCount={filterMetrics.nonAcCount}
          passengerPercent={filterMetrics.passengerPercent}
          passengerAvgSpeed={filterMetrics.passengerAvgSpeed}
        />

        {/* 2. Interactive Filter & Query Command Toolbar */}
        <FilterToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          zones={zones}
          activeFilterCount={activeFilterCount}
        />

        {/* 3. Benchmarks: equal-height pairs, then full-width zone panel */}
        <section aria-label="Operational Benchmarks" className="pair">
          <SpeedByCategoryChart
            trains={filteredTrains}
            allTrainsWithoutCat={trainsWithoutCat}
            selectedCategory={filters.cat}
            onSelectCategory={(cat) => handleFilterChange('cat', cat)}
          />
          <AcAvailabilityChart
            trains={filteredTrains}
            allTrainsWithoutBand={trainsWithoutBand}
            selectedBand={filters.band}
            onSelectBand={(band) => handleFilterChange('band', band)}
          />
        </section>

        <section aria-label="Zone performance">
          <ZonePerformanceChart
            zones={zones}
            allTrainsWithoutZone={trainsWithoutZone}
            networkAvgSpeed={networkAvgSpeed}
            selectedZone={filters.zone}
            onSelectZone={(zone) => handleFilterChange('zone', zone)}
          />
        </section>

        <section aria-label="Departures and speed vs halts" className="pair">
          <DepartureHistogram trains={filteredTrains} />
          <SpeedHaltScatter />
        </section>

        <section aria-label="Hubs and passenger vs express gap" className="pair">
          <StationConcentrationChart
            onSelectHub={(station) => handleFilterChange('stationFilter', station)}
            selectedStation={filters.stationFilter}
          />
          <SpeedGapDumbbell />
        </section>

        {/* 5. Complete Services Explorer Table */}
        <section aria-label="Train Services Data Explorer">
          <TrainTable
            trains={filteredTrains}
            onSelectTrain={(train) => setSelectedTrain(train)}
            networkAvgSpeed={networkAvgSpeed}
          />
        </section>

        {/* 6. Strategic Policy Dossier */}
        <PolicyDossier onApplyPreset={handleApplyPolicyPreset} />

      </main>

      {/* Train detail modal */}
      {selectedTrain && (
        <TrainDetailModal
          train={selectedTrain}
          onClose={() => setSelectedTrain(null)}
          networkAvgSpeed={networkAvgSpeed}
        />
      )}

      {/* What-if simulator (illustrative, not a forecast) */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
