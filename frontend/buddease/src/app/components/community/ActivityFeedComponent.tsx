import apiNotificationsService from "@/app/api/NotificationsService";
import { initializeUserData } from "@/app/pages/onboarding/PersonaBuilderData";
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { sortFilteredEvents } from "../state/redux/slices/FilteredEventsSlice";
import { NotificationData } from "../support/NofiticationsSlice";
import { User, UserData } from "../users/User";
import { subscribeToRealtimeUpdates } from "../web3/dAppAdapter/functionality/RealtimeUpdates";
import useFilteredEventsSlice from "../state/redux/slices/FilteredEventsSlice";
import useSorting from "../hooks/useSorting";

export interface RealtimeUpdates {
  id: string;
  message: string;
  // Add other properties of RealtimeUpdates here
}

const ActivityFeedComponent: React.FC = () => {
  const { state: authState } = useAuth();
  const id = authState.user?.id;
  const {
    state: filteredEventsState,
    addFilteredEvent,
    removeFilteredEvent,
    clearFilteredEvents,
  } = useFilteredEventsSlice();

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealtimeUpdates[]>([]);

  const { sortEvents, setSortByTitle, setSortByDate } = useSorting();

  
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const fetchedNotifications =
          await apiNotificationsService.fetchNotifications();
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchInitialNotifications();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (authState.user) {
        try {
          const userData: UserData | (() => UserData | null) | null =
            await initializeUserData(id as string | number, authState.user);
          if (userData && typeof userData !== "function") {
            setRealTimeUpdates(userData.realtimeUpdates || []);
          }
        } catch (error) {
          console.error("Error initializing user data:", error);
        }
      }
    };

    fetchData();

    if (authState.user) {
      const realTimeUpdateSubscription = subscribeToRealtimeUpdates(
        authState.user,
        (user: User, update: RealtimeUpdates) => {
          // Process the update here as needed
          setRealTimeUpdates((prevUpdates) => [...prevUpdates, update]);
          // Increment unreadNotificationCount if it exists
          if (user.unreadNotificationCount) {
            user.unreadNotificationCount++;
          }
        }
      );

      return () => {
        realTimeUpdateSubscription.unsubscribe();
      };
    }
  }, []);
    
    
    

    
  const handleSortByTitle = () => {
    setSortByTitle();
    sortFilteredEvents("title");
  };

  const handleSortByDate = () => {
    setSortByDate();
    sortFilteredEvents("date");
  };


  return (
    <div>
      <h2>Activity Feed</h2>

      <div>
        <h3>Notifications:</h3>
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id}>{notification.message}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Filtered Events:</h3>
        <button onClick={handleSortByTitle}>Sort by Title</button>
        <button onClick={handleSortByDate}>Sort by Date</button>
        <ul>
          {sortEvents(addFilteredEvent).map((event: any) => (
            <li key={event.id}>{event.message}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Real-time Updates:</h3>
        <ul>
          {realTimeUpdates.map((update) => (
            <li key={update.id}>{update.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );

};

export default ActivityFeedComponent;
