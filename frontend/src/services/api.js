// Service pour interagir avec l'API backend
import axios from 'axios';
import config from '../config.json';

// Déterminer l'environnement (production ou développement)
const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const API_URL = config[environment].REACT_APP_API_URL;

// Configuration d'axios avec l'URL de base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Service d'authentification
export const authService = {
  // Inscription d'un nouvel utilisateur
  signup: async (email, password, username = "") => {
    try {
      console.log('Tentative d\'inscription avec:', { email, username, password });
      // Créer un objet de données qui correspond exactement à ce qu'attend le backend
      const userData = {
        email: email,
        username: username,
        password: password
      };
      console.log('Données envoyées:', userData);
      const response = await apiClient.post('/signup', userData);
      console.log('Réponse d\'inscription:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },

  // Connexion utilisateur
  login: async (email, password) => {
    try {
      console.log('Tentative de connexion avec:', { email });
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post(`${API_URL}/token`, formData);
      console.log('Réponse de connexion:', response.data);
      
      // Stocker le token et les informations utilisateur dans le localStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_email', email);
      localStorage.setItem('username', response.data.username || '');
      
      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Déconnexion utilisateur
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('username');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },
};

// Service des tâches
export const todoService = {
  // Récupérer toutes les tâches (non archivées par défaut)
  getTasks: async (archived = false) => {
    try {
      const response = await apiClient.get(`/tasks?archived=${archived}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer une tâche spécifique
  getTask: async (id) => {
    try {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Créer une nouvelle tâche
  createTask: async (taskData) => {
    try {
      const response = await apiClient.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour une tâche
  updateTask: async (id, taskData) => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Supprimer une tâche
  deleteTask: async (id) => {
    try {
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Archiver/Désarchiver une tâche
  archiveTask: async (id, archive = true) => {
    try {
      const response = await apiClient.post(`/tasks/${id}/archive?archive=${archive}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Marquer une tâche comme terminée
  completeTask: async (id) => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, { 
        status: 'done',
        done: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Recherche de tâches
  searchTasks: async (searchParams) => {
    try {
      const response = await apiClient.post('/tasks/search', searchParams);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
