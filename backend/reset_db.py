# Script pour réinitialiser la base de données et créer un utilisateur de test
import os
import sys
import time

print("=======================================")
print("RÉINITIALISATION DE LA BASE DE DONNÉES")
print("=======================================")

# Supprimer la base de données existante
db_path = 'todo.db'
try:
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print("✅ Base de données existante supprimée.")
        except Exception as e:
            print(f"❌ Erreur lors de la suppression: {str(e)}")
            sys.exit(1)
    else:
        print("ℹ️ Pas de base de données existante.")
except Exception as e:
    print(f"❌ Erreur: {str(e)}")
    sys.exit(1)

# Importer après avoir supprimé la base de données
print("Importation des modèles...")
try:
    from app import models, database, crud, schemas
    print("✅ Modules importés avec succès.")
except Exception as e:
    print(f"❌ Erreur d'importation: {str(e)}")
    sys.exit(1)

# Recréer les tables
print("Création des tables...")
try:
    models.Base.metadata.create_all(bind=database.engine)
    print("✅ Tables créées avec succès.")
except Exception as e:
    print(f"❌ Erreur de création des tables: {str(e)}")
    sys.exit(1)

# Créer un utilisateur de test
print("Création d'un utilisateur de test...")
db = database.SessionLocal()
try:
    user = schemas.UserCreate(
        email="test@example.com", 
        username="utilisateur_test", 
        password="password123"
    )
    db_user = crud.create_user(db, user)
    print(f"✅ Utilisateur créé avec l'ID: {db_user.id}, Pseudo: {db_user.username}")
    
    # Créer quelques tâches de test
    print("Création de tâches de test...")
    task1 = schemas.TaskCreate(title="Faire les courses", description="Acheter du lait et du pain")
    task2 = schemas.TaskCreate(title="Payer les factures", description="Électricité et eau")
    task3 = schemas.TaskCreate(title="Appeler le médecin", description="Prendre rendez-vous pour un check-up")
    
    crud.create_task(db, task1, user_id=db_user.id)
    crud.create_task(db, task2, user_id=db_user.id)
    crud.create_task(db, task3, user_id=db_user.id)
    
    print("✅ Tâches de test créées avec succès.")
except Exception as e:
    print(f"❌ Erreur lors de la création des données de test: {str(e)}")
finally:
    db.close()

print("✅ Base de données réinitialisée avec succès.")
print("=======================================")
