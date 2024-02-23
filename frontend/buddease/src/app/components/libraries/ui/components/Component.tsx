import { addNotification } from '@/app/components/calendar/CalendarSlice';
import { useNotification } from '@/app/components/hooks/commHooks/useNotification';
import useNotificationManagerService from '@/app/components/notifications/NotificationService';
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import { useDispatch } from 'react-redux';
import { ComponentActions } from './ComponentActions';


const {notify} = useNotification();
const Component = () => {
  const dispatch = useDispatch();

  const handleAddComponent = async () => {
    try {
      // Call the appropriate functions from the notification service
      await useNotificationManagerService().handleButtonClick();
      useNotificationManagerService().sendAnnouncement('New announcement!', 'Admin');
      useNotificationManagerService().sendPushNotification('New push notification!', 'System');
      // Notify user using the notification context
      await notify('Component added successfully', NOTIFICATION_MESSAGES.Component.ADD_COMPONENT_SUCCESS, new Date, 'OperationSuccess');
    } catch (error) {
      console.error('Error adding component:', error);
      // Notify user of the error using the notification context
      await notify('Failed to add component', NOTIFICATION_MESSAGES.Component.CREATE_COMPONENT_FAILURE, new Date, "OperationError");
    }
  };

  const handleRemoveComponent = () => {
    try {
      // Dispatch an action to remove a component
      dispatch(ComponentActions.removeComponent(1)); // Provide the ID of the component to remove
      // Provide feedback to users
      addNotification('Component removed successfully');
    } catch (error) {
      console.error('Error removing component:', error);
      // Handle error and provide feedback to users
      addNotification(payload: { error: error.message });
    }
  };

  const handleUpdateComponent = () => {
    try {
      // Dispatch an action to update a component
      dispatch(ComponentActions.updateComponent({ id: 1, updatedComponent: { name: 'Updated Component' } })); // Provide the ID and updated data of the component
      // Provide feedback to users
      addNotification('success', 'Component updated successfully');
    } catch (error) {
      console.error('Error updating component:', error);
      // Handle error and provide feedback to users
      addNotification('error', 'Failed to update component');
    }
  };

  return (
    <div>
      <h1>Component Management</h1>
      <button onClick={handleAddComponent}>Add Component</button>
      <button onClick={handleRemoveComponent}>Remove Component</button>
      <button onClick={handleUpdateComponent}>Update Component</button>
    </div>
  );
};

export default Component;
