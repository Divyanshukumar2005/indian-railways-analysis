"""Feed the React dashboard: rewrite the data block in dashboard-react/src/data/railwayData.ts.

Reads only the committed files in data/ (trains_clean.csv, station_traffic.csv, speed_halts_*), so it runs
without the raw download. Every number shown in the dashboard comes from here; nothing is typed by hand.

Run from anywhere:  python scripts/build_dashboard.py
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
import facts  # noqa: E402

ROOT = facts.ROOT
TS_FILE = ROOT / "dashboard-react" / "src" / "data" / "railwayData.ts"
START = "export const rawRailwayData: RailwayDataset = "
END = ";\n\nexport const TRAINS_DATA"

CATS = ["Premium / Fast-track", "Express & Superfast", "Passenger & Suburban", "Heritage / Toy"]
BANDS = facts.BAND_ORDER


def build():
    t, stations, check, summary = facts.load()
    t["name"] = t["name"].fillna("Unnamed Service")   # a few trains have no name in the source data

    # one compact row per train; column order is the contract with src/data/railwayData.ts
    rows = [
        [num, name, CATS.index(cat), zone, int(dist), float(spd), int(halts), float(h100), int(ac),
         int(hr), BANDS.index(band), origin.title(), dest.title()]
        for num, name, cat, zone, dist, spd, halts, h100, ac, hr, band, origin, dest in zip(
            t.number, t.name, t.category, t.zone, t.distance, t.avg_speed_kmph, t.halts, t.halts_per_100km,
            t.has_ac, t.dep_hour, t.band, t.from_station_name, t.to_station_name)
    ]

    # Lorenz-style curve: cumulative share of halting events, busiest stations first, per 1% of stations
    n = len(stations)
    total = stations.trains_halting.sum()
    cum = [round(100 * stations.trains_halting.head(int(round(n * p / 100))).sum() / total, 2) for p in range(101)]
    hubs = [[r.station_name, int(r.trains_halting), int(r.trains_passing)] for r in stations.head(10).itertuples()]

    # What-if simulator inputs, all measured from the data:
    #   slope = OLS slope of average speed on halts per 100 km, passenger & suburban services of 100 km or more
    pas = t[(t.category == facts.PASSENGER) & (t.distance >= 100)]
    slope, _ = np.polyfit(pas.halts_per_100km, pas.avg_speed_kmph, 1)
    sim = dict(slope=round(float(slope), 3), n=int(len(pas)),
               base_speed=round(float(pas.avg_speed_kmph.mean()), 1),
               base_h100=round(float(pas.halts_per_100km.mean()), 1),
               avg_dist=round(float(pas.distance.mean())),
               dwell_per_halt=summary["dwell_per_halt_min"],
               non_ac_mid=int(((t.band == "300-700 km") & (t.has_ac == 0)).sum()))

    return dict(trains=rows, cats=CATS, bands=BANDS, cum=cum, hubs=hubs, nstations=n,
                low3=round(100 * (stations.trains_halting <= 3).mean(), 1),
                corr=float(check.loc["ALL", "r_speed_vs_halts100"]),
                corr_run=float(check.loc["ALL", "r_runspeed_vs_halts100"]),
                avg_h100=round(float(t.halts_per_100km.mean()), 1),
                sim=sim, facts=facts.compute())


def main():
    data = build()
    src = TS_FILE.read_text()
    a = src.index(START) + len(START)
    b = src.index(END)
    TS_FILE.write_text(src[:a] + json.dumps(data, separators=(",", ":")) + src[b:])
    print(f"updated {TS_FILE.relative_to(ROOT)}: {len(data['trains'])} trains, {data['nstations']} stations, "
          f"top-10% share {data['cum'][10]}%, simulator slope {data['sim']['slope']}")


if __name__ == "__main__":
    main()
