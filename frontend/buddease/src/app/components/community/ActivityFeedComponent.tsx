import apiNotificationsService from "@/app/api/NotificationsService";
import { initializeUserData } from "@/app/pages/onboarding/PersonaBuilderData";
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { addFilteredEvent, sortFilteredEvents } from "../state/redux/slices/FilteredEventsSlice";
import { NotificationData } from "../support/NofiticationsSlice";
import { User, UserData } from "../users/User";
import { subscribeToRealtimeUpdates } from "../web3/dAppAdapter/functionality/RealtimeUpdates";
import useFilteredEventsSlice from "../state/redux/slices/FilteredEventsSlice";
import useSorting from "../hooks/useSorting";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/redux/slices/RootSlice";
import { useFilterStore } from "../state/stores/FilterStore";

export interface RealtimeUpdates {
  id: string;
  message: string;
  dispatch: (action: any) => void;
  // Add other properties of RealtimeUpdates here
}


const ActivityFeedComponent: React.FC<RealtimeUpdates> = ({dispatch}) => {
  const { state: authState } = useAuth();
  const id = authState.user?.id;
  const filterStore = useFilterStore(); // Get an instance of FilterStore
  const filteredEventsState = useSelector((state: RootState) => state.filteredEvents);
  // Now you can dispatch actions like this
  dispatch(useFilterStore().addFilteredEvent(event));
  dispatch(useFilterStore().removeFilteredEvent(filteredEvents.id));
  dispatch(useFilterStore().clearFilteredEvents(filteredEvents));
  
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealtimeUpdates[]>([]);

  const { sortEvents, setSortByTitle, setSortByDate } = useSorting();



  const addEvent = (event: ExtendedCalendarEvent | CalendarEvent | HighlightEvent) => {
    filterStore.addFilteredEvent(event);
  };

  const removeEvent = (eventId: string) => {
    filterStore.removeFilteredEvent(eventId);
  };

  const clearEvents = () => {
    filterStore.clearFilteredEvents();
  };

  
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
    filterStore.setFilteredEvents(
      [...filterStore.filteredEvents].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );
  };

  const handleFilterByCategory = (category: string) => {
    filterStore.setFilteredEvents(
      filterStore.filteredEvents.filter((event) => event.category === category)
    );
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
        <button onClick={() => handleFilterByCategory("Work")}>Filter by "Work"</button>
        <button onClick={() => handleFilterByCategory("Personal")}>Filter by "Personal"</button>
        <ul>
          {filterStore.filteredEvents.map((event) => (
            <li key={event.id}>
              <strong>{event.title}</strong> - {event.date} - {event.category}
            </li>
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

      <div>
        <h3>Manage Events:</h3>
        <button
          onClick={() =>
            addEvent({ id: "1", title: "Event 1", date: "2024-12-02", category: "Work" })
          }
        >
          Add Event 1
        </button>
        <button onClick={() => removeEvent("1")}>Remove Event 1</button>
        <button onClick={clearEvents}>Clear All Events</button>
      </div>
    </div>
  );
export default ActivityFeedComponent;
