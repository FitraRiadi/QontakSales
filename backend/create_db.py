import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

conn = psycopg2.connect(dbname='postgres', user='postgres', password='admin123', host='localhost')
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname='qontak_sales'")
if not cur.fetchone():
    cur.execute("CREATE DATABASE qontak_sales")
    print("Database created")
else:
    print("Database already exists")
conn.close()
