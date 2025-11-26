import psycopg2
from psycopg2 import pool
from flask import current_app, g
import atexit

db_pool = None

def init_db_pool(database_url):
    global db_pool
    db_pool = psycopg2.pool.ThreadedConnectionPool(
        minconn=2,
        maxconn=10,
        dsn=database_url
    )

def close_db_pool():
    global db_pool
    if db_pool:
        db_pool.closeall()

def get_db():
    if "db" not in g:
        g.db = db_pool.getconn()
        g.db.autocommit = False
    return g.db

def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        if not db.closed:
            try:
                db.rollback()
            except:
                pass
        db_pool.putconn(db)