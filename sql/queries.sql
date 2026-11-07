-- Indian Railways Service Network Analysis | SQL behind the dashboard KPIs
-- Tables (SQLite, built by sql/load.py):
--   trains           one row per train service  (category, zone, band, avg_speed_kmph, halts_per_100km, has_ac ...)
--   station_traffic  one row per station        (trains_halting, trains_passing)
-- Run all queries with: python sql/run_queries.py   (results land in sql/outputs/ and sql/outputs/RESULTS.md)

-- @name kpi_1_network_size
-- KPI 1: network size
SELECT COUNT(*) AS train_services,
       (SELECT COUNT(*) FROM station_traffic) AS stations
FROM trains;

-- @name kpi_2_speed_by_category
-- KPI 2: speed and halt density by train category
SELECT category,
       COUNT(*) AS services,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM trains), 1) AS pct_of_services,
       ROUND(AVG(avg_speed_kmph), 1) AS avg_speed_kmph,
       ROUND(AVG(halts_per_100km), 1) AS halts_per_100km
FROM trains
GROUP BY category
ORDER BY services DESC;

-- @name kpi_3_ac_gap_by_distance_band
-- KPI 3: AC availability gap by distance band
SELECT band,
       COUNT(*) AS services,
       SUM(1 - has_ac) AS non_ac_services,
       ROUND(100.0 * SUM(has_ac) / COUNT(*), 1) AS ac_share_pct
FROM trains
GROUP BY band
ORDER BY MIN(distance);

-- @name kpi_4_slowest_zones
-- KPI 4: five slowest railway zones (RANK window function), with their passenger share
WITH z AS (
  SELECT zone,
         COUNT(*) AS services,
         ROUND(AVG(avg_speed_kmph), 1) AS avg_speed,
         ROUND(100.0 * AVG(category = 'Passenger & Suburban'), 1) AS passenger_pct
  FROM trains
  WHERE zone <> 'Unknown'
  GROUP BY zone)
SELECT zone, services, avg_speed, passenger_pct,
       RANK() OVER (ORDER BY avg_speed) AS slowest_rank
FROM z
ORDER BY slowest_rank
LIMIT 5;

-- @name kpi_5_hub_concentration
-- KPI 5: hub concentration, cumulative share of halting events held by the busiest stations
WITH r AS (
  SELECT code, station_name, trains_halting,
         ROW_NUMBER() OVER (ORDER BY trains_halting DESC, code) AS rn,
         COUNT(*) OVER () AS n,
         SUM(trains_halting) OVER () AS total,
         SUM(trains_halting) OVER (ORDER BY trains_halting DESC, code
                                   ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running
  FROM station_traffic),
cuts(label, pct) AS (
  VALUES ('busiest 1%', 0.01), ('busiest 5%', 0.05), ('busiest 10%', 0.10), ('busiest 25%', 0.25), ('busiest 50%', 0.50))
SELECT label,
       r.rn AS stations,
       ROUND(100.0 * r.running / r.total, 1) AS cum_share_of_halts_pct
FROM cuts
JOIN r ON r.rn = CAST(ROUND(r.n * cuts.pct) AS INTEGER)
ORDER BY cuts.pct;

-- @name kpi_6_ac_share_by_zone_300_700km
-- KPI 6: AC share inside the 300-700 km band by zone (zones with at least 20 services in the band)
SELECT zone,
       COUNT(*) AS services_in_band,
       SUM(1 - has_ac) AS non_ac_services,
       ROUND(100.0 * AVG(has_ac), 1) AS ac_share_pct,
       RANK() OVER (ORDER BY AVG(has_ac)) AS lowest_ac_rank
FROM trains
WHERE band = '300-700 km' AND zone <> 'Unknown'
GROUP BY zone
HAVING COUNT(*) >= 20
ORDER BY lowest_ac_rank
LIMIT 5;

-- @name kpi_7_passenger_vs_express_gap_by_zone
-- KPI 7: speed gap between express and passenger services by zone (at least 5 services of each type)
SELECT zone,
       ROUND(AVG(CASE WHEN category = 'Express & Superfast'   THEN avg_speed_kmph END), 1) AS express_kmph,
       ROUND(AVG(CASE WHEN category = 'Passenger & Suburban'  THEN avg_speed_kmph END), 1) AS passenger_kmph,
       ROUND(AVG(CASE WHEN category = 'Express & Superfast'   THEN avg_speed_kmph END)
           - AVG(CASE WHEN category = 'Passenger & Suburban'  THEN avg_speed_kmph END), 1) AS gap_kmph
FROM trains
WHERE zone <> 'Unknown'
GROUP BY zone
HAVING SUM(category = 'Express & Superfast') >= 5 AND SUM(category = 'Passenger & Suburban') >= 5
ORDER BY gap_kmph DESC
LIMIT 5;

-- @name drill_down_slowest_passenger_routes
-- Drill-down: slowest passenger routes of 100 km or more in the slowest zone from KPI 4
-- Grouped by origin and destination, so the same route run by several train numbers appears once.
WITH slowest_zone AS (
  SELECT zone FROM trains WHERE zone <> 'Unknown' GROUP BY zone ORDER BY AVG(avg_speed_kmph) LIMIT 1)
SELECT from_station_name, to_station_name,
       ROUND(AVG(distance)) AS distance_km,
       COUNT(*) AS services,
       MIN(avg_speed_kmph) AS slowest_kmph,
       ROUND(AVG(avg_speed_kmph), 1) AS avg_kmph
FROM trains
WHERE zone = (SELECT zone FROM slowest_zone)
  AND category = 'Passenger & Suburban'
  AND distance >= 100
GROUP BY from_station_code, to_station_code
ORDER BY slowest_kmph
LIMIT 10;
