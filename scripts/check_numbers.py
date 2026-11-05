"""Recompute the headline numbers quoted in the README and dashboard and fail if they drift.

Run from the repo root:  python scripts/check_numbers.py
"""
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
t = pd.read_csv(ROOT / "data" / "trains_clean.csv", dtype={"number": str})
s = pd.read_csv(ROOT / "data" / "station_traffic.csv").sort_values("trains_halting", ascending=False)

pas = t[t.category == "Passenger & Suburban"]
exp = t[t.category == "Express & Superfast"]
mid = t[t.band == "300-700 km"]
top = s.trains_halting.head(int(round(len(s) * 0.1))).sum() / s.trains_halting.sum()

checks = {
    "5,163 train services": len(t) == 5163,
    "8,497 stations": len(s) == 8497,
    "52.9% passenger share": round(100 * len(pas) / len(t), 1) == 52.9,
    "33.4 km/h passenger speed": round(pas.avg_speed_kmph.mean(), 1) == 33.4,
    "50.4 km/h express speed": round(exp.avg_speed_kmph.mean(), 1) == 50.4,
    "375 of 997 non-AC in 300-700 km": (int((mid.has_ac == 0).sum()), len(mid)) == (375, 997),
    "51.5% of halts at top 10% stations": round(100 * top, 1) == 51.5,
    "12.0 halts per 100 km network average": round(t.halts_per_100km.mean(), 1) == 12.0,
    "no train above its speed cap (110 / 140 km/h)": bool((t.avg_speed_kmph <= (t.category == "Premium / Fast-track").map({True: 140, False: 110})).all()),
    "25.6% of departures 05:00-08:59": round(100 * t.dep_hour.between(5, 8).mean(), 1) == 25.6,
    "30.4% of stations with 3 or fewer halts": round(100 * (s.trains_halting <= 3).mean(), 1) == 30.4,
}
for name, ok in checks.items():
    print(("OK   " if ok else "FAIL ") + name)
sys.exit(0 if all(checks.values()) else 1)
