import os
from sqlalchemy import create_engine
import pyodbc


class Database:
    def __init__(self):
        self.conn = None
        self.engine = None

    def __enter__(self):
        self.open_connection()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.close_connection()

    def open_connection(self):
        conn_str = (
            f"DRIVER=ODBC Driver 17 for SQL Server;"
            f"SERVER={os.getenv('server')};DATABASE={os.getenv('database')};"
            f"UID={os.getenv('uid')};PWD={os.getenv('pwd')};"
            f"Authentication={os.getenv('authentication')}"
        )
        self.conn = pyodbc.connect(conn_str)
        self.engine = create_engine(f"mssql+pyodbc://", creator=lambda: self.conn)

    def close_connection(self):
        if self.conn is not None:
            self.conn.close()
            self.conn = None
            self.engine = None

    def get_engine(self):
        if self.engine is None:
            raise RuntimeError("Database connection is not open.")
        return self.engine