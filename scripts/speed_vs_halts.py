"""Is 'speed falls as halts rise' just arithmetic?
Average speed = distance / total time, and total time includes time spent standing at halts,
so some negative correlation is built in. Three checks:
  1. correlation inside each distance band (not mixing short and long trains)
  2. correlation after dropping origin + terminus from the halt count
  3. running speed = distance / (journey time - time standing at intermediate halts)
Needs data/schedules_clean.csv (made by scripts/clean.py). Writes data/speed_halts_check.csv.
"""
import pandas as pd, numpy as np
from pathlib import Path
D = Path(__file__).resolve().parent.parent / "data"
t = pd.read_csv(D/"trains_clean.csv", dtype={"number": str})
c = pd.read_csv(D/"schedules_clean.csv", dtype={"train_number": str}, na_values=["None"])

# time standing at stops where both arrival and departure exist (so origin and terminus are excluded)
c = c.dropna(subset=["arrival", "departure"])
def secs(s):
    p = s.str.split(":", expand=True).astype(float)
    return p[0]*3600 + p[1]*60 + p[2]
c["dwell_s"] = (secs(c.departure) - secs(c.arrival)) % 86400
c = c[c.dwell_s < 7200]                       # ignore >2 h gaps (overnight wrap-arounds / bad rows)
dwell = (c.groupby("train_number").dwell_s.sum()/60).rename("dwell_min")
t = t.merge(dwell, left_on="number", right_index=True, how="left").fillna({"dwell_min": 0})
t["run_min"] = t.duration_min - t.dwell_min
t = t[t.run_min > 0].copy()
t["run_speed"] = t.distance / (t.run_min/60)
t = t[t.run_speed <= 140]
t["h100_mid"] = (t.halts-2).clip(lower=0) / t.distance * 100   # without origin + terminus

r = lambda a, b: round(float(np.corrcoef(a, b)[0, 1]), 2)
rows = [dict(group="ALL", n=len(t),
             r_speed_vs_halts100=r(t.halts_per_100km, t.avg_speed_kmph),
             r_speed_vs_midhalts100=r(t.h100_mid, t.avg_speed_kmph),
             r_runspeed_vs_halts100=r(t.halts_per_100km, t.run_speed))]
for b, g in t.groupby("band", observed=True):
    rows.append(dict(group=b, n=len(g),
                     r_speed_vs_halts100=r(g.halts_per_100km, g.avg_speed_kmph),
                     r_speed_vs_midhalts100=r(g.h100_mid, g.avg_speed_kmph),
                     r_runspeed_vs_halts100=r(g.halts_per_100km, g.run_speed)))
out = pd.DataFrame(rows)
out.to_csv(D/"speed_halts_check.csv", index=False)
print(out.to_string(index=False))
print("\nstanding time = %.1f%% of total journey time" % (100*t.dwell_min.sum()/t.duration_min.sum()))
print("mean halts per 100 km: with origin+terminus %.2f, without %.2f" % (t.halts_per_100km.mean(), t.h100_mid.mean()))
