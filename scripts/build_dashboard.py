import pandas as pd, json, numpy as np
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
D=str(ROOT/'data')+'/'
t=pd.read_csv(D+'trains_clean.csv',dtype={'number':str}); h=pd.read_csv(D+'station_traffic.csv')
t['name']=t['name'].fillna('Unnamed Service')   # a few trains have no name in the source data
cats=['Premium / Fast-track','Express & Superfast','Passenger & Suburban','Other / Local']
bands=['<100 km','100-300 km','300-700 km','700-1500 km','1500+ km']
rows=[[r.number,r['name'],cats.index(r.category),r.zone,int(r.distance),float(r.avg_speed_kmph),int(r.halts),float(r.halts_per_100km),int(r.has_ac),int(r.dep_hour),bands.index(r.band),r.from_station_name.title(),r.to_station_name.title()] for _,r in t.iterrows()]
x=h.sort_values('trains_halting',ascending=False).reset_index(drop=True); tot=x.trains_halting.sum(); n=len(x)
cum=[round(100*x.trains_halting.head(int(round(n*p/100))).sum()/tot,2) for p in range(0,101)]
hubs=[[r.station_name,int(r.trains_halting),int(r.trains_passing)] for _,r in x.head(10).iterrows()]
data=dict(trains=rows,cats=cats,bands=bands,cum=cum,hubs=hubs,nstations=n,low3=round(100*(x.trains_halting<=3).mean(),1),corr=round(float(np.corrcoef(t.halts_per_100km,t.avg_speed_kmph)[0,1]),2))
html=open(ROOT/'dashboard'/'template.html').read().replace('__DATA__',json.dumps(data,separators=(',',':')))
open(ROOT/'dashboard'/'dashboard.html','w').write(html)
print(len(html), data['low3'], data['corr'], cum[10])

# --- feed the React dashboard (dashboard-react/) with the same data ---
ts=ROOT/'dashboard-react'/'src'/'data'/'railwayData.ts'
if ts.exists():
    src=ts.read_text()
    a=src.index('export const rawRailwayData: RailwayDataset = ')+len('export const rawRailwayData: RailwayDataset = ')
    b=src.index(';\n\nexport const TRAINS_DATA')
    ts.write_text(src[:a]+json.dumps(data,separators=(',',':'))+src[b:])
    print('updated', ts.relative_to(ROOT))
