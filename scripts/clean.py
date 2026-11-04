import json, pandas as pd, numpy as np, os
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
R=str(ROOT/'raw')+os.sep; O=str(ROOT/'data')+os.sep   # raw/ is filled by scripts/download_data.py
os.makedirs(O,exist_ok=True)
log=[]
# ---- load
t=pd.DataFrame([f['properties'] for f in json.load(open(R+'trains.json'))['features']])
sf=json.load(open(R+'stations.json'))['features']
s=pd.DataFrame([dict(f['properties'],lon=(f['geometry'] or {}).get('coordinates',[None,None])[0],lat=(f['geometry'] or {}).get('coordinates',[None,None])[1]) for f in sf])
c=pd.DataFrame(json.load(open(R+'schedules.json')))
log.append(f"raw: trains={len(t)}, stations={len(s)}, schedule stops={len(c)}")
# ---- stations
s=s.drop_duplicates('code')
s_ok=s.dropna(subset=['state','zone','lat','lon']).copy()
s_ok=s_ok[s_ok.zone.str.strip().ne('?')]
log.append(f"stations with state+zone+coords: {len(s_ok)} (dropped {len(s)-len(s_ok)} placeholder/incomplete)")
zmap=s_ok.set_index('code').zone
# ---- trains
t['number']=t.number.astype(str)
t=t.drop_duplicates('number')
n0=len(t)
t=t.dropna(subset=['distance','duration_m','duration_h'])
t['duration_min']=(t.duration_h*60+t.duration_m).astype(int)
t=t[(t.distance>0)&(t.duration_min>0)].copy()
log.append(f"trains with valid distance & duration: {len(t)} (dropped {n0-len(t)})")
t['zone']=t.zone.str.strip().replace({'?':np.nan,'':np.nan})
imp=t.zone.isna().sum()
t['zone']=t.zone.fillna(t.from_station_code.map(zmap)).fillna('Unknown')
log.append(f"zone imputed from origin station for {imp-(t.zone=='Unknown').sum()} trains; {(t.zone=='Unknown').sum()} remain Unknown")
tm={'Pass':'Passenger','Exp':'Express','SF':'Superfast','MEMU':'MEMU/DEMU','DEMU':'MEMU/DEMU','Raj':'Rajdhani','Shtb':'Shatabdi','JShtb':'Jan Shatabdi','Drnt':'Duronto','GR':'Garib Rath','SKr':'Sampark Kranti','Mail':'Mail','Toy':'Toy Train'}
t['type_name']=t.type.str.strip().map(tm).fillna('Other')
prem=['Rajdhani','Shatabdi','Jan Shatabdi','Duronto','Garib Rath','Sampark Kranti']
t['category']=np.select([t.type_name.isin(prem),t.type_name.isin(['Superfast','Express','Mail']),t.type_name.isin(['Passenger','MEMU/DEMU'])],['Premium / Fast-track','Express & Superfast','Passenger & Suburban'],'Other / Local')
t['avg_speed_kmph']=(t.distance/(t.duration_min/60)).round(1)
bad=(t.avg_speed_kmph>140).sum(); t=t[t.avg_speed_kmph<=140]
log.append(f"removed {bad} trains with impossible speed (>140 km/h)")
t['dep_hour']=t.departure.str[:2].astype(int)
# AC = any of 1A, 2A, 3A or AC chair car (CC). In the datameet data chair_car is the CC flag (AC Chair Car);
# Shatabdi is 100% chair_car, so leaving it out would call Shatabdi services non-AC.
t['has_ac']=((t.first_ac+t.second_ac+t.third_ac+t.chair_car)>0).astype(int)
t['has_sleeper']=t.sleeper
t['band']=pd.cut(t.distance,[0,100,300,700,1500,10000],labels=['<100 km','100-300 km','300-700 km','700-1500 km','1500+ km'])
t['dep_slot']=pd.cut(t.dep_hour,[-1,5,11,17,21,23],labels=['Night (00-05)','Morning (06-11)','Afternoon (12-17)','Evening (18-21)','Late night (22-23)'])
# ---- schedules
c['train_number']=c.train_number.astype(str)
n1=len(c); c=c.drop_duplicates(['train_number','station_code','day','departure','arrival'])
c=c[c.train_number.isin(t.number)]
log.append(f"schedule stops after dedupe & joining valid trains: {len(c)} (from {n1})")
c['is_halt']=(c.arrival!=c.departure)
ps=c.groupby('train_number').agg(stops_total=('station_code','count'),halts=('is_halt','sum'))
t=t.merge(ps,left_on='number',right_index=True,how='left')
t['halts_per_100km']=(t.halts/t.distance*100).round(2)
hub=c.groupby('station_code').agg(station_name=('station_name','first'),trains_halting=('is_halt','sum'),trains_passing=('is_halt',lambda x:(~x).sum())).reset_index().rename(columns={'station_code':'code'})
hub['station_name']=hub.station_name.str.title()
hub['total_trains']=hub.trains_halting+hub.trains_passing
hub=hub.merge(s_ok[['code','state','zone','lat','lon']],on='code',how='left')
log.append(f"stations in timetable: {len(hub)}; geo-tagged match: {hub.state.notna().sum()}; halting events: {int(hub.trains_halting.sum())}, pass-through events: {int(hub.trains_passing.sum())}")
st=s_ok.copy()
cols=['number','name','type','type_name','category','zone','from_station_code','from_station_name','to_station_code','to_station_name','distance','duration_min','avg_speed_kmph','departure','arrival','dep_hour','dep_slot','band','has_ac','first_ac','second_ac','third_ac','sleeper','chair_car','first_class','stops_total','halts','halts_per_100km']
t[cols].to_csv(O+'trains_clean.csv',index=False)
st[['code','name','state','zone','lat','lon']].to_csv(O+'stations_geo.csv',index=False)
hub.to_csv(O+'station_traffic.csv',index=False)
c[['train_number','station_code','station_name','day','arrival','departure']].to_csv(O+'schedules_clean.csv',index=False)
open(O+'cleaning_log.txt','w').write('\n'.join(log))
print('\n'.join(log))
