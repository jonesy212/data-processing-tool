// useUIRealtimeData.tsx
import { fetchData } from '@/app/api/ApiData';
import axiosInstance from '@/app/api/axiosInstance';
import { endpoints } from '@/app/api/endpointConfigurations';
import { BaseData } from '@/app/components/models/data/Data';
import { DocumentActionTypes } from '@/app/tokens/DocumentActions';
import { TokenActionTypes } from '@/app/tokens/TokenActions';
import { Dispatch, useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import { AppActions, AppActionsType } from '../../actions/AppActions';
import { RealtimeData, RealtimeDataItem } from '../../models/realtime/RealtimeData';
import SnapshotStore from '../../snapshots/SnapshotStore';
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { EventActions } from './../../../components/actions/EventActions';
import { useSecureUserId } from '../../utils/useSecureUserId';
export const ENDPOINT = "http://your-backend-endpoint"; // Update with your actual backend endpoint

const isKnownAction = (action: any): action is AppActionsType => {
  // This function can be as complex as needed to check if the action type is known.
  // For simplicity, check against known action types or action type patterns.
  return action.type in AppActions;
};



const handleDocumentAction = (action: DocumentActionTypes) => {
  switch (action.type) {
    case 'addDocument':
      // Handle addDocument
      console.log('Adding document:', action.payload);
      break;

    case 'addDocumentSuccess':
      // Handle addDocumentSuccess
      console.log('Document added successfully:', action.payload);
      break;

    case 'addDocumentFailure':
      // Handle addDocumentFailure
      console.error('Failed to add document:', action.payload);
      break;

    case 'createDocument':
      // Handle createDocument
      console.log('Creating document:', action.payload);
      break;

    case 'updateDocument':
      // Handle updateDocument
      console.log('Updating document:', action.payload);
      break;

    case 'updateDocumentDetails':
      // Handle updateDocumentDetails
      console.log('Updating document details:', action.payload);
      break;

    // Add cases for all other DocumentActionTypes

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};



const handleTokenActions = (action: TokenActionTypes) => {
  switch (action.type) {
    case 'addToken':
      console.log('Handling addToken:', action.payload);
      break;

    case 'addTokens':
      console.log('Handling addTokens:', action.payload);
      break;

    case 'editToken':
      console.log('Handling editToken:', action.payload);
      break;

    case 'deleteToken':
      console.log('Handling deleteToken:', action.payload);
      break;

    case 'editTokens':
      console.log('Handling editTokens:', action.payload);
      break;

    case 'deleteTokens':
      console.log('Handling deleteTokens:', action.payload);
      break;

    case 'createToken':
      console.log('Handling createToken:', action.payload);
      break;

    case 'fetchTokensRequest':
      console.log('Handling fetchTokensRequest');
      break;

    case 'fetchTokensSuccess':
      console.log('Handling fetchTokensSuccess:', action.payload);
      break;

    case 'fetchTokensFailure':
      console.log('Handling fetchTokensFailure:', action.payload);
      break;

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};


// // If you have a function that needs to handle all possible actions
  const handleAction = (action: AppActionsType) => {
    
    switch (action.type) {
      case 'addDocument':
        // Handle addDocument
        break;
      case 'addDocumentSuccess':
        // Handle addDocumentSuccess
        break;
      case 'addDocumentFailure':
        // Handle addDocumentFailure
        break;
      case 'createDocument':
        // Handle createDocument
        break;
      case 'updateDocument':
        // Handle updateDocument
        break;
      case 'updateDocumentDetails':
        // Handle updateDocumentDetails
        break;
      case 'updateDocumentDetailsSuccess':
        // Handle updateDocumentDetailsSuccess
        break;
      case 'updateDocumentDetailsFailure':
        // Handle updateDocumentDetailsFailure
        break;
      case 'updateDocumentDetailsReset':
        // Handle updateDocumentDetailsReset
        break;
      case 'showOptionsForSelectedText':
        // Handle showOptionsForSelectedText
        break;
      case 'deleteDocument':
        // Handle deleteDocument
        break;
      case 'selectDocument':
        // Handle selectDocument
        break;
      case 'selectDocumentSuccess':
        // Handle selectDocumentSuccess
        break;
      case 'setOptions':
        // Handle setOptions
        break;
      case 'updateDocumentTitle':
        // Handle updateDocumentTitle
        break;
      case 'updateDocumentTitleSuccess':
        // Handle updateDocumentTitleSuccess
        break;
      case 'updateDocumentTitleFailure':
        // Handle updateDocumentTitleFailure
        break;
      case 'updateDocumentStatus':
        // Handle updateDocumentStatus
        break;
      case 'updateDocumentStatusSuccess':
        // Handle updateDocumentStatusSuccess
        break;
      case 'updateDocumentStatusFailure':
        // Handle updateDocumentStatusFailure
        break;
      case 'communication':
        // Handle communication
        break;
      case 'communicationSuccess':
        // Handle communicationSuccess
        break;
      case 'communicationFailure':
        // Handle communicationFailure
        break;
      case 'collaboration':
        // Handle collaboration
        break;
      case 'collaborationSuccess':
        // Handle collaborationSuccess
        break;
      case 'collaborationFailure':
        // Handle collaborationFailure
        break;
      case 'projectManagement':
        // Handle projectManagement
        break;
      case 'projectManagementSuccess':
        // Handle projectManagementSuccess
        break;
      case 'projectManagementFailure':
        // Handle projectManagementFailure
        break;
      case 'dataAnalysis':
        // Handle dataAnalysis
        break;
      case 'dataAnalysisSuccess':
        // Handle dataAnalysisSuccess
        break;
      case 'dataAnalysisFailure':
        // Handle dataAnalysisFailure
        break;
      case 'exportDocument':
        // Handle exportDocument
        break;
      case 'exportDocumentSuccess':
        // Handle exportDocumentSuccess
        break;
      case 'exportDocumentFailure':
        // Handle exportDocumentFailure
        break;
      case 'selectDocumentEditingPermissions':
        // Handle selectDocumentEditingPermissions
        break;
      case 'saveDocumentEditingPermissions':
        // Handle saveDocumentEditingPermissions
        break;
      case 'addDocuments':
        // Handle addDocuments
        break;
      case 'updateDocuments':
        // Handle updateDocuments
        break;
      case 'deleteDocuments':
        // Handle deleteDocuments
        break;
      case 'fetchDocumentsRequest':
        // Handle fetchDocumentsRequest
        break;
      case 'fetchDocumentsSuccess':
        // Handle fetchDocumentsSuccess
        break;
      case 'fetchDocumentsFailure':
        // Handle fetchDocumentsFailure
        break;
      case 'selectUserIdea':
        // Handle selectUserIdea
        break;
      case 'addUserIdea':
        // Handle addUserIdea
        break;
      case 'updateUserIdea':
        // Handle updateUserIdea
        break;
      case 'deleteUserIdea':
        // Handle deleteUserIdea
        break;
      default:
        throw new Error(`Unhandled action type: ${action.type}`);
    }
  }




const useUIRealtimeData = <T extends  BaseData<any>, K extends T = T>(
  initialData: RealtimeDataItem[],
  updateCallback: (events: Record<string, CalendarEvent<T, K>[]>,
    snapshotStore: SnapshotStore<T, K>, dataItems: RealtimeDataItem[],
    updateCallback: (dispatch: Dispatch<AppActionsType>) => void

  ) => void
) => {
  const [realtimeData, setRealtimeData] = useState<RealtimeDataItem[]>(initialData);
  const dispatch = (action: any) => {
    if (isKnownAction(action)) {
      // Proceed with dispatch if action is known
      console.log('Dispatching action:', action);
    } else {
      // Handle unknown action, e.g., log a warning or throw an error
      console.warn('Unknown action type:', action.type);
    }
  }

  const fetchAndSetData = async (id: number) => {
    try {
      // Fetch data from the API using the real-time endpoints
      
      const result = await fetchData(endpoints.data.getData, id); // Use the correct endpoint
      if (result) {
        // Extract relevant data from the result
        const { data } = result;
        const { calendarEvents, todos, tasks, currentPhase, comment, highlights, data: additionalData } = data;

        // Update state with the fetched data
        setRealtimeData((prevData) => [
          ...prevData,
          ...calendarEvents.map((event) => ({ ...event, type: 'calendarEvent' })),
          ...todos.map((todo) => ({ ...todo, type: 'todo' })),
          ...tasks.map((task) => ({ ...task, type: 'task' })),
        ]);

        // Synchronize the cache with the new data
        await axiosInstance.post(endpoints.data.updateData, {
          preferences: data,
        });

        // Dispatch an action to update the Redux store
        dispatch({ type: 'UPDATE_REALTIME_DATA', payload: data });

        // Emit an event to trigger further updates via WebSocket
        socketIOClient(ENDPOINT).emit('updateData', data);
      }
    } catch (error) {
      console.error('Error fetching or processing data:', error);
    }
  };
  const actionHandlerService = new ActionHandlerService<AppActionsType>(); // Create an instance of ActionHandlerService

  // Register the handler for `notificationReceived`
  actionHandlerService.register('notificationReceived', (action: { message: string }) => {
    console.log('Notification received:', action.message);
    dispatch(action); // Optionally, dispatch the action if you still need Redux state updates
  });

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    const id = useSecureUserId();
    socket.on(
      'updateData',
      (
        data: any,
        events: Record<string, CalendarEvent<T, K>[]>,
        snapshotStore: SnapshotStore<T, K>,
        dataItems: RealtimeDataItem[]
      ) => {
        const eventId = data.eventId;
        const updatedCallback = (dispatch: Dispatch<DocumentActionTypes>) => {
          // Dispatch actions based on the updated data
          // Example action for event updates
          const action = EventActions.notificationReceived({
            message: `Updated event with ID ${eventId}: ${JSON.stringify(event)}`,
          });
          actionHandlerService.handle(action); // Use handle() instead of dispatch
        };
        // Call the provided updateCallback with the updated data, events, snapshotStore, and dataItems
        updateCallback(events, snapshotStore, dataItems, updatedCallback);

        // Dispatch actions based on updated events
        Object.keys(events).forEach((eventId) => {
          const calendarEvents = events[eventId];
          calendarEvents.forEach((event) => {
            // Example action for event updates
            const action = EventActions.notificationReceived({
              message: `Updated event with ID ${eventId}: ${JSON.stringify(event)}`,
            }); 
            actionHandlerService.handle(action); // Use handle() instead of dispatchj
          });
        });

        // Emit an event to trigger further updates, if needed
        socket.emit('realtimeUpdate', data);
      }
    );

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        socket.connect();
      }, 3000); // Retry connection after 3 seconds (adjust as needed)
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      // Prompt the user to reconnect
      const reconnect = window.confirm('WebSocket disconnected. Do you want to reconnect?');
      if (reconnect) {
        socket.connect();
      }
    });

    // Initial fetch
    if (typeof id === 'number') {
      fetchAndSetData(id);

      // Interval for periodic updates
      const intervalId = setInterval(() => fetchAndSetData(id), 5000); // Fetch data every 5 seconds (adjust as needed)

      return () => {
        // Cleanup: Stop the interval and disconnect WebSocket when the component unmounts
        clearInterval(intervalId);
        socket.disconnect();
      };
    }
  }, [dispatch, updateCallback, fetchAndSetData]);

  return { realtimeData, fetchData: fetchAndSetData }; // Ensure to return fetchAndSetData as `fetchData`
};



// Define your update callback function
const updateCallback =<T extends BaseData<any> = BaseData<any, any>, K extends T = T>
  (events: Record<string, CalendarEvent<T, K>[]>,
  snapshotStore: SnapshotStore<RealtimeData, K>,
  dataItems: RealtimeDataItem[]

) => {
  // Your update logic here

  // Perform any additional logic based on the updated events data
  // For example, you can directly use the updated events data
  Object.keys(events).forEach((eventId: string) => {
    const calendarEvents = events[eventId];
    // Perform actions based on each calendar event
    calendarEvents.forEach((event: CalendarEvent<T, K>) => {
      // Example: Update UI or trigger notifications based on the event
      console.log(`Updated event with ID ${eventId}:`, event);
    });
  });
};

export default useUIRealtimeData;
export { updateCallback };
