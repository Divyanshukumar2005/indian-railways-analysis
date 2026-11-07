"""Check that every number quoted in the README, notebook, dashboard and SQL results matches the data.

Fails (exit code 1) when something drifted, for example after re-running clean.py without updating the README.
Needs only the committed files, so it runs in CI.   Run from anywhere:  python scripts/check_numbers.py

Three kinds of checks:
  1. data invariants (no impossible speeds, no ALL-CAPS station names left, no zero-halt trains ...)
  2. facts quoted in README.md and the notebook text (computed once in scripts/facts.py)
  3. generated files are in sync: dashboard data (railwayData.ts) and SQL outputs (sql/outputs/)
"""
import json
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_dashboard  # noqa: E402
import facts  # noqa: E402

ROOT = facts.ROOT
f = facts.compute()
t, stations, _, _ = facts.load()
exc = pd.read_csv(ROOT / "data" / "excluded_trains.csv")
readme = (ROOT / "README.md").read_text()
notebook = " ".join("".join(c["source"]) for c in json.loads(
    (ROOT / "notebooks" / "01_eda_and_findings.ipynb").read_text())["cells"] if c["cell_type"] == "markdown")

checks = {}


def check(label, ok):
    checks[label] = bool(ok)


def quoted(doc_name, doc, phrases):
    for p in phrases:
        check(f'{doc_name} says "{p}"', p in doc)


# ---- 1. data invariants -------------------------------------------------------------------------
cap = t.category.map({"Premium / Fast-track": 140, "Heritage / Toy": 40}).fillna(110)
check("no train above its speed cap (140 premium / 40 toy / 110 other)", (t.avg_speed_kmph <= cap).all())
check("no train with zero halts", (t.halts > 0).all())
check("no duplicate train numbers", t.number.is_unique)
check("no station name in ALL CAPS", not (t.from_station_name.str.isupper() | t.to_station_name.str.isupper()).any())
check("17 railway zones (Unknown excluded)", f["n_zones"] == 17)
check("raw trains = services + excluded (5,208)", len(t) + len(exc) == 5208)
check("stations_geo has no state spelled 'Orissa'", "Orissa" not in pd.read_csv(ROOT / "data" / "stations_geo.csv").state.values)

# no data figure typed by hand in the dashboard source: hub names, zone speeds or "|| 51.5"-style fallbacks
import re  # noqa: E402
src_files = list((ROOT / "dashboard-react" / "src").rglob("*.tsx")) + list((ROOT / "dashboard-react" / "src").rglob("*.ts"))
hand_typed = []
hub_names = list(stations.head(10).station_name)
for fp in src_files:
    if fp.name == "railwayData.ts":
        continue
    text = fp.read_text()
    for pat in [r"\(\d+(\.\d+)? km/h\)", r"\|\|\s*\d+\.\d+"] + [re.escape(n) for n in hub_names]:
        if re.search(pat, text):
            hand_typed.append(f"{fp.name}: /{pat}/")
check("no hand-typed figures or hub names in dashboard components", not hand_typed)
for h in hand_typed:
    print("   found", h)

# ---- 2. README and notebook quote the current numbers ------------------------------------------
by_reason = exc.reason.value_counts()
n_dist = int(by_reason[[r for r in by_reason.index if r.startswith("missing")]].sum())
n_speed = int(by_reason[[r for r in by_reason.index if r.startswith("average speed")]].sum())
n_stops = int(by_reason[[r for r in by_reason.index if r.startswith("no usable")]].sum())
sim = build_dashboard.build()["sim"]
slow, low = f["slow_zones"], f["low_ac_zones"]
quoted("README", readme, [
    f"{f['n_services']:,} train services", f"{f['n_stations']:,} stations",
    f"{f['pas_share']}% of services", f"{f['pas_speed']} km/h average", f"{f['exp_speed']} km/h for express",
    f"{f['pas_h100']} halts per 100 km vs {f['exp_h100']}",
    f"{slow[0]['zone']} ({slow[0]['speed']} km/h), {slow[1]['zone']} ({slow[1]['speed']}) and {slow[2]['zone']} ({slow[2]['speed']})",
    f"{min(z['passenger_pct'] for z in slow)}-{max(z['passenger_pct'] for z in slow)}% passenger",
    f"{f['mid_non_ac']} of {f['mid_total']} services ({f['mid_non_ac_pct']}%)",
    f"{f['long_ac_pct'][0]}-{f['long_ac_pct'][1]}% of services over 700 km",
    f"{low[0]['zone']} {low[0]['ac_pct']}%, {low[1]['zone']} {low[1]['ac_pct']}%, {low[2]['zone']} {low[2]['ac_pct']}%",
    f"{f['top10_share']}% of halting events",
    f"{f['hubs'][0]['name']} ({f['hubs'][0]['halts']}) and {f['hubs'][1]['name']} ({f['hubs'][1]['halts']})",
    f"{f['low3_pct']}% of stations see 3 or fewer",
    f"{f['dep_morning_pct']}% of departures", f"only {f['dep_night_pct']}%",
    f"{f['dep_midday_per_hour']}% of departures per hour against a {f['dep_per_hour_avg']}%",
    f"Standing time is {f['dwell_share_pct']}%", f"r = {f['r_run']:.2f} overall", f"raw r = {f['r_raw']:.2f}",
    f"from {f['r_run_band_max']:.2f} to {f['r_run_band_min']:.2f}", f"r = +{f['r_short']:.2f}",
    f"{f['avg_h100']} halts per 100 km on average with them, {f['avg_h100_no_ends']} without",
    f"{n_dist} trains without a valid distance or duration", f"| {n_speed} trains", f"| {n_stops} trains",
    f"5,208 raw trains became {f['n_services']:,} services", f"{f['n_unknown_zone']} trains stay `Unknown`",
    f"{sim['n']:,} services", f"about {sim['slope']} km/h per halt", f"(about {sim['dwell_per_halt']} min)",
])
quoted("notebook", notebook, [
    f"{n_dist} trains without a valid distance or duration", f"{n_speed} with an impossible speed",
    f"{n_stops} with no usable stop times", f"{f['n_unknown_zone']} trains stay `Unknown`",
    f"{f['mid_non_ac']} of {f['mid_total']} services ({f['mid_non_ac_pct']}%)",
    f"r from {f['r_run_band_max']:.2f} to {f['r_run_band_min']:.2f}",
    f"{slow[0]['zone']}, {slow[1]['zone']}, {slow[2]['zone']}",
])

# ---- 3. generated files are in sync -------------------------------------------------------------
ts = (ROOT / "dashboard-react" / "src" / "data" / "railwayData.ts").read_text()
start = ts.index(build_dashboard.START) + len(build_dashboard.START)
embedded = json.loads(ts[start:ts.index(build_dashboard.END)])
fresh = json.loads(json.dumps(build_dashboard.build()))
check("dashboard data (railwayData.ts) is up to date: run scripts/build_dashboard.py", embedded == fresh)

sql_dir = ROOT / "sql" / "outputs"
if (sql_dir / "kpi_1_network_size.csv").exists():
    k1 = pd.read_csv(sql_dir / "kpi_1_network_size.csv")
    k2 = pd.read_csv(sql_dir / "kpi_2_speed_by_category.csv").set_index("category")
    k5 = pd.read_csv(sql_dir / "kpi_5_hub_concentration.csv").set_index("label")
    k6 = pd.read_csv(sql_dir / "kpi_6_ac_share_by_zone_300_700km.csv")
    check("SQL KPI 1 matches the CSVs", (k1.train_services[0], k1.stations[0]) == (f["n_services"], f["n_stations"]))
    check("SQL KPI 2 matches (passenger share, speed)",
          (k2.loc[facts.PASSENGER, "pct_of_services"], k2.loc[facts.PASSENGER, "avg_speed_kmph"]) == (f["pas_share"], f["pas_speed"]))
    check("SQL KPI 5 matches (top 10% share of halts)", k5.loc["busiest 10%", "cum_share_of_halts_pct"] == f["top10_share"])
    check("SQL KPI 6 matches (lowest-AC zones)", list(k6.zone.head(3)) == [z["zone"] for z in low])
else:
    print("note: sql/outputs/ not found, SQL checks skipped (run sql/load.py and sql/run_queries.py)")

for label, ok in checks.items():
    print(("OK   " if ok else "FAIL ") + label)
failed = [k for k, v in checks.items() if not v]
print(f"\n{len(checks) - len(failed)}/{len(checks)} checks passed")
sys.exit(1 if failed else 0)
