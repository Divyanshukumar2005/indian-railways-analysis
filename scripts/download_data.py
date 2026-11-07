"""Download the raw datameet/railways files into raw/ (run once, needs internet).

Source: https://github.com/datameet/railways (CC0). The download is pinned to one upstream commit,
so everyone who runs the pipeline gets the same files and the same numbers.
"""
import sys
import urllib.request
from pathlib import Path

COMMIT = "e0c538a1e41ae5eace454d2818902e1065608e16"   # datameet/railways master on 2026-11-06
BASE = f"https://raw.githubusercontent.com/datameet/railways/{COMMIT}/"
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
        print(f"  saved {dest} ({dest.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main(force="--force" in sys.argv)
