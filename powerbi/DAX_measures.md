# Power BI build guide (about 45 minutes)

Status: guide only. No .pbix file has been built yet.
Note: `has_ac` already includes AC chair car (`chair_car`), so the AC measures below match the React dashboard.

1. Get Data > Text/CSV: load `trains_clean.csv`, `station_traffic.csv` from the `data` folder. Keep column types as detected, set `dep_hour` and `distance` to Whole Number.
2. No relationships are needed: the two tables are independent.
   In Power Query, sort `station_traffic` by `trains_halting` descending, then `code` ascending, and add an Index column starting at 1 named `rank` (this makes the top-10% cut tie-safe).
3. Add these measures to table `trains_clean`:

```DAX
Train Services = COUNTROWS(trains_clean)
Avg Speed kmph = AVERAGE(trains_clean[avg_speed_kmph])
AC Share % = DIVIDE(CALCULATE(COUNTROWS(trains_clean), trains_clean[has_ac]=1), [Train Services])
Non-AC Services = CALCULATE(COUNTROWS(trains_clean), trains_clean[has_ac]=0)
Passenger Share % = DIVIDE(CALCULATE(COUNTROWS(trains_clean), trains_clean[category]="Passenger & Suburban"), [Train Services])
Halts per 100km = AVERAGE(trains_clean[halts_per_100km])
Network Avg Speed = CALCULATE([Avg Speed kmph], ALL(trains_clean))
Below Avg Flag = IF([Avg Speed kmph] < [Network Avg Speed], "Below average", "At or above")
```
Measures on `station_traffic`. With the index column above, Top10pct Share should read 51.5%, the same as the dashboard and SQL KPI 5:
```DAX
Total Halts = SUM(station_traffic[trains_halting])
Top10pct Share =
VAR cut = ROUND(COUNTROWS(station_traffic) * 0.10, 0)
RETURN DIVIDE(
    CALCULATE(SUM(station_traffic[trains_halting]), station_traffic[rank] <= cut),
    [Total Halts])
```
4. Page 1 "Overview": 5 KPI cards (Train Services, Avg Speed, AC Share %, Passenger Share %, Top10pct Share); slicers for `zone`, `category`, `band`.
5. Visuals: bar `category` x Avg Speed; bar `band` x AC Share %; bar `zone` x Avg Speed coloured by Below Avg Flag; column `dep_hour` x Train Services; table of slowest services (Top N 12 by avg_speed_kmph ascending, filter distance > 100).
6. Page 2 "Recommendations": 4 text boxes copied from the dashboard findings.
7. File > Publish to web, then add the link and screenshots to the README.
