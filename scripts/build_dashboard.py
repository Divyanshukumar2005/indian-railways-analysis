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
corr=round(float(np.corrcoef(t.halts_per_100km,t.avg_speed_kmph)[0,1]),2)
chk=pd.read_csv(D+'speed_halts_check.csv')            # written by scripts/speed_vs_halts.py
corr_run=float(chk.loc[chk.group=='ALL','r_runspeed_vs_halts100'].iloc[0])

# Simulator inputs, all measured from the data (nothing typed in by hand):
#  slope = OLS slope of average speed on halts per 100 km, passenger & suburban services of 100 km or more
#  dwell_per_halt = average minutes standing at an intermediate halt (from the schedules)
pas=t[(t.category=='Passenger & Suburban')&(t.distance>=100)]
slope,_=np.polyfit(pas.halts_per_100km,pas.avg_speed_kmph,1)
c=pd.read_csv(D+'schedules_clean.csv',dtype={'train_number':str},na_values=['None']).dropna(subset=['arrival','departure'])
def secs(v):
    q=v.str.split(':',expand=True).astype(float); return q[0]*3600+q[1]*60+q[2]
c['d']=(secs(c.departure)-secs(c.arrival))%86400; c=c[c.d<7200]
d=c[c.train_number.isin(t.number)]
mid_halts=(t.halts-2).clip(lower=0).sum()
sim=dict(slope=round(float(slope),3),n=int(len(pas)),base_speed=round(float(pas.avg_speed_kmph.mean()),1),
         base_h100=round(float(pas.halts_per_100km.mean()),1),avg_dist=round(float(pas.distance.mean())),
         dwell_per_halt=round(float(d.d.sum()/60/mid_halts),1),
         non_ac_mid=int(((t.band=='300-700 km')&(t.has_ac==0)).sum()))
data=dict(trains=rows,cats=cats,bands=bands,cum=cum,hubs=hubs,nstations=n,low3=round(100*(x.trains_halting<=3).mean(),1),
          corr=corr,corr_run=corr_run,avg_h100=round(float(t.halts_per_100km.mean()),1),sim=sim)
print(data['low3'], data['corr'], data['corr_run'], data['avg_h100'], sim, cum[10])

# --- feed the React dashboard (dashboard-react/) ---
ts=ROOT/'dashboard-react'/'src'/'data'/'railwayData.ts'
if ts.exists():
    src=ts.read_text()
    a=src.index('export const rawRailwayData: RailwayDataset = ')+len('export const rawRailwayData: RailwayDataset = ')
    b=src.index(';\n\nexport const TRAINS_DATA')
    ts.write_text(src[:a]+json.dumps(data,separators=(',',':'))+src[b:])
    print('updated', ts.relative_to(ROOT))
