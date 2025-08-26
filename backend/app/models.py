# models.py - Tables SQLAlchemy
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)  # Pseudo de l'utilisateur
    hashed_password = Column(String)

    tasks = relationship("Task", back_populates="owner")


class TaskStatus(enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    ARCHIVED = "archived"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO, index=True)
    done = Column(Boolean, default=False)  # Maintenu pour compatibilité
    archived = Column(Boolean, default=False)  # Pour archiver les tâches
    
    # Dates
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Tags pour la recherche (séparés par des virgules)
    tags = Column(String, nullable=True)
    
    # Relations
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")
