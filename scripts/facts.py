"""Every headline number used in the README, notebook and dashboard, computed in one place.

`compute()` reads only the committed CSV/JSON files in data/, so it also runs in CI.
- scripts/build_dashboard.py writes the result into the React app (no number is typed by hand there)
- scripts/check_numbers.py checks that README.md and the notebook still quote these values
"""
from pathlib import Path

import pandas as pd
import json

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
PASSENGER, EXPRESS = "Passenger & Suburban", "Express & Superfast"
BAND_ORDER = ["<100 km", "100-300 km", "300-700 km", "700-1500 km", "1500+ km"]


def load():
    t = pd.read_csv(DATA / "trains_clean.csv", dtype={"number": str})
    s = pd.read_csv(DATA / "station_traffic.csv").sort_values("trains_halting", ascending=False, kind="stable")
    chk = pd.read_csv(DATA / "speed_halts_check.csv").set_index("group")
    summ = json.loads((DATA / "speed_halts_summary.json").read_text())
    return t, s, chk, summ


def compute():
    t, s, chk, summ = load()
    pas, exp = t[t.category == PASSENGER], t[t.category == EXPRESS]
    mid = t[t.band == "300-700 km"]
    known = t[t.zone != "Unknown"]
    n_st = len(s)
    top10 = s.trains_halting.head(int(round(n_st * 0.10))).sum() / s.trains_halting.sum()

    zone = known.groupby("zone").agg(speed=("avg_speed_kmph", "mean"), n=("number", "count"),
                                     pas=("category", lambda x: (x == PASSENGER).mean() * 100))
    slow = zone.sort_values("speed").head(3)
    bz = mid[mid.zone != "Unknown"].groupby("zone").agg(n=("number", "count"), ac=("has_ac", "mean"))
    low_ac = bz[bz.n >= 20].ac.sort_values().head(3) * 100

    band_ac = t.groupby("band").has_ac.mean().mul(100)
    long_ac = [band_ac["700-1500 km"], band_ac["1500+ km"]]
    in_bands = chk.loc[["100-300 km", "300-700 km", "700-1500 km", "1500+ km"], "r_runspeed_vs_halts100"]
    dep = t.dep_hour
    midday = 100 * dep.between(10, 12).mean()

    return {
        "n_services": len(t),
        "n_stations": n_st,
        "n_zones": int(known.zone.nunique()),
        "n_unknown_zone": int((t.zone == "Unknown").sum()),
        "pas_share": round(100 * len(pas) / len(t), 1),
        "pas_speed": round(pas.avg_speed_kmph.mean(), 1),
        "exp_speed": round(exp.avg_speed_kmph.mean(), 1),
        "pas_h100": round(pas.halts_per_100km.mean(), 1),
        "exp_h100": round(exp.halts_per_100km.mean(), 1),
        "avg_h100": round(t.halts_per_100km.mean(), 1),
        "avg_h100_no_ends": summ["mean_halts_per_100km_without_ends"],
        "slow_zones": [{"zone": z, "speed": round(r.speed, 1), "passenger_pct": round(r.pas)}
                       for z, r in slow.iterrows()],
        "mid_total": len(mid),
        "mid_non_ac": int((mid.has_ac == 0).sum()),
        "mid_non_ac_pct": round(100 * (mid.has_ac == 0).mean()),
        "long_ac_pct": [round(min(long_ac)), round(max(long_ac))],
        "low_ac_zones": [{"zone": z, "ac_pct": round(v)} for z, v in low_ac.items()],
        "top10_share": round(100 * top10, 1),
        "low3_pct": round(100 * (s.trains_halting <= 3).mean(), 1),
        "hubs": [{"name": r.station_name, "halts": int(r.trains_halting)} for r in s.head(3).itertuples()],
        "dep_morning_pct": round(100 * dep.between(5, 8).mean(), 1),
        "dep_midday_pct": round(midday, 1),
        "dep_midday_per_hour": round(midday / 3, 1),
        "dep_per_hour_avg": round(100 / 24, 1),
        "dep_night_pct": round(100 * dep.between(0, 3).mean(), 1),
        "r_raw": float(chk.loc["ALL", "r_speed_vs_halts100"]),
        "r_run": float(chk.loc["ALL", "r_runspeed_vs_halts100"]),
        "r_run_band_min": float(in_bands.min()),
        "r_run_band_max": float(in_bands.max()),
        "r_short": float(chk.loc["<100 km", "r_runspeed_vs_halts100"]),
        "dwell_share_pct": summ["dwell_share_of_journey_pct"],
        "dwell_per_halt_min": summ["dwell_per_halt_min"],
    }


if __name__ == "__main__":
    print(json.dumps(compute(), indent=2))
