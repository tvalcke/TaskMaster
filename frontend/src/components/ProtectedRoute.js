import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Container, Row, Col } from 'react-bootstrap';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Afficher un spinner stylisé pendant le chargement
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Row>
          <Col className="text-center">
            <Spinner
              animation="border"
              variant="primary"
              style={{ 
                width: "3rem", 
                height: "3rem",
                borderWidth: "0.3em"
              }}
            />
            <div className="mt-3 fw-bold" style={{ color: 'var(--primary-color)' }}>
              Chargement de votre espace...
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si authentifié, afficher les enfants de cette route
  return <Outlet />;
};

export default ProtectedRoute;
