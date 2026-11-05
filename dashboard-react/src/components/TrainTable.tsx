import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  MapPin, 
  Zap, 
  AlertTriangle,
  ChevronDown 
} from 'lucide-react';
import { TrainService, SortState, SortField } from '../types';
import { sortTrains } from '../utils/analytics';
import { CATEGORIES } from '../data/railwayData';

interface TrainTableProps {
  trains: TrainService[];
  onSelectTrain: (train: TrainService) => void;
  networkAvgSpeed: number;
}

export const TrainTable: React.FC<TrainTableProps> = ({
  trains,
  onSelectTrain,
  networkAvgSpeed,
}) => {
  const [sort, setSort] = useState<SortState>({ field: 'spd', order: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [onlyOver100km, setOnlyOver100km] = useState(true);

  // Filter for >100km if checked (focuses on intercity & regional runs)
  const eligibleTrains = onlyOver100km ? trains.filter((t) => t.dist > 100) : trains;
  const sortedTrains = sortTrains(eligibleTrains, sort);

  const totalPages = Math.ceil(sortedTrains.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTrains = sortedTrains.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (sort.field === field) {
      setSort({ field, order: sort.order === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, order: field === 'spd' ? 'asc' : 'desc' });
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />;
    return sort.order === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
    );
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 shadow-xs text-slate-800 dark:text-slate-100">
      
      {/* Table Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            <h3 className="font-heading font-bold text-xl tracking-wide uppercase text-slate-900 dark:text-white">
              Service & Stoppage Explorer
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed operational metrics for all {eligibleTrains.length.toLocaleString()} matching train services. Click any service for its details.
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Distance threshold toggle */}
          <button
            onClick={() => {
              setOnlyOver100km(!onlyOver100km);
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1.5 rounded-lg border transition cursor-pointer font-medium ${
              onlyOver100km
                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {onlyOver100km ? '> 100 km Only (Active)' : 'All Distances'}
          </button>

          {/* Quick Speed Sort presets */}
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setSort({ field: 'spd', order: 'asc' });
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                sort.field === 'spd' && sort.order === 'asc'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Slowest First
            </button>
            <button
              onClick={() => {
                setSort({ field: 'spd', order: 'desc' });
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                sort.field === 'spd' && sort.order === 'desc'
                  ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Fastest First
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('no')}>
                <div className="flex items-center gap-1.5">
                  <span>Train</span>
                  {renderSortIcon('no')}
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1.5">
                  <span>Service Name</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th className="py-3 px-3">Route Corridor</th>
              <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('dist')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Dist (km)</span>
                  {renderSortIcon('dist')}
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('spd')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Speed</span>
                  {renderSortIcon('spd')}
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('halts')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Halts</span>
                  {renderSortIcon('halts')}
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white hidden lg:table-cell" onClick={() => handleSort('h100')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Halts/100km</span>
                  {renderSortIcon('h100')}
                </div>
              </th>
              <th className="py-3 px-3 text-center">Class AC</th>
              <th className="py-3 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {paginatedTrains.length > 0 ? (
              paginatedTrains.map((train) => {
                const isSlow = train.spd < networkAvgSpeed;
                const isSuperSlow = train.spd < 35;
                const isFast = train.spd >= 65;

                return (
                  <tr
                    key={train.no}
                    onClick={() => onSelectTrain(train)}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                  >
                    {/* Train No + Zone badge */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-amber-400 group-hover:underline">
                          #{train.no}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                          {train.zone}
                        </span>
                      </div>
                    </td>

                    {/* Name + Category badge */}
                    <td className="py-3 px-3 max-w-[200px] truncate">
                      <div className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white truncate">
                        {train.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {CATEGORIES[train.cat] || 'Standard'}
                      </div>
                    </td>

                    {/* Route Corridor */}
                    <td className="py-3 px-3 min-w-[220px]">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{train.from}</span>
                        <span className="text-slate-400 dark:text-slate-500 mx-1">→</span>
                        <span className="truncate">{train.to}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        Departs at {String(train.hr).padStart(2, '0')}:00 hrs
                      </div>
                    </td>

                    {/* Distance */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {train.dist} km
                    </td>

                    {/* Speed km/h */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                          isSuperSlow
                            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30'
                            : isSlow
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                            : isFast
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                        }`}
                      >
                        {isSuperSlow && <AlertTriangle className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />}
                        {train.spd.toFixed(1)} km/h
                      </span>
                    </td>

                    {/* Halts */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      <strong>{train.halts}</strong> stops
                    </td>

                    {/* Halts per 100km */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                      {train.h100.toFixed(2)}
                    </td>

                    {/* AC Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          train.ac
                            ? 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/60'
                        }`}
                      >
                        {train.ac ? 'AC' : 'Non-AC'}
                      </span>
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrain(train);
                        }}
                        className="p-1 rounded bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-500/20 text-slate-500 hover:text-amber-800 dark:text-slate-400 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        title="Inspect service details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-mono">
                  No train services match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
        <div>
          Showing <strong className="text-slate-800 dark:text-slate-200">{paginatedTrains.length ? startIndex + 1 : 0}</strong> to{' '}
          <strong className="text-slate-800 dark:text-slate-200">{Math.min(startIndex + pageSize, eligibleTrains.length)}</strong> of{' '}
          <strong className="text-slate-900 dark:text-white">{eligibleTrains.length.toLocaleString()}</strong> services
        </div>

        <div className="flex items-center gap-3">
          {/* Page size select */}
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none pl-2 pr-6 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-slate-400 dark:text-slate-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-700 dark:text-slate-200 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-700 dark:text-slate-200 shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
