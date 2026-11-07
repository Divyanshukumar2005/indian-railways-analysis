import { TrainService, FilterState, ZoneMetric, SortState } from '../types';
import { CATEGORIES, DISTANCE_BANDS } from '../data/railwayData';

export const mean = (arr: number[]): number => {
  if (!arr.length) return 0;
  return arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
};

export const formatSpeed = (val: number): string => {
  return isNaN(val) ? '0.0' : val.toFixed(1);
};

export const filterTrains = (
  trains: TrainService[],
  filters: FilterState,
  skipFilterKey?: keyof FilterState
): TrainService[] => {
  return trains.filter(t => {
    // Search query: match train no, train name, origin, or destination
    if (skipFilterKey !== 'search' && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matchNo = t.no.toLowerCase().includes(q);
      const matchName = t.name.toLowerCase().includes(q);
      const matchFrom = t.from.toLowerCase().includes(q);
      const matchTo = t.to.toLowerCase().includes(q);
      if (!matchNo && !matchName && !matchFrom && !matchTo) return false;
    }

    // Zone filter
    if (skipFilterKey !== 'zone' && filters.zone) {
      if (t.zone !== filters.zone) return false;
    }

    // Category filter
    if (skipFilterKey !== 'cat' && filters.cat !== '') {
      if (t.cat !== Number(filters.cat)) return false;
    }

    // Distance band filter
    if (skipFilterKey !== 'band' && filters.band !== '') {
      if (t.band !== Number(filters.band)) return false;
    }

    // AC status
    if (skipFilterKey !== 'ac' && filters.ac !== 'all') {
      if (filters.ac === 'ac_only' && !t.ac) return false;
      if (filters.ac === 'no_ac' && t.ac) return false;
    }

    // Speed Preset
    if (skipFilterKey !== 'speedPreset' && filters.speedPreset !== 'all') {
      if (filters.speedPreset === 'slow' && t.spd >= 40) return false;
      if (filters.speedPreset === 'fast' && t.spd < 65) return false;
    }

    // Departure window: morning rush = departures between 05:00 and 08:59
    if (skipFilterKey !== 'depWindow' && filters.depWindow === 'morning') {
      if (t.hr < 5 || t.hr > 8) return false;
    }

    // Specific station filter (matches origin or destination only)
    if (skipFilterKey !== 'stationFilter' && filters.stationFilter) {
      const st = filters.stationFilter.toLowerCase();
      const match = t.from.toLowerCase().includes(st) || t.to.toLowerCase().includes(st);
      if (!match) return false;
    }

    return true;
  });
};

export const sortTrains = (trains: TrainService[], sort: SortState): TrainService[] => {
  const sorted = [...trains];
  sorted.sort((a, b) => {
    let comp = 0;
    switch (sort.field) {
      case 'spd':
        comp = a.spd - b.spd;
        break;
      case 'dist':
        comp = a.dist - b.dist;
        break;
      case 'halts':
        comp = a.halts - b.halts;
        break;
      case 'h100':
        comp = a.h100 - b.h100;
        break;
      case 'name':
        comp = a.name.localeCompare(b.name);
        break;
      case 'no':
      default:
        comp = a.no.localeCompare(b.no, undefined, { numeric: true });
        break;
    }
    return sort.order === 'asc' ? comp : -comp;
  });
  return sorted;
};

export const getCategoryStats = (trains: TrainService[], allFilteredWithoutCat: TrainService[]) => {
  return CATEGORIES.map((label, idx) => {
    const list = allFilteredWithoutCat.filter(t => t.cat === idx);
    const count = list.length;
    const avgSpd = count ? mean(list.map(t => t.spd)) : 0;
    const avgHalts100 = count ? mean(list.map(t => t.h100)) : 0;
    const acPercent = count ? (list.filter(t => t.ac).length / count) * 100 : 0;
    return {
      index: idx,
      label,
      count,
      avgSpd,
      avgHalts100,
      acPercent
    };
  });
};

export const getBandStats = (trains: TrainService[], allFilteredWithoutBand: TrainService[]) => {
  return DISTANCE_BANDS.map((label, idx) => {
    const list = allFilteredWithoutBand.filter(t => t.band === idx);
    const count = list.length;
    const acCount = list.filter(t => t.ac).length;
    const acPercent = count ? (acCount / count) * 100 : 0;
    const avgSpd = count ? mean(list.map(t => t.spd)) : 0;
    return {
      index: idx,
      label,
      count,
      acCount,
      nonAcCount: count - acCount,
      acPercent,
      avgSpd
    };
  });
};

export const getZoneMetrics = (
  zones: string[],
  allFilteredWithoutZone: TrainService[]
): ZoneMetric[] => {
  return zones
    .map(zone => {
      const list = allFilteredWithoutZone.filter(t => t.zone === zone);
      const totalServices = list.length;
      if (!totalServices) return null;
      const avgSpeed = mean(list.map(t => t.spd));
      const passengerPercent = (list.filter(t => t.cat === 2).length / totalServices) * 100;
      const acPercent = (list.filter(t => t.ac).length / totalServices) * 100;
      return {
        zone,
        avgSpeed,
        totalServices,
        passengerPercent,
        acPercent
      };
    })
    .filter((item): item is ZoneMetric => item !== null)
    .sort((a, b) => a.avgSpeed - b.avgSpeed); // Slowest first
};

export const getHourlyDistribution = (trains: TrainService[]) => {
  const hours = Array(24).fill(0);
  trains.forEach(t => {
    if (t.hr >= 0 && t.hr < 24) {
      hours[t.hr]++;
    }
  });
  const max = Math.max(1, ...hours);
  return {
    hours,
    max,
    peakHours: [6, 7, 8, 17, 18, 19],
    morningRushPercent: trains.length ? (hours.slice(5, 9).reduce((a, b) => a + b, 0) / trains.length) * 100 : 0,
    nightDropPercent: trains.length ? (hours.slice(0, 4).reduce((a, b) => a + b, 0) / trains.length) * 100 : 0,
  };
};

export const exportToCSV = (trains: TrainService[], filename = 'railgati_train_services.csv') => {
  const headers = ['Train No', 'Train Name', 'Category', 'Railway Zone', 'Distance (km)', 'Speed (km/h)', 'Total Halts', 'Halts per 100km', 'Has AC', 'Departure Hour', 'Origin', 'Destination'];
  const rows = trains.map(t => [
    `"${t.no}"`,
    `"${t.name.replace(/"/g, '""')}"`,
    `"${CATEGORIES[t.cat] || 'Unknown'}"`,
    `"${t.zone}"`,
    t.dist,
    t.spd.toFixed(1),
    t.halts,
    t.h100.toFixed(2),
    t.ac ? 'Yes' : 'No',
    `${String(t.hr).padStart(2, '0')}:00`,
    `"${t.from.replace(/"/g, '""')}"`,
    `"${t.to.replace(/"/g, '""')}"`
  ]);

  // Blob download: works with any characters in train names (a data: URI breaks on '#')
  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const url = URL.createObjectURL(new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
