-- Indian Railways Service Network Analysis | SQL used to produce dashboard KPIs
-- Tables: trains (one row per train service), station_traffic (one row per station)

-- KPI 1: network size
SELECT COUNT(*) AS train_services, (SELECT COUNT(*) FROM station_traffic) AS stations FROM trains;

-- KPI 2: speed & halt density by category
SELECT category, COUNT(*) AS services,
       ROUND(100.0*COUNT(*)/(SELECT COUNT(*) FROM trains),1) AS pct_of_services,
       ROUND(AVG(avg_speed_kmph),1) AS avg_speed_kmph,
       ROUND(AVG(halts_per_100km),1) AS halts_per_100km
FROM trains GROUP BY category ORDER BY services DESC;

-- KPI 3: AC availability gap by distance band
SELECT band, COUNT(*) AS services, SUM(1-has_ac) AS non_ac_services,
       ROUND(100.0*SUM(has_ac)/COUNT(*),1) AS ac_share_pct
FROM trains GROUP BY band ORDER BY MIN(distance);

-- KPI 4: zones ranked by speed (window function) with passenger-heavy flag
WITH z AS (
  SELECT zone, COUNT(*) AS services, ROUND(AVG(avg_speed_kmph),1) AS avg_speed,
         ROUND(100.0*AVG(category='Passenger & Suburban'),1) AS passenger_pct
  FROM trains WHERE zone<>'Unknown' GROUP BY zone)
SELECT zone, services, avg_speed, passenger_pct,
       RANK() OVER (ORDER BY avg_speed) AS slowest_rank
FROM z ORDER BY slowest_rank LIMIT 5;

-- KPI 5: hub concentration - cumulative share of halting events (top decile of stations)
WITH r AS (
  SELECT station_name, trains_halting,
         ROW_NUMBER() OVER (ORDER BY trains_halting DESC) AS rn,
         COUNT(*) OVER () AS n,
         SUM(trains_halting) OVER () AS total,
         SUM(trains_halting) OVER (ORDER BY trains_halting DESC, code ROWS UNBOUNDED PRECEDING) AS running
  FROM station_traffic)
SELECT rn, station_name, trains_halting, ROUND(100.0*running/total,1) AS cum_share_pct
FROM r WHERE rn IN (1,10,85,425,850) ORDER BY rn;

-- Drill-down: slow, passenger-heavy services in the slowest zone
SELECT number, name, from_station_name, to_station_name, distance, avg_speed_kmph, halts
FROM trains WHERE zone='ECR' AND category='Passenger & Suburban' AND distance>100
ORDER BY avg_speed_kmph LIMIT 10;
