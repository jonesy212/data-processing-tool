import axiosInstance from "@/app/api/axiosInstance";
import { useAuth } from "@/app/components/auth/AuthContext";
import { User, UserData } from "@/app/components/users/User";
import { initializeUserData } from "@/app/pages/onboarding/PersonaBuilderData";
import { useEffect, useState } from "react";
import { RealtimeUpdates } from "@/app/components/community/ActivityFeedComponent";

// Import UI components for sorting and filtering
import {
  Dropdown,
  Checkbox,
  ToggleSwitch,
  DatePicker,
  TagCloud,
  ClearFiltersButton,
  SortableTableHeaders
} from "./YourUIComponents";




// Define the type for participant data
interface ParticipantData {
  id: string; // Unique identifier for the participant
  name: string; // Participant's name
  email: string; // Participant's email address
  role: string; // Participant's role in the app (e.g., admin, moderator, member)
  // Add more fields as per your app's requirements
}

// Function to fetch participant data from the backend API
export const fetchParticipantData = async (
  userId: string | number
): Promise<ParticipantData> => {
  try {
    // Make a GET request to fetch participant data
    const response = await axiosInstance.get(`/api/participants/${userId}`);

    // Return the fetched participant data
    return response.data as ParticipantData;
  } catch (error) {
    // Handle errors gracefully
    console.error("Error fetching participant data:", error);
    throw new Error("Failed to fetch participant data");
  }
};

const RealtimeUpdatesComponent: React.FC = () => {
  const { state: authState } = useAuth();
  const id = authState.user?.id;
  const [realtimeData, setRealtimeData] = useState<UserData | null>(null);
  const [chatSettings, setChatSettings] = useState<{
    realTimeChatEnabled: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (authState.user) {
        const realTimeUpdateSubscription = subscribeToRealtimeUpdates(
          authState.user,
          (user: User,
            update:  RealtimeUpdates) => {
            // Process the update here as needed
            setRealtimeData(update);
            setChatSettings({
              realTimeChatEnabled: true, // Example change
            });
            // Update user properties
            user.unreadNotificationCount =
              (user.unreadNotificationCount || 0) + 1;
            // Or if you have a specific property for updates count:
            // user.unreadUpdatesCount = (user.unreadUpdatesCount || 0) + 1;
          }
        );
        try {
          const userData = await initializeUserData(
            id as string | number,
            authState.user
          );
          setRealtimeData(userData);
        } catch (error) {
          console.error("Error initializing user data:", error);
        }
      }
    };

    fetchData();

    if (authState.user) {
      const realTimeUpdateSubscription = subscribeToRealtimeUpdates(
        authState.user,
        handleRealtimeUpdate
      );

      // Define the type of unsubscribe explicitly
      const unsubscribeFunction = realTimeUpdateSubscription.unsubscribe;
      // Check if unsubscribeFunction is a function before calling it
      if (typeof unsubscribeFunction === "function") {
        unsubscribeFunction();
      }

      return () => {
        if (realTimeUpdateSubscription) {
          realTimeUpdateSubscription.unsubscribe();
        }
      };
    }
  }, [authState.user, id]);

  const handleRealtimeUpdate = (newData: UserData) => {
    setRealtimeData(newData);

    // Ensure chatSettings is always defined
    const chatSettings =
      typeof newData.chatSettings === "string"
        ? { realTimeChatEnabled: false }
        : newData.chatSettings || {
            realTimeChatEnabled: false,
            // Other default values for chatSettings properties
          };

    // Update chat settings based on real-time updates
    setChatSettings({
      realTimeChatEnabled: chatSettings.realTimeChatEnabled,
      // Other properties from chatSettings
    });
  };

  if (!authState.user) {
    // Handle null user case
    return (
      <div>
        <p>User is not authenticated.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Real-time Updates</h2>
      {/* Display real-time data */}
      {/* For example: */}
      <p>Username: {authState.user.username}</p>
      <p>Email: {authState.user.email}</p>
      {/* ... Other real-time data */}
      <p>Real-time Data: {JSON.stringify(realtimeData)}</p>
    </div>
  );
};

export const subscribeToRealtimeUpdates = (
  user: User,
  callback?: (user: User, update:  RealtimeUpdates) => void
) => {
  // Implement your subscription logic here
  // For example, connect to a WebSocket or use other real-time communication methods

  // Mock implementation for demonstration purposes
  const mockWebSocket = new WebSocket("ws://example.com/realtime");
  mockWebSocket.onmessage = (event) => {
    const newData:  RealtimeUpdates = JSON.parse(event.data); // Assuming RealtimeUpdates is the correct interface for your real-time updates
    if (callback) {
      callback(user, newData);
    }
  };

  // Return an object with an unsubscribe function to clean up the subscription when needed
  return {
    unsubscribe: () => {
      mockWebSocket.close();
    },
  };
};
export default RealtimeUpdatesComponent;
