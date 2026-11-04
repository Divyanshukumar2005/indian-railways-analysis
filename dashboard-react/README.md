# RailGati dashboard (React + TypeScript + Tailwind)

Interactive version of the analysis. All data comes from the Python pipeline in the parent folder:
`python scripts/build_dashboard.py` rewrites `src/data/railwayData.ts` from `data/trains_clean.csv` and `data/station_traffic.csv`.
Do not edit the data block in that file by hand.

## Run
```bash
cd dashboard-react
npm install
npm run dev        # http://localhost:3000
npm run build      # production build in dist/
```
Needs Node.js 20 or newer. No API key is needed.
