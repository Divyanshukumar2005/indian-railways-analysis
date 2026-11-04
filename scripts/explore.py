import json,sys,pandas as pd
from pathlib import Path
R=str(Path(__file__).resolve().parent.parent/'raw')+'/'
t=pd.DataFrame([f['properties'] for f in json.load(open(R+'trains.json'))['features']])
s=pd.DataFrame([dict(f['properties'],lon=(f['geometry'] or {}).get('coordinates',[None,None])[0],lat=(f['geometry'] or {}).get('coordinates',[None,None])[1]) for f in json.load(open(R+'stations.json'))['features']])
c=pd.DataFrame(json.load(open(R+'schedules.json')))
for n,d in [('t',t),('s',s),('c',c)]:
    print(n,d.shape);print(d.isna().sum().to_dict());print(d.head(2).T)
print(t.type.value_counts());print(t.zone.value_counts());print(t.distance.describe());print(t.duration_h.describe())
print(t.number.duplicated().sum(), c.train_number.nunique(), s.state.value_counts().head(10), s.zone.value_counts())
print(t[['first_ac','second_ac','third_ac','sleeper','chair_car','first_class']].apply(pd.Series.value_counts))
print(t.classes.value_counts().head(8))
print((t.distance==0).sum(), (t.duration_m==0).sum(), t.arrival.isna().sum(), t.departure.head())
print(c.arrival.value_counts().head(3), c.day.value_counts())
