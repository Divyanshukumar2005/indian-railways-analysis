import pandas as pd, numpy as np, json
from pathlib import Path
D=str(Path(__file__).resolve().parent.parent/'data')+'/'
t=pd.read_csv(D+'trains_clean.csv',dtype={'number':str}); st=pd.read_csv(D+'station_traffic.csv'); c=pd.read_csv(D+'schedules_clean.csv',dtype={'train_number':str})
pd.set_option('display.width',200)
print('trains',len(t),'stations',len(st),'active',(st.total_trains>0).sum(),'zones',t.zone.nunique())
print('AC share %.1f'%(t.has_ac.mean()*100),'median speed',t.avg_speed_kmph.median(),'avg dist',t.distance.mean())
print(t.category.value_counts(normalize=True).round(3))
z=t[t.zone!='Unknown'].groupby('zone').agg(trains=('number','count'),ac=('has_ac','mean'),spd=('avg_speed_kmph','median'),pas=('category',lambda x:(x=='Passenger & Suburban').mean())).round(3).sort_values('trains',ascending=False);print(z)
# hubs
hub=st.sort_values('trains_halting',ascending=False);print(hub.head(12)[['station_name','state','trains_halting']])
tot=hub.trains_halting.sum();print('top10 share',hub.trains_halting.head(10).sum()/tot,'top1%',hub.trains_halting.head(int(len(hub)*.01)).sum()/tot,'top10pct',hub.trains_halting.head(int(len(hub)*.1)).sum()/tot)
print('stations with <=3 halting trains',(st.trains_halting<=3).mean(), ((st.trains_halting<=3)).sum())
sg=st.dropna(subset=['state']).groupby('state').agg(stations=('code','count'),halts=('trains_halting','sum'),active=('trains_halting',lambda x:(x>0).sum())).assign(per=lambda d:(d.halts/d.stations).round(1)).sort_values('stations',ascending=False);print(sg.head(25))
print(t.groupby('dep_slot').size()/len(t));print(t.groupby('dep_hour').size().to_dict())
print(t.groupby('band').agg(n=('number','count'),spd=('avg_speed_kmph','median'),ac=('has_ac','mean')).round(2))
lng=t[t.distance>=700];print('long-dist night dep share', lng.dep_slot.isin(['Late night (22-23)','Night (00-05)']).mean(), len(lng))
print('sleeper only no ac long', ((lng.has_ac==0)).mean())
