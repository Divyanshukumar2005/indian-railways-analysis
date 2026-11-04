# Setup (Mac / Windows)

Needs: Python 3.9+, Node.js 20+ (only for the React dashboard), Git (only for GitHub).

## 1. Python pipeline
```bash
cd path/to/railway
python3 -m venv venv                 # Windows: python -m venv venv
source venv/bin/activate             # Windows: venv\Scripts\activate
pip install -r requirements.txt

python scripts/download_data.py      # raw/ gets 3 JSON files (about 100 MB)
python scripts/clean.py              # data/*.csv and data/cleaning_log.txt
python sql/load.py                   # data/railways.db
python sql/run_queries.py            # sql/outputs/
python scripts/speed_vs_halts.py
python scripts/check_numbers.py      # every line must say OK
python scripts/build_dashboard.py    # refreshes both dashboards
```
If the download fails, put `trains.json`, `stations.json`, `schedules.json` from https://github.com/datameet/railways into `raw/` by hand.

## 2. Dashboards
```bash
open dashboard/dashboard.html        # Windows: start dashboard\dashboard.html
cd dashboard-react && npm install && npm run dev      # http://localhost:3000
npm run build                                         # static site in dashboard-react/dist
```

## 3. GitHub
```bash
git init && git add . && git status  # check venv/, raw/, node_modules/ are NOT listed
git commit -m "Indian Railways service network analysis"
git branch -M main
git remote add origin https://github.com/<username>/indian-railways-analysis.git
git push -u origin main
```

## 4. Power BI (Windows only)
Follow `powerbi/DAX_measures.md`. Load `data/trains_clean.csv` and `data/station_traffic.csv`.
