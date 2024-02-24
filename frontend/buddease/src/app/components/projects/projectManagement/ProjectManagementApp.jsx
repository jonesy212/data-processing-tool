// ProjectManagementApp.js
import { useDispatch, useSelector } from 'react-redux';
import CommunicationHub from './CommunicationHub';
import DashboardOverview from './DashboardOverview';
import DataAnalysisSection from './DataAnalysisSection';
import { addNotification, selectNotifications } from './NotificationSlice';
import PhasesNavigation from './PhasesNavigation';
import ProjectManager from './ProjectManager';
import ProjectTimelineDashboard from './ProjectTimelineDashboard';
import ProjectWorkspace from './ProjectWorkspace';
import RandomWalkVisualization from './RandomWalkVisualization';

const ProjectManagementApp = () => {
  // Redux state and dispatch setup
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  // Function to send a notification using Redux
  const sendReduxNotification = () => {
    dispatch(addNotification({
      id: '1',
      date: new Date(),
      message: 'New notification added',
      createdAt: new Date(),
      type: 'Info',
      content: 'This is a test notification',
    }));
  };

  return (
      <div>
        <DashboardOverview />
        <ProjectWorkspace />
        <CommunicationHub />
        <PhasesNavigation />
        <DataAnalysisSection />
        <ProjectTimelineDashboard />
        <RandomWalkVisualization />
        <ProjectManager />
        {/* Add other components as needed */}

        <button onClick={sendReduxNotification}>Send Redux Notification</button>
        <NotificationDisplay notifications={notifications} />
      </div>
  );
};

const NotificationDisplay = ({ notifications }) => {
  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManagementApp;
