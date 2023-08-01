import os
from sqlalchemy import create_engine, text
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

    def execute_query(self, query: str):
        if self.conn is None:
            raise RuntimeError("Database connection is not open.")
        conn = self.get_engine().connect()
        sql = text(query)
        return conn.execute(sql)
    
    def fetch_data(self, query: str, params=None, fetchone=False):
        if self.conn is None:
            raise RuntimeError("Database connection is not open.")
        conn = None
        try:
            conn = self.get_engine().connect()
            sql = text(query)
            if params:
                sql = sql.bindparams(**params)
            result = conn.execute(sql)
            if fetchone:
                data = result.fetchone()
            else:
                data = result.fetchall()
            return data

        finally:
            # Close the connection in the finally block to ensure it is closed even in case of exceptions
            if conn:
                conn.close()


    def close_connection(self):
        if self.conn is not None:
            self.conn.close()
            self.conn = None
            self.engine = None

    def get_engine(self):
        if self.engine is None:
            raise RuntimeError("Database connection is not open.")
        return self.engine