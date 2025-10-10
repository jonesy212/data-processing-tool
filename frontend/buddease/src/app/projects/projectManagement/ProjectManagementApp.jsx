// ProjectManagementApp.js
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import CommunicationHub from '@/CommunicationHub';
import DashboardOverview from '@/DashboardOverview';
import DataAnalysisSection from '@/DataAnalysisSection';
import { addNotification, selectNotifications } from '@/NotificationSlice';
import PhasesNavigation from '@/PhasesNavigation';
import ProjectManagerComponent from '@/ProjectManager';
import ProjectTimelineDashboard from '@/ProjectTimelineDashboard';
import ProjectWorkspace from '@/ProjectWorkspace';
import RandomWalkVisualization from '@/RandomWalkVisualization';
import ProjectCreationForm from '@/projects/ProjectCreationForm';
import { ClientProjectEntity } from '@/projects/Project';

const ProjectManagementApp = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projects, setProjects] = useState([]);

  // Mock data - replace with actual API calls
  const teams = [
    { id: 'team-1', name: 'Development Team' },
    { id: 'team-2', name: 'Design Team' },
    { id: 'team-3', name: 'Research Team' }
  ];

  const users = [
    { id: 'user-1', name: 'John Doe' },
    { id: 'user-2', name: 'Jane Smith' },
    { id: 'user-3', name: 'Mike Johnson' }
  ];

  // Handle project creation/editing
  const handleProjectSubmit = async (projectData: ClientProjectEntity) => {
    try {
      if (editingProject) {
        // Update existing project
        setProjects(prev => prev.map(p => 
          p.id === editingProject.id ? { ...p, ...projectData } : p
        ));
        dispatch(addNotification({
          id: Date.now().toString(),
          date: new Date(),
          message: 'Project updated successfully',
          createdAt: new Date(),
          type: 'Success',
          content: `Project "${projectData.name}" has been updated`,
        }));
      } else {
        // Create new project
        const newProject = {
          ...projectData,
          id: `proj-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setProjects(prev => [...prev, newProject]);
        dispatch(addNotification({
          id: Date.now().toString(),
          date: new Date(),
          message: 'Project created successfully',
          createdAt: new Date(),
          type: 'Success',
          content: `New project "${projectData.name}" has been created`,
        }));
      }
      
      setShowProjectForm(false);
      setEditingProject(null);
    } catch (error) {
      dispatch(addNotification({
        id: Date.now().toString(),
        date: new Date(),
        message: 'Error saving project',
        createdAt: new Date(),
        type: 'Error',
        content: 'Failed to save project changes',
      }));
    }
  };

  // Handle project editing
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  // Handle project deletion
  const handleDeleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    dispatch(addNotification({
      id: Date.now().toString(),
      date: new Date(),
      message: 'Project deleted',
      createdAt: new Date(),
      type: 'Warning',
      content: 'Project has been deleted',
    }));
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  // Function to send a notification using Redux
  const sendReduxNotification = () => {
    dispatch(addNotification({
      id: Date.now().toString(),
      date: new Date(),
      message: 'New notification added',
      createdAt: new Date(),
      type: 'Info',
      content: 'This is a test notification',
    }));
  };

  return (
    <div className="project-management-app">
      {/* Header with project creation button */}
      <div className="app-header">
        <h1>Project Management Dashboard</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowProjectForm(true)}
        >
          Create New Project
        </button>
      </div>

      {/* Project Creation/Edit Form Modal */}
      {showProjectForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProjectCreationForm
              onSubmit={handleProjectSubmit}
              onCancel={handleCancelForm}
              initialData={editingProject}
              teams={teams}
              users={users}
              mode={editingProject ? 'edit' : 'create'}
            />
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <DashboardOverview projects={projects} />
        
        <div className="dashboard-grid">
          <div className="grid-column">
            <ProjectWorkspace 
              projects={projects}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
            />
            <ProjectTimelineDashboard projects={projects} />
          </div>
          
          <div className="grid-column">
            <CommunicationHub />
            <DataAnalysisSection />
          </div>
        </div>

        <div className="dashboard-bottom">
          <PhasesNavigation />
          <RandomWalkVisualization />
          <ProjectManagerComponent 
            projects={projects}
            onProjectAction={handleEditProject}
          />
        </div>
      </div>

      {/* Notification Section */}
      <div className="notification-section">
        <button onClick={sendReduxNotification}>Send Test Notification</button>
        <NotificationDisplay notifications={notifications} />
      </div>
    </div>
  );
};

const NotificationDisplay = ({ notifications }) => {
  return (
    <div className="notification-display">
      <h2>Notifications</h2>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id} className={`notification-${notification.type.toLowerCase()}`}>
            <strong>{notification.type}:</strong> {notification.message}
            <br />
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManagementApp;