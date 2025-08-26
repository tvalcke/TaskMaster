import requests
import json

# Configuration
API_URL = "http://localhost:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzU2MjQ2MzAwfQ.bsgzmWaEn1Mi4a-bN_IHDwVv2S0pmmHgiQX1xc65lvo"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# Données de la tâche
task_data = {
    "title": "Tâche de test via Python",
    "description": "Ceci est un test avec Python",
    "due_date": None,
    "tags": "test,python"
}

# Faire la requête
try:
    response = requests.post(
        f"{API_URL}/tasks",
        headers=HEADERS,
        json=task_data
    )
    
    # Afficher la réponse
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("Tâche créée avec succès !")
    else:
        print("Erreur lors de la création de la tâche.")
        
except Exception as e:
    print(f"Erreur: {str(e)}")
