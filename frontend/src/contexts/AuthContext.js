import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

// Créer le contexte d'authentification
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userEmail = localStorage.getItem('user_email');
          const username = localStorage.getItem('username');
          setUser({ 
            email: userEmail,
            username: username || '' 
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification :", error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser({ 
        email: email,
        username: response.username || ''
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      return false;
    }
  };

  // Fonction d'inscription
  const signup = async (email, password, username = "") => {
    try {
      console.log("Début de l'inscription via AuthContext");
      const result = await authService.signup(email, password, username);
      console.log("Résultat de l'inscription:", result);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'inscription (AuthContext):", error);
      // Propager l'erreur au lieu de retourner false
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
