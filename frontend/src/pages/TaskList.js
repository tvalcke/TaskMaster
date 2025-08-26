import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Form, Button, ListGroup, Badge, 
  Alert, Tab, Tabs, Modal, InputGroup, FormControl, Card, Dropdown
} from 'react-bootstrap';
import { todoService } from '../services/api';

// Composant pour le formulaire d'ajout/édition de tâche
const TaskForm = ({ task, onSubmit, onCancel, isEditing = false }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.due_date?.split('T')[0] || '');
  const [tags, setTags] = useState(task?.tags || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }

    onSubmit({
      title,
      description,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      tags: tags.trim()
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Titre</Form.Label>
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Que devez-vous faire ?"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description (optionnelle)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Détails de la tâche..."
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Date d'échéance (optionnelle)</Form.Label>
        <Form.Control
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Tags (séparés par des virgules)</Form.Label>
        <Form.Control
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="travail, urgent, projet1"
        />
      </Form.Group>

      <div className="d-flex justify-content-between">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} className="me-2">
            Annuler
          </Button>
        )}
        <Button variant="primary" type="submit">
          {isEditing ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </div>
    </Form>
  );
};

// Composant principal de la liste des tâches
const TaskList = () => {
  // États
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Charger les tâches au chargement de la page
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fonction pour récupérer les tâches depuis l'API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Récupérer les tâches non archivées
      const activeTasks = await todoService.getTasks(false);
      setTasks(activeTasks);
      
      // Récupérer les tâches archivées
      const archived = await todoService.getTasks(true);
      setArchivedTasks(archived);
      
      setError('');
    } catch (error) {
      setError('Erreur lors du chargement des tâches.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ajouter une nouvelle tâche
  const handleAddTask = async (taskData) => {
    try {
      setLoading(true);
      await todoService.createTask(taskData);
      setShowAddForm(false);
      setSuccess('Tâche ajoutée avec succès !');
      
      // Recharger les tâches
      await fetchTasks();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('Erreur lors de l\'ajout de la tâche.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour une tâche
  const handleUpdateTask = async (taskData) => {
    if (!editingTask) return;
    
    try {
      setLoading(true);
      await todoService.updateTask(editingTask.id, taskData);
      setShowEditModal(false);
      setEditingTask(null);
      setSuccess('Tâche mise à jour avec succès !');
      
      // Recharger les tâches
      await fetchTasks();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('Erreur lors de la mise à jour de la tâche.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une tâche
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }
    
    try {
      setLoading(true);
      await todoService.deleteTask(taskId);
      setSuccess('Tâche supprimée avec succès !');
      
      // Recharger les tâches
      await fetchTasks();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('Erreur lors de la suppression de la tâche.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour archiver/désarchiver une tâche
  const handleArchiveTask = async (taskId, archive = true) => {
    try {
      setLoading(true);
      await todoService.archiveTask(taskId, archive);
      setSuccess(`Tâche ${archive ? 'archivée' : 'désarchivée'} avec succès !`);
      
      // Recharger les tâches
      await fetchTasks();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(`Erreur lors de l'${archive ? 'archivage' : 'désarchivage'} de la tâche.`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour marquer une tâche comme terminée
  const handleCompleteTask = async (taskId) => {
    try {
      setLoading(true);
      await todoService.completeTask(taskId);
      setSuccess('Tâche marquée comme terminée !');
      
      // Recharger les tâches
      await fetchTasks();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('Erreur lors de la mise à jour de la tâche.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rechercher des tâches
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    
    try {
      setLoading(true);
      const results = await todoService.searchTasks({
        query: searchQuery,
        archived: false // Par défaut, ne rechercher que dans les tâches non archivées
      });
      setSearchResults(results);
    } catch (error) {
      setError('Erreur lors de la recherche.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fonction pour récupérer la couleur du badge selon le statut
  const getStatusBadge = (status) => {
    switch(status) {
      case 'todo':
        return 'primary';
      case 'in_progress':
        return 'info';
      case 'done':
        return 'success';
      case 'archived':
        return 'secondary';
      default:
        return 'warning';
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch(status) {
      case 'todo':
        return 'À faire';
      case 'in_progress':
        return 'En cours';
      case 'done':
        return 'Terminé';
      case 'archived':
        return 'Archivé';
      default:
        return 'Inconnu';
    }
  };

  // Rendu des tâches
  const renderTaskList = (taskList, isArchived = false) => {
    if (loading && !tasks.length && !archivedTasks.length) {
      return <p>Chargement des tâches...</p>;
    }
    
    if (taskList.length === 0) {
      return <p>Aucune tâche {isArchived ? 'archivée' : ''} pour le moment.</p>;
    }
    
    return (
      <div className="mt-3">
        {taskList.map((task) => (
          <Card key={task.id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Card.Title>{task.title}</Card.Title>
                  {task.description && (
                    <Card.Text className="text-muted">{task.description}</Card.Text>
                  )}
                  <div className="mb-2">
                    <Badge bg={getStatusBadge(task.status)} className="me-2">
                      {getStatusLabel(task.status)}
                    </Badge>
                    {task.due_date && (
                      <Badge bg="dark">
                        Échéance: {formatDate(task.due_date)}
                      </Badge>
                    )}
                  </div>
                  {task.tags && (
                    <div>
                      {task.tags.split(',').map((tag, idx) => (
                        <Badge 
                          bg="light" 
                          text="dark" 
                          key={idx} 
                          className="me-1"
                        >
                          #{tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Dropdown>
                  <Dropdown.Toggle variant="light" id={`dropdown-${task.id}`} size="sm">
                    Actions
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {task.status !== 'done' && (
                      <Dropdown.Item 
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        Marquer comme terminée
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item 
                      onClick={() => {
                        setEditingTask(task);
                        setShowEditModal(true);
                      }}
                    >
                      Modifier
                    </Dropdown.Item>
                    {isArchived ? (
                      <Dropdown.Item 
                        onClick={() => handleArchiveTask(task.id, false)}
                      >
                        Désarchiver
                      </Dropdown.Item>
                    ) : (
                      <Dropdown.Item 
                        onClick={() => handleArchiveTask(task.id, true)}
                      >
                        Archiver
                      </Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-danger"
                    >
                      Supprimer
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Gestion des Tâches</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {/* Bouton d'ajout de tâche */}
      <div className="d-flex justify-content-between mb-4">
        <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Masquer le formulaire' : 'Ajouter une tâche'}
        </Button>
        
        <Form onSubmit={handleSearch} className="d-flex">
          <FormControl
            type="search"
            placeholder="Rechercher une tâche..."
            className="me-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline-primary" type="submit">
            Rechercher
          </Button>
        </Form>
      </div>
      
      {/* Formulaire d'ajout de tâche */}
      {showAddForm && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>Nouvelle tâche</Card.Header>
              <Card.Body>
                <TaskForm onSubmit={handleAddTask} onCancel={() => setShowAddForm(false)} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Résultats de recherche */}
      {searchResults && (
        <div className="mb-4">
          <h4>Résultats de la recherche pour "{searchQuery}"</h4>
          {searchResults.length === 0 ? (
            <Alert variant="info">Aucune tâche trouvée pour cette recherche.</Alert>
          ) : (
            <>
              <p>{searchResults.length} tâche(s) trouvée(s)</p>
              {renderTaskList(searchResults)}
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setSearchResults(null)}
              >
                Effacer les résultats
              </Button>
            </>
          )}
          <hr />
        </div>
      )}
      
      {/* Tabs pour les différentes vues */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        id="tasks-tabs"
      >
        <Tab eventKey="all" title="Toutes les tâches">
          {!searchResults && renderTaskList(tasks)}
        </Tab>
        <Tab eventKey="todo" title="À faire">
          {!searchResults && renderTaskList(tasks.filter(task => task.status === 'todo'))}
        </Tab>
        <Tab eventKey="in_progress" title="En cours">
          {!searchResults && renderTaskList(tasks.filter(task => task.status === 'in_progress'))}
        </Tab>
        <Tab eventKey="done" title="Terminées">
          {!searchResults && renderTaskList(tasks.filter(task => task.status === 'done'))}
        </Tab>
        <Tab eventKey="archived" title="Archives">
          {!searchResults && renderTaskList(archivedTasks, true)}
        </Tab>
      </Tabs>
      
      {/* Modal d'édition de tâche */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier la tâche</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingTask && (
            <TaskForm 
              task={editingTask} 
              onSubmit={handleUpdateTask} 
              onCancel={() => setShowEditModal(false)}
              isEditing={true}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TaskList;
