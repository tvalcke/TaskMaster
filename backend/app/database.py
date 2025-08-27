# database.py - Connexion à la base de données
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Utiliser DATABASE_URL pour Heroku, sinon SQLite en local
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    # Heroku a récemment changé postgres:// vers postgresql://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://")

if DATABASE_URL:
    # Configuration pour PostgreSQL en production
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    # Configuration pour SQLite en développement local
    SQLALCHEMY_DATABASE_URL = "sqlite:///./todo.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
