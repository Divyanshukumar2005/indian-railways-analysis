"""Download the raw datameet/railways files into raw/ (run once, needs internet).
Source: https://github.com/datameet/railways  (CC0)
"""
import sys, urllib.request
from pathlib import Path

BASE = "https://raw.githubusercontent.com/datameet/railways/master/"
FILES = ["trains.json", "stations.json", "schedules.json"]
RAW = Path(__file__).resolve().parent.parent / "raw"

def main(force=False):
    RAW.mkdir(exist_ok=True)
    for name in FILES:
        dest = RAW / name
        if dest.exists() and not force:
            print(f"skip {name} (already there, use --force to re-download)")
            continue
        print(f"downloading {name} ...")
        urllib.request.urlretrieve(BASE + name, dest)
        print(f"  saved {dest} ({dest.stat().st_size/1e6:.1f} MB)")

if __name__ == "__main__":
    main(force="--force" in sys.argv)
