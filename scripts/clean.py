"""Clean the raw datameet/railways files into the CSVs used everywhere else.

Reads  raw/trains.json, raw/stations.json, raw/schedules.json   (see scripts/download_data.py)
Writes data/trains_clean.csv      one row per train service (speed, halts, AC flag, bands ...)
       data/station_traffic.csv   one row per timetable station (halting / passing events)
       data/stations_geo.csv      station coordinates, state and zone
       data/schedules_clean.csv   one row per scheduled stop (large, git-ignored)
       data/excluded_trains.csv   every dropped train with the reason
       data/cleaning_log.txt      counts for each cleaning step

Run from anywhere:  python scripts/clean.py
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
OUT = ROOT / "data"
OUT.mkdir(exist_ok=True)

# --------------------------------------------------------------------------- rules
# Source train type code -> readable type, and type -> analysis category.
TYPE_NAMES = {
    "Pass": "Passenger", "Exp": "Express", "SF": "Superfast", "Mail": "Mail",
    "MEMU": "MEMU/DEMU", "DEMU": "MEMU/DEMU",
    "Raj": "Rajdhani", "Shtb": "Shatabdi", "JShtb": "Jan Shatabdi", "Drnt": "Duronto",
    "GR": "Garib Rath", "SKr": "Sampark Kranti",
    "Toy": "Toy Train", "Hyd": "Hyderabad MMTS", "Del": "Delhi suburban", "Klkt": "Kolkata suburban",
}
CATEGORY_OF_TYPE = {
    "Rajdhani": "Premium / Fast-track", "Shatabdi": "Premium / Fast-track",
    "Jan Shatabdi": "Premium / Fast-track", "Duronto": "Premium / Fast-track",
    "Garib Rath": "Premium / Fast-track", "Sampark Kranti": "Premium / Fast-track",
    "Superfast": "Express & Superfast", "Express": "Express & Superfast", "Mail": "Express & Superfast",
    "Passenger": "Passenger & Suburban", "MEMU/DEMU": "Passenger & Suburban",
    "Hyderabad MMTS": "Passenger & Suburban", "Delhi suburban": "Passenger & Suburban",
    "Kolkata suburban": "Passenger & Suburban",
    "Toy Train": "Heritage / Toy",
}
# An average scheduled speed above these (km/h) is a data error, not a fast train.
# Premium trains top out near 90 km/h in this data; the narrow-gauge toy trains run at 10-20 km/h.
SPEED_CAP = {"Premium / Fast-track": 140, "Heritage / Toy": 40}
DEFAULT_SPEED_CAP = 110
BANDS = [0, 100, 300, 700, 1500, 10000]
BAND_LABELS = ["<100 km", "100-300 km", "300-700 km", "700-1500 km", "1500+ km"]
KEEP_UPPER = {"EMU", "DEMU", "MEMU", "MMTS", "SF", "AC", "SPL", "BSP", "LTT", "DMU", "KNJ", "CSTM", "II", "III"}

log = []
excluded = []   # rows of (number, name, type, distance, duration_min, reason)


def say(msg):
    log.append(msg)


def drop(df, bad_mask, reason):
    """Remove rows where bad_mask is True and remember them (with the reason) in `excluded`."""
    gone = df[bad_mask]
    for r in gone.itertuples():
        excluded.append((r.number, getattr(r, "name", None), getattr(r, "type", None),
                         getattr(r, "distance", None), getattr(r, "duration_min", None), reason))
    return df[~bad_mask].copy()


def tidy_station(x):
    """The source mixes ALL CAPS and Title Case for the same kind of field."""
    return x.title() if isinstance(x, str) and x.isupper() else x


def tidy_name(x):
    if not isinstance(x, str):
        return x
    return " ".join(w.title() if (w.isupper() and len(w) > 3 and w not in KEEP_UPPER) else w for w in x.split(" "))


def secs(s):
    p = s.str.split(":", expand=True).astype(float)
    return p[0] * 3600 + p[1] * 60 + p[2]


# --------------------------------------------------------------------------- load
trains_raw = pd.DataFrame([f["properties"] for f in json.load(open(RAW / "trains.json"))["features"]])
stations_raw = pd.DataFrame([
    dict(f["properties"],
         lon=(f["geometry"] or {}).get("coordinates", [None, None])[0],
         lat=(f["geometry"] or {}).get("coordinates", [None, None])[1])
    for f in json.load(open(RAW / "stations.json"))["features"]])
sched = pd.DataFrame(json.load(open(RAW / "schedules.json")))
say(f"raw: trains={len(trains_raw)}, stations={len(stations_raw)}, schedule stops={len(sched)}")

# --------------------------------------------------------------------------- stations
# Keep every station that has coordinates. State and zone are often empty in the source
# (including Howrah, Kanpur Central, New Delhi), so they stay empty instead of dropping the station.
stn = stations_raw.drop_duplicates("code").copy()
stn["zone"] = stn.zone.where(~stn.zone.isin(["?", ""]))
stn["state"] = stn.state.replace({"Orissa": "Odisha"})
stn["name"] = stn.name.map(tidy_name)
geo = stn.dropna(subset=["lat", "lon"])
say(f"stations with coordinates: {len(geo)} of {len(stn)} (dropped {len(stn) - len(geo)} without coordinates); "
    f"{int(geo.zone.notna().sum())} also have a railway zone")
zone_of_station = stn.dropna(subset=["zone"]).set_index("code").zone

# --------------------------------------------------------------------------- trains
t = trains_raw.copy()
t["number"] = t.number.astype(str)
t = t.drop_duplicates("number")
t["duration_min"] = t.duration_h * 60 + t.duration_m
n_raw = len(t)
t = drop(t, t.distance.isna() | t.duration_min.isna() | (t.distance <= 0) | (t.duration_min <= 0),
         "missing or zero distance / duration")
t["duration_min"] = t.duration_min.astype(int)
say(f"trains with valid distance & duration: {len(t)} (dropped {n_raw - len(t)})")

# type -> category (an unknown type is excluded, not silently put in some default bucket)
t["type_name"] = t.type.str.strip().map(TYPE_NAMES)
t["category"] = t.type_name.map(CATEGORY_OF_TYPE)
n = len(t)
t = drop(t, t.category.isna(), "unrecognised train type")
if n != len(t):
    say(f"dropped {n - len(t)} trains with an unrecognised type")

# railway zone: the train's own zone, else origin station, else return train, else destination station
t["zone"] = t.zone.str.strip().replace({"?": np.nan, "": np.nan})
own = t.zone.notna().sum()
by_number = t.set_index("number").zone
filled = {}
for label, source in [("origin station", t.from_station_code.map(zone_of_station)),
                      ("return train", t.return_train.map(by_number)),
                      ("destination station", t.to_station_code.map(zone_of_station))]:
    fill = t.zone.isna() & source.notna()
    t.loc[fill, "zone"] = source[fill]
    filled[label] = int(fill.sum())
t["zone"] = t.zone.fillna("Unknown")
say("zone filled from " + ", ".join(f"{k} for {v}" for k, v in filled.items())
    + f" trains (own zone present for {own}); {(t.zone == 'Unknown').sum()} remain Unknown")

# tidy text and derived columns
for col in ["from_station_name", "to_station_name"]:
    t[col] = t[col].map(tidy_station)
t["name"] = t["name"].map(tidy_name)
t["avg_speed_kmph"] = (t.distance / (t.duration_min / 60)).round(1)

cap = t.category.map(SPEED_CAP).fillna(DEFAULT_SPEED_CAP)
t = drop(t, t.avg_speed_kmph > cap, "average speed above the cap for its category")
n_fast = sum(1 for e in excluded if e[5].startswith("average speed"))
say(f"removed {n_fast} trains with impossible speed (above 140 km/h premium, 40 km/h toy trains, 110 km/h other)")

t["dep_hour"] = t.departure.str[:2].astype(int)
# AC = any of 1A, 2A, 3A or AC chair car (CC). In the datameet data chair_car is the CC flag;
# Shatabdi is 100% chair_car, so leaving it out would call Shatabdi services non-AC.
t["has_ac"] = ((t.first_ac + t.second_ac + t.third_ac + t.chair_car) > 0).astype(int)
t["band"] = pd.cut(t.distance, BANDS, labels=BAND_LABELS)
t["dep_slot"] = pd.cut(t.dep_hour, [-1, 5, 11, 17, 21, 23],
                       labels=["Night (00-05)", "Morning (06-11)", "Afternoon (12-17)",
                               "Evening (18-21)", "Late night (22-23)"])

# --------------------------------------------------------------------------- schedules
sched["train_number"] = sched.train_number.astype(str)
n_stops = len(sched)
sched = sched.drop_duplicates(["train_number", "station_code", "day", "departure", "arrival"])
sched = sched[sched.train_number.isin(t.number)].copy()
# A halt is a stop where arrival and departure differ. Origin and terminus have only one of the two
# times, so they count as halts too (2 per train). Same arrival and departure = pass-through.
sched["is_halt"] = sched.arrival != sched.departure
per_train = sched.groupby("train_number").agg(stops_total=("station_code", "count"), halts=("is_halt", "sum"))
t = t.merge(per_train, left_on="number", right_index=True, how="left")
t = drop(t, t.halts.isna(), "no schedule rows")
t = drop(t, t.halts == 0, "no usable stop times (arrival = departure at every stop, even origin and terminus)")
sched = sched[sched.train_number.isin(t.number)]
say(f"schedule stops after de-duplication and joining kept trains: {len(sched)} (from {n_stops})")
t["halts"] = t.halts.astype(int)
t["halts_per_100km"] = (t.halts / t.distance * 100).round(2)

# --------------------------------------------------------------------------- station traffic
hub = (sched.groupby("station_code")
       .agg(station_name=("station_name", "first"),
            trains_halting=("is_halt", "sum"),
            trains_passing=("is_halt", lambda x: (~x).sum()))
       .reset_index().rename(columns={"station_code": "code"}))
hub["station_name"] = hub.station_name.str.title()
hub["total_trains"] = hub.trains_halting + hub.trains_passing
hub = hub.merge(stn[["code", "state", "zone", "lat", "lon"]], on="code", how="left")
tagged = hub[hub.lat.notna()]
say(f"stations in timetable: {len(hub)}; with coordinates: {len(tagged)} "
    f"({100 * tagged.trains_halting.sum() / hub.trains_halting.sum():.1f}% of halting events); "
    f"halting events: {int(hub.trains_halting.sum())}, pass-through events: {int(hub.trains_passing.sum())}")

# --------------------------------------------------------------------------- exclusion summary + write
exc = pd.DataFrame(excluded, columns=["number", "name", "type", "distance", "duration_min", "reason"])
reasons = exc.reason.value_counts()
say("excluded trains by reason: " + "; ".join(f"{k}: {v}" for k, v in reasons.items()) + f" (total {len(exc)})")
say(f"final: {len(t)} train services")

cols = ["number", "name", "type", "type_name", "category", "zone", "from_station_code", "from_station_name",
        "to_station_code", "to_station_name", "distance", "duration_min", "avg_speed_kmph", "departure",
        "arrival", "dep_hour", "dep_slot", "band", "has_ac", "first_ac", "second_ac", "third_ac", "sleeper",
        "chair_car", "first_class", "stops_total", "halts", "halts_per_100km"]
t[cols].to_csv(OUT / "trains_clean.csv", index=False)
geo[["code", "name", "state", "zone", "lat", "lon"]].to_csv(OUT / "stations_geo.csv", index=False)
hub.to_csv(OUT / "station_traffic.csv", index=False)
sched[["train_number", "station_code", "station_name", "day", "arrival", "departure"]].to_csv(
    OUT / "schedules_clean.csv", index=False)
exc.sort_values(["reason", "number"]).to_csv(OUT / "excluded_trains.csv", index=False)
(OUT / "cleaning_log.txt").write_text("\n".join(log) + "\n")
print("\n".join(log))
