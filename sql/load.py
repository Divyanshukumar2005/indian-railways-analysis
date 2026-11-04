import sqlite3,pandas as pd
from pathlib import Path
D=str(Path(__file__).resolve().parent.parent/'data')+'/'
con=sqlite3.connect(D+'railways.db')
pd.read_csv(D+'trains_clean.csv',dtype={'number':str}).to_sql('trains',con,if_exists='replace',index=False)
pd.read_csv(D+'station_traffic.csv').to_sql('station_traffic',con,if_exists='replace',index=False)
con.close()
