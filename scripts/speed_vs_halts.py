"""Is 'speed falls as halts rise' just arithmetic?

Average speed = distance / total time, and total time includes time spent standing at halts,
so some negative correlation is built in. Three checks:
  1. correlation inside each distance band (not mixing short and long trains)
  2. correlation after dropping origin + terminus from the halt count
  3. running speed = distance / (journey time - time standing at intermediate halts)

Needs data/schedules_clean.csv (made by scripts/clean.py).
Writes data/speed_halts_check.csv (correlations) and data/speed_halts_summary.json (standing-time figures).
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

D = Path(__file__).resolve().parent.parent / "data"
t = pd.read_csv(D / "trains_clean.csv", dtype={"number": str})
c = pd.read_csv(D / "schedules_clean.csv", dtype={"train_number": str}, na_values=["None"])

# time standing at stops where both arrival and departure exist (so origin and terminus are excluded)
c = c.dropna(subset=["arrival", "departure"])


def secs(s):
    p = s.str.split(":", expand=True).astype(float)
    return p[0] * 3600 + p[1] * 60 + p[2]


c["dwell_s"] = (secs(c.departure) - secs(c.arrival)) % 86400
c = c[c.dwell_s < 7200]                       # ignore >2 h gaps (overnight wrap-arounds / bad rows)
dwell = (c.groupby("train_number").dwell_s.sum() / 60).rename("dwell_min")

# figures over all kept trains (before the speed-sanity filter below)
mid_halts = (t.halts - 2).clip(lower=0)
summary = {
    "dwell_per_halt_min": round(float(dwell.sum() / mid_halts.sum()), 1),
    "mean_halts_per_100km_with_ends": round(float(t.halts_per_100km.mean()), 1),
    "mean_halts_per_100km_without_ends": round(float((mid_halts / t.distance * 100).mean()), 1),
}

t = t.merge(dwell, left_on="number", right_index=True, how="left").fillna({"dwell_min": 0})
summary["dwell_share_of_journey_pct"] = round(float(100 * t.dwell_min.sum() / t.duration_min.sum()), 1)
t["run_min"] = t.duration_min - t.dwell_min
t = t[t.run_min > 0].copy()
t["run_speed"] = t.distance / (t.run_min / 60)
t = t[t.run_speed <= 140]
t["h100_mid"] = (t.halts - 2).clip(lower=0) / t.distance * 100   # without origin + terminus


def r(a, b):
    return round(float(np.corrcoef(a, b)[0, 1]), 2)


def row(label, g):
    return dict(group=label, n=len(g),
                r_speed_vs_halts100=r(g.halts_per_100km, g.avg_speed_kmph),
                r_speed_vs_midhalts100=r(g.h100_mid, g.avg_speed_kmph),
                r_runspeed_vs_halts100=r(g.halts_per_100km, g.run_speed))


order = ["<100 km", "100-300 km", "300-700 km", "700-1500 km", "1500+ km"]
rows = [row("ALL", t)] + [row(b, t[t.band == b]) for b in order]
out = pd.DataFrame(rows)
out.to_csv(D / "speed_halts_check.csv", index=False)
(D / "speed_halts_summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(out.to_string(index=False))
print(json.dumps(summary, indent=2))
