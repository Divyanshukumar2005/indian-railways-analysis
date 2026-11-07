import React from 'react';
import { 
  Search, 
  RotateCcw, 
  Filter, 
  X, 
  Sparkles,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { FilterState } from '../types';
import { CATEGORIES, DISTANCE_BANDS, ZONE_COUNT } from '../data/railwayData';

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, val: string) => void;
  onResetFilters: () => void;
  zones: string[];
  activeFilterCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  zones,
  activeFilterCount,
}) => {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 shadow-xs text-slate-800 dark:text-slate-200">
      
      {/* Top row: Search + Category Buttons + Reset */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Search input */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search train no, name, origin, destination..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-sans transition"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Zone Selector */}
        <div className="md:col-span-2 relative">
          <select
            value={filters.zone}
            onChange={(e) => onFilterChange('zone', e.target.value)}
            className="w-full appearance-none pl-3.5 pr-8 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-sans transition cursor-pointer"
          >
            <option value="">All Zones ({ZONE_COUNT})</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                Zone: {z}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 dark:text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Category Selector */}
        <div className="md:col-span-3 relative">
          <select
            value={filters.cat}
            onChange={(e) => onFilterChange('cat', e.target.value)}
            className="w-full appearance-none pl-3.5 pr-8 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-sans transition cursor-pointer"
          >
            <option value="">All Categories (4)</option>
            {CATEGORIES.map((catName, idx) => (
              <option key={idx} value={String(idx)}>
                {catName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 dark:text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Distance Band */}
        <div className="md:col-span-3 flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={filters.band}
              onChange={(e) => onFilterChange('band', e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-sans transition cursor-pointer"
            >
              <option value="">All Distances (5 Bands)</option>
              {DISTANCE_BANDS.map((bandName, idx) => (
                <option key={idx} value={String(idx)}>
                  {bandName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 dark:text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={onResetFilters}
            disabled={activeFilterCount === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition whitespace-nowrap cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 dark:hover:bg-amber-500/20'
                : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-950/40 dark:text-slate-600 dark:border-slate-800 cursor-not-allowed'
            }`}
            title="Reset all active filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

      </div>

      {/* Secondary filter chips row: AC Status & Speed Presets */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Presets:
          </span>

          {/* AC Toggle Chips */}
          <div className="inline-flex rounded-md bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onFilterChange('ac', 'all')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                filters.ac === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All AC Classes
            </button>
            <button
              onClick={() => onFilterChange('ac', 'ac_only')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                filters.ac === 'ac_only'
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              AC Only
            </button>
            <button
              onClick={() => onFilterChange('ac', 'no_ac')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                filters.ac === 'no_ac'
                  ? 'bg-amber-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Non-AC Only
            </button>
          </div>

          {/* Speed Presets */}
          <div className="inline-flex rounded-md bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onFilterChange('speedPreset', 'all')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                filters.speedPreset === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Speeds
            </button>
            <button
              onClick={() => onFilterChange('speedPreset', 'slow')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                filters.speedPreset === 'slow'
                  ? 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Bottlenecks (&lt;40 km/h)
            </button>
            <button
              onClick={() => onFilterChange('speedPreset', 'fast')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                filters.speedPreset === 'fast'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              High Speed (&ge;65 km/h)
            </button>
          </div>

          {/* Departure window */}
          <div className="inline-flex rounded-md bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onFilterChange('depWindow', 'all')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                filters.depWindow === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Departures
            </button>
            <button
              onClick={() => onFilterChange('depWindow', 'morning')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                filters.depWindow === 'morning'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Morning rush (05:00-08:59)
            </button>
          </div>

          {/* Station Filter indicator if set */}
          {filters.stationFilter && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-500/15 dark:border-purple-500/30 dark:text-purple-300 font-mono text-[11px]">
              <MapPin className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Origin/destination: {filters.stationFilter}</span>
              <button 
                onClick={() => onFilterChange('stationFilter', '')}
                className="hover:text-purple-950 dark:hover:text-white ml-0.5"
                title="Remove hub filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Active Filters count pill */}
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300 text-[11px] font-mono font-medium">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">Full timetable</span>
          )}
        </div>

      </div>

    </div>
  );
};
