export interface TrainService {
  no: string;
  name: string;
  cat: number;
  zone: string;
  dist: number;
  spd: number;
  halts: number;
  h100: number;
  ac: number;
  hr: number;
  band: number;
  from: string;
  to: string;
}

export interface HubStation {
  name: string;
  halting: number;
  passing: number;
}

export interface FilterState {
  search: string;
  zone: string;
  cat: string;
  band: string;
  ac: 'all' | 'ac_only' | 'no_ac';
  speedPreset: 'all' | 'slow' | 'fast';
  stationFilter: string;
}

export type SortField = 'no' | 'name' | 'dist' | 'spd' | 'halts' | 'h100';
export type SortOrder = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  order: SortOrder;
}

export interface ZoneMetric {
  zone: string;
  avgSpeed: number;
  totalServices: number;
  passengerPercent: number;
  acPercent: number;
}
