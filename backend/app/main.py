# main.py - Point d'entrée FastAPI
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud, database, auth


models.Base.metadata.create_all(bind=database.engine)


app = FastAPI(title="Todo API")

# Configuration CORS pour permettre les requêtes du frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "https://tvalcke.github.io",
        "https://TaskMaster.tvalcke.be"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Autorise toutes les méthodes HTTP
    allow_headers=["*"],  # Autorise tous les en-têtes
)


@app.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    print(f"Tentative d'inscription avec l'email: {user.email}")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        print(f"Email {user.email} déjà utilisé")
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    try:
        created_user = crud.create_user(db, user)
        print(f"Utilisateur créé avec l'ID: {created_user.id}")
        return created_user
    except Exception as e:
        print(f"Erreur lors de la création de l'utilisateur: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")


@app.post("/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(auth.get_db)
):
    print(f"Tentative de connexion avec l'email: {form_data.username}")
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        print(f"Échec d'authentification pour: {form_data.username}")
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    
    # Inclure le nom d'utilisateur dans le token
    token_data = {
        "sub": user.email,
        "username": user.username or ""  # Utiliser une chaîne vide si username est None
    }
    token = auth.create_access_token(token_data)
    print(f"Connexion réussie pour: {form_data.username}")
    
    # Retourner également le nom d'utilisateur dans la réponse
    return {
        "access_token": token, 
        "token_type": "bearer",
        "username": user.username or ""
    }


@app.get("/tasks", response_model=list[schemas.Task])
def read_tasks(
    archived: bool = False,
    db: Session = Depends(auth.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    """Récupère toutes les tâches, avec option pour voir les archivées"""
    return crud.get_tasks(db, user_id=1, archived=archived)  # simplifié: user_id=1


@app.post("/tasks", response_model=schemas.Task)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(auth.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    """Crée une nouvelle tâche"""
    try:
        print(f"Création de tâche: {task}")
        created_task = crud.create_task(db, task, user_id=1)
        print(f"Tâche créée: ID={created_task.id}")
        return created_task
    except Exception as e:
        print(f"Erreur création tâche: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(
    task_id: int,
    db: Session = Depends(auth.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    """Récupère une tâche spécifique"""
    task = crud.get_task(db, task_id, user_id=1)
    if task is None:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return task


@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task: schemas.TaskUpdate,
    db: Session = Depends(auth.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    """Met à jour une tâche existante"""
    updated_task = crud.update_task(db, task_id, task, user_id=1)
    if updated_task is None:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return updated_task


@app.delete("/tasks/{task_id}", response_model=schemas.Task)
def delete_task(
    task_id: int,
    db: Session = Depends(auth.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    """Supprime une tâche"""
    task = crud.delete_task(db, task_id, user_id=1)
    if task is None:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return task


@app.post("/tasks/{task_id}/archive", response_model=schemas.Task)
def archive_task(
    task_id: int,
    archive: bool = True,
    db: Session = Depends(auth.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    """Archive ou désarchive une tâche"""
    task = crud.archive_task(db, task_id, user_id=1, archive=archive)
    if task is None:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return task


@app.post("/tasks/search", response_model=list[schemas.Task])
def search_tasks(
    search: schemas.TaskSearch,
    db: Session = Depends(auth.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    """Recherche des tâches avec filtres"""
    return crud.search_tasks(db, user_id=1, search=search)
