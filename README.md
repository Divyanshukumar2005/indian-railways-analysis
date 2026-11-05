# Indian Railways Service Network Analysis

![Dashboard](docs/dashboard.png)
Live demo: https://indian-railways-analysis.vercel.app

Business question: where is the Indian Railways passenger network slow, short on AC, or overloaded, and what should a planner do first?

Data: [datameet/railways](https://github.com/datameet/railways) timetable (CC0): `trains.json`, `stations.json`, `schedules.json`. Cleaned with Python/pandas (`scripts/clean.py`), KPIs in SQL (`sql/queries.sql`, saved results in `sql/outputs/RESULTS.md`), and an interactive React + TypeScript dashboard (`dashboard-react/`) filled with the same data by `scripts/build_dashboard.py`.

Power BI: only a build guide with DAX measures is included (`powerbi/DAX_measures.md`). No `.pbix` has been built yet (Power BI Desktop runs on Windows only), so the interactive dashboard here is the React app.

## How to run
```bash
pip install -r requirements.txt
python scripts/download_data.py      # downloads the 3 raw JSON files into raw/
python scripts/clean.py              # writes data/*.csv and data/cleaning_log.txt
python sql/load.py                   # builds data/railways.db (SQLite)
python sql/run_queries.py            # saves query results to sql/outputs/
python scripts/speed_vs_halts.py     # speed vs halts checks (see below)
python scripts/check_numbers.py      # checks the headline numbers quoted in this README
python scripts/build_dashboard.py    # rewrites dashboard-react/src/data/railwayData.ts

cd dashboard-react                   # React dashboard (needs Node.js 20+)
npm install
npm run dev                          # http://localhost:3000
```
`npm run build` makes a static site in `dashboard-react/dist` that any static host can serve.

`data/schedules_clean.csv` (17 MB) is git-ignored; `clean.py` recreates it. The other CSVs in `data/` are committed so the dashboard and Power BI guide work without re-running anything.

## Key findings
- Passenger & suburban services are 52.9% of 5,163 services but average 33.4 km/h vs 50.4 for express. They also stop far more often (17.4 halts per 100 km vs 3.1). Part of the speed gap is mechanical: standing time counts in journey time (about 8% of all journey time). It is not only that: with standing time removed, running speed still falls as halts per 100 km rise (r = -0.37 overall; -0.32 to -0.72 within each distance band of 100 km and above; raw r = -0.51). Under 100 km the effect disappears (r = +0.19).
- SECR, ECR and NER are the slowest zones (33.2, 33.7, 36.0 km/h) with 67 to 74% passenger share.
- 375 of 997 services in the 300 to 700 km band (38%) have no AC; over 700 km, 95 to 96% do. AC means any of 1A, 2A, 3A or AC chair car.
- The busiest 10% of stations account for 51.5% of halting events.
- 05:00 to 08:59 holds 25.6% of departures; 00:00 to 03:59 only 2.5%.

## Recommendations
1. **Cut stops on slow passenger services.** Review stoppage patterns in SECR, ECR and NER first; convert long passenger runs to fast-passenger or MEMU-style patterns.
2. **Add AC capacity on 300 to 700 km routes.** Add AC coaches (3AC or AC chair car) on the busiest non-AC corridors in NER, NWR and WCR, which have the lowest AC share within the 300 to 700 km band (31%, 39%, 41%; zones with at least 20 services in the band), before extending long-distance AC further.
3. **Plan capacity around the hubs.** Prioritise platform and pit-line capacity at the top hubs (Kanpur Central, Howrah), and review stoppages at the many stations with three or fewer halting services.
4. **Use the quiet hours.** Test shifting some new or extra services into the midday window to ease terminal congestion at the morning peak.

## Cleaning steps
Dropped 42 trains without valid distance/duration and 3 with impossible speed (above 140 km/h, or above 110 km/h for anything that is not a premium train; this catches a 'Passenger' timetable at 131 km/h); fixed duration (hours + minutes columns); filled 94 missing zones from origin station (177 trains stay `Unknown` zone and are left out of the zone rankings); treated arrival = departure as pass-through, not a halt; dropped placeholder stations.

## Dashboard notes
![Simulator](docs/simulator.png)

- The "What-if Simulator" is an illustration, not a forecast. Its only inputs are measured from this data: the slope of average speed on halts per 100 km for passenger & suburban services of 100 km or more (about -0.33 km/h per halt per 100 km, 1,470 services) and their average speed, halts and distance. It describes a pattern across trains, so cutting stops on one train is not guaranteed to give that gain.
- "Est. standing time" in the train detail view = intermediate halts x the average dwell per halt measured from the schedules (about 3.1 min).

## Definitions and limits
- **AC**: `has_ac = 1` if the train has 1A, 2A, 3A or chair car (CC). The datameet README does not define the `chair_car` flag; this assumes it means AC Chair Car, as CC does in Indian Railways class codes. Second sitting (2S) is non-AC and is not counted. Shatabdi is 100% chair car, so leaving CC out would wrongly mark some Shatabdi as non-AC.
- **Halts**: a stop where arrival and departure differ. A train's origin (no arrival time) and terminus (no departure time) are counted as halts, which adds 2 halts per train: about 12.0 halts per 100 km with them, 9.9 without. Station-level halting counts keep these events, since trains do stop there.
- **Speed vs halts**: average speed = distance / total time, and total time includes standing time, so some negative correlation is built in. `scripts/speed_vs_halts.py` checks it within distance bands and with standing time removed; results are in `data/speed_halts_check.csv`.
- No running days, ridership or revenue in the data: figures show service supply, not demand, and a service is not a daily train.
- The datameet data is a community-collected snapshot and looks several years old, so findings describe that timetable, not today's network.

## License
Code: MIT (see `LICENSE`). Data: datameet/railways, CC0.
