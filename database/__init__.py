import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="hospital",
        user="postgres",
        password="sua_senha_aqui"  # Substitua pela senha que você definiu
    )
