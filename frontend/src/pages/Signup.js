import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Formulaire soumis avec:', { email, username, password });

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.');
    }

    // Vérifier la longueur du mot de passe
    if (password.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères.');
    }

    setLoading(true);

    try {
      console.log('Tentative d\'inscription...');
      const success = await signup(email, password, username);
      console.log('Résultat inscription:', success);
      if (success) {
        console.log('Inscription réussie, redirection vers login');
        navigate('/login');
      } else {
        console.error('Échec de l\'inscription sans erreur explicite');
        setError('Échec de l\'inscription. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur d\'inscription complète:', error);
      if (typeof error === 'object' && error !== null) {
        // Afficher plus de détails sur l'erreur
        setError(`Erreur: ${error.detail || error.message || JSON.stringify(error)}`);
      } else {
        setError(`Une erreur est survenue: ${error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Inscription</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Adresse email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Pseudo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez votre pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
              <Form.Label>Confirmez le mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirmez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <p>
              Déjà un compte ? <Link to="/login">Connectez-vous</Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
