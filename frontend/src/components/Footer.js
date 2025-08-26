import { Container } from 'react-bootstrap';

const Footer = () => {
  // Récupérer l'année courante
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto py-3">
      <Container className="text-center">
        <div className="footer-content">
          <p className="mb-0">
            © {currentYear} Tristan Valcke
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
