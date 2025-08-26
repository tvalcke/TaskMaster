# database.py - Connexion à la base PostgreSQL
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ⚠️ En local, on utilisera SQLite pour tester facilement
SQLALCHEMY_DATABASE_URL = "sqlite:///./todo.db"
# Pour PostgreSQL en prod, remplacer par :
# postgresql://user:password@host:port/dbname

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
