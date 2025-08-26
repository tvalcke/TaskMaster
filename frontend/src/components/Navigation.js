import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effet pour gérer le défilement et ajouter des classes CSS
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Mise à jour de l'heure chaque minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar 
      className={`navbar ${scrolled ? 'shadow-sm' : ''}`} 
      expand="lg"
      style={{
        transition: 'all 0.3s ease'
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span className="fw-bold">TaskMaster</span>
          <Badge bg="secondary" className="ms-2" style={{ fontSize: '0.6rem' }}>
            {currentTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
          </Badge>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/tasks" className="d-flex align-items-center">
                  <i className="bi bi-list-task me-1"></i> Mes Tâches
                </Nav.Link>
                <Nav.Item className="d-flex align-items-center mx-2 px-3 border-start border-end">
                  <span style={{ color: 'var(--primary-dark)', fontWeight: 500 }}>
                    <i className="bi bi-person-circle me-1"></i> 
                    {user.username ? user.username : user.email}
                  </span>
                </Nav.Item>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="d-flex align-items-center">
                  <i className="bi bi-key me-1"></i> Connexion
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" className="d-flex align-items-center">
                  <i className="bi bi-person-plus me-1"></i> Inscription
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
