# Power BI build guide (about 45 minutes, Power BI Desktop on Windows)

The finished report is `railgati-dashboard.pbix` (open it in Power BI Desktop). This file records how it was built, so it can be rebuilt from the CSVs. Numbers to match are the ones in the README, the React dashboard and `sql/outputs/`.
Note: `has_ac` already includes AC chair car, so the AC measures match the React dashboard.

## 1. Load the data
1. Home > Get data > Text/CSV: load `data/trains_clean.csv` and `data/station_traffic.csv`. Click Transform Data.
2. In `trains_clean`: set `distance`, `dep_hour`, `halts`, `has_ac` to Whole Number; `avg_speed_kmph`, `halts_per_100km` to Decimal Number; `number` to Text.
3. In `station_traffic`: sort by `trains_halting` descending, then `code` ascending. Add Column > Index Column > From 1, rename it `rank` (this makes the top-10% cut tie-safe).
4. Close & Apply. No relationships are needed: the two tables are independent.
5. View > Themes > Browse for themes: `railgati-theme.json` (light, same colours as the React dashboard) or `railgati-dark-theme.json` (colours only, used for the dark report). For the dark look also set Format page > Canvas background > Image to `railgati-dark-bg.png` (Image fit: Fill, transparency 0%); it has the panels drawn in, so visuals only need Background Off.

## 2. Sort order (Power BI sorts text A-Z, which scrambles the distance bands)
In `trains_clean`, New column:
```DAX
Band Order = SWITCH(trains_clean[band], "<100 km", 1, "100-300 km", 2, "300-700 km", 3, "700-1500 km", 4, "1500+ km", 5)
```
Select the `band` column > Column tools > Sort by column > `Band Order`.

## 3. Measures
In `trains_clean`:
```DAX
Train Services = COUNTROWS(trains_clean)
Avg Speed kmph = AVERAGE(trains_clean[avg_speed_kmph])
AC Share % = DIVIDE(CALCULATE(COUNTROWS(trains_clean), trains_clean[has_ac] = 1), [Train Services])
Non-AC Services = CALCULATE(COUNTROWS(trains_clean), trains_clean[has_ac] = 0)
Passenger Share % = DIVIDE(CALCULATE(COUNTROWS(trains_clean), trains_clean[category] = "Passenger & Suburban"), [Train Services])
Halts per 100km = AVERAGE(trains_clean[halts_per_100km])
Network Avg Speed = CALCULATE([Avg Speed kmph], ALL(trains_clean))
Below Avg Flag = IF([Avg Speed kmph] < [Network Avg Speed], "Below average", "At or above")
```
In `station_traffic`:
```DAX
Total Halts = SUM(station_traffic[trains_halting])
Top10pct Share =
VAR cut = ROUND(COUNTROWS(station_traffic) * 0.10, 0)
RETURN DIVIDE(
    CALCULATE(SUM(station_traffic[trains_halting]), station_traffic[rank] <= cut),
    [Total Halts])
```
Format `AC Share %`, `Passenger Share %`, `Top10pct Share` as Percentage with 1 decimal.

## 4. Check values (must match, otherwise a step above is wrong)
| Measure | Expected |
|---------|----------|
| Train Services | 5,147 |
| Avg Speed kmph | 41.6 |
| Non-AC Services where band = 300-700 km | 375 |
| Passenger Share % | 55.6% |
| Top10pct Share | 51.5% |
| Passenger & Suburban Avg Speed | 33.3 |

## 5. The report (one page, 16:9, 1280 x 720)
Dark background image with panels; 4 cards, 2 slicers and 6 visuals:

| Visual | Type | Fields | Notes |
|--------|------|--------|-------|
| Cards (4) | Card | Train Services, Avg Speed kmph, AC Share %, Passenger Share % | values must match step 4 |
| Slicers (2) | Tile / dropdown | `category`, `zone` | |
| Speed by Train Category (km/h) | Clustered column | `category` x Avg Speed kmph | Passenger & Suburban highlighted (Color > fx > Rules on Avg Speed kmph: 30 to 35 = amber) |
| Service Mix by Category | Donut | Legend `category`, Values Train Services | |
| Departures by Hour of Day | Clustered column | `dep_hour` (X-axis type: Categorical) x Train Services | |
| AC Coverage by Distance | Clustered column | `band` x AC Share % | 300-700 km highlighted (Rules on AC Share %: 0.5 to 0.8 = amber) |
| Speed by Railway Zone (km/h) | Clustered column | `zone` x Avg Speed kmph, sorted ascending | zones under 37 km/h highlighted (SECR, ECR, NER) |
| Top 10 Busiest Stations | Clustered bar | `station_name` x Sum of `trains_halting` | Top N filter: 10 by `trains_halting` |

`Unknown` zone is filtered out of the zone chart. Colours: blue `#38BDF8` normal, amber `#F59E0B` highlight.

## 6. What the report shows against the findings
- Finding 1: Speed by Train Category and Service Mix (Passenger & Suburban: 33.3 km/h, 55.6% of services).
- Finding 2: AC Coverage by Distance (300-700 km band is the gap).
- Finding 3: Top 10 Busiest Stations (Kanpur Central 286, Howrah Jn 283).
- Finding 4: Departures by Hour of Day (morning peak).
- Zone chart: SECR 32.9, ECR 33.1, NER 36.0 km/h are the slowest.

## 7. Screenshot
`docs/powerbi-dashboard.png` (also `docs/screenshots/10-powerbi-dashboard.png`): View > Fit to page, Windows + Shift + S.
Publishing the report to the web is optional; if you do, add the link to the README.
