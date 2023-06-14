import logging
from typing import Tuple
import datetime as dt

from sqlalchemy import create_engine
import pandas as pd

class Database:
    def __init__(self, server, database, username, password, authentication):
        self.server = server
        self.database = database
        self.username = username
        self.password = password
        self.engine = create_engine(f"mssql+pyodbc://{username}:{password}@{server}/{database}?driver=ODBC+Driver+17+for+SQL+Server&Authentication={authentication}")
        self.conn = self.engine.connect()   

if __name__ == "__main__":
    from dotenv import load_dotenv
    import os
    import pandas as pd

    load_dotenv()

    # db = Database(os.getenv("SQL_CONNECTION_STRING"))
    db = Database(os.getenv("server"), os.getenv("database"), os.getenv("uid"), os.getenv("pwd"), os.getenv("authentication"))
    query = "SELECT * FROM ico.movein_cost_sheet"
    df_units = pd.read_sql(query, db.conn)
    df_properties = df_units['property_name'].drop_duplicates().reset_index(drop=True)
    print (df_properties)
    print (df_units)
