# crud.py - Fonctions réutilisables pour DB
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Fonctions utilisateurs
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Fonctions de base pour les tâches
def get_tasks(db: Session, user_id: int, archived: bool = False):
    """Récupère toutes les tâches d'un utilisateur, avec option pour les archivées"""
    query = db.query(models.Task).filter(
        models.Task.owner_id == user_id,
        models.Task.archived == archived
    )
    return query.order_by(models.Task.created_at.desc()).all()


def get_task(db: Session, task_id: int, user_id: int):
    """Récupère une tâche spécifique par son ID"""
    return db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == user_id
    ).first()


def create_task(db: Session, task: schemas.TaskCreate, user_id: int):
    """Crée une nouvelle tâche"""
    task_data = task.model_dump(exclude_unset=True)
    db_task = models.Task(**task_data, owner_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task: schemas.TaskUpdate, user_id: int):
    """Met à jour une tâche existante"""
    db_task = get_task(db, task_id, user_id)
    if not db_task:
        return None
    
    # Mise à jour des champs
    update_data = task.model_dump(exclude_unset=True)
    
    # Gestion spéciale pour le statut DONE
    if "status" in update_data and update_data["status"] == models.TaskStatus.DONE:
        update_data["completed_at"] = datetime.utcnow()
        update_data["done"] = True
    
    # Application des mises à jour
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int, user_id: int):
    """Supprime une tâche"""
    db_task = get_task(db, task_id, user_id)
    if not db_task:
        return None
    
    db.delete(db_task)
    db.commit()
    return db_task


def archive_task(db: Session, task_id: int, user_id: int, archive: bool = True):
    """Archive ou désarchive une tâche"""
    db_task = get_task(db, task_id, user_id)
    if not db_task:
        return None
    
    db_task.archived = archive
    db.commit()
    db.refresh(db_task)
    return db_task


def search_tasks(db: Session, user_id: int, search: schemas.TaskSearch):
    """Recherche de tâches avec filtres"""
    query = db.query(models.Task).filter(models.Task.owner_id == user_id)
    
    # Filtre par statut d'archivage
    if search.archived is not None:
        query = query.filter(models.Task.archived == search.archived)
    
    # Filtre par statut
    if search.status is not None:
        query = query.filter(models.Task.status == search.status)
    
    # Filtre par date d'échéance
    if search.due_date_from is not None:
        query = query.filter(models.Task.due_date >= search.due_date_from)
    if search.due_date_to is not None:
        query = query.filter(models.Task.due_date <= search.due_date_to)
    
    # Recherche textuelle
    if search.query:
        text_search = f"%{search.query}%"
        query = query.filter(
            or_(
                models.Task.title.ilike(text_search),
                models.Task.description.ilike(text_search)
            )
        )
    
    # Filtre par tags
    if search.tags and len(search.tags) > 0:
        for tag in search.tags:
            query = query.filter(models.Task.tags.ilike(f"%{tag}%"))
    
    # Tri par date de création (plus récents en premier)
    query = query.order_by(models.Task.created_at.desc())
    
    return query.all()
