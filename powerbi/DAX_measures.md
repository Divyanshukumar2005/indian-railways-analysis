# Power BI build guide (about 45 minutes)

Status: guide only. No .pbix file has been built yet.
Note: `has_ac` already includes AC chair car (`chair_car`), so the AC measures below match the HTML dashboard.

1. Get Data > Text/CSV: load `trains_clean.csv`, `station_traffic.csv` from the `data` folder. Keep column types as detected, set `dep_hour` and `distance` to Whole Number.
2. Create a Date-free model: no relationships needed (two independent tables).
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
Measure on `station_traffic` (sort stations by halts, then cumulative share):
```DAX
Total Halts = SUM(station_traffic[trains_halting])
Top10pct Share =
VAR n = COUNTROWS(station_traffic)
VAR cut = ROUNDUP(n*0.10,0)
VAR top = TOPN(cut, station_traffic, station_traffic[trains_halting], DESC)
RETURN DIVIDE(SUMX(top, station_traffic[trains_halting]), [Total Halts])
```
4. Page 1 "Overview": 5 KPI cards (Train Services, Avg Speed, AC Share %, Passenger Share %, Top10pct Share); slicers for `zone`, `category`, `band`.
5. Visuals: bar `category` x Avg Speed; bar `band` x AC Share %; bar `zone` x Avg Speed coloured by Below Avg Flag; column `dep_hour` x Train Services; table of slowest services (Top N 12 by avg_speed_kmph ascending, filter distance > 100).
6. Page 2 "Recommendations": 4 text boxes copied from the dashboard findings.
7. File > Publish to web, and put the link plus screenshots on your resume and README.
