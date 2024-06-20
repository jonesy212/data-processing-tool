// useUIRealtimeData.tsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import socketIOClient from 'socket.io-client';
import { Data } from "../../models/data/Data";
import { RealtimeData, RealtimeDataItem } from "../../models/realtime/RealtimeData";
import axiosInstance from "../../security/csrfToken";
import SnapshotStore, { Snapshot } from "../../snapshots/SnapshotStore";
import { CalendarEvent } from "../../state/stores/CalendarEvent";
import { fetchData } from "../../utils/dataAnalysisUtils";
import { useSecureUserId } from "../../utils/useSecureUserId";

export const ENDPOINT = "http://your-backend-endpoint"; // Update with your actual backend endpoint

export type RealtimeUpdateCallback<T extends RealtimeData> = (
  data: SnapshotStore<Snapshot<Data>>,
  events: Record<string, CalendarEvent[]>,
  snapshotStore: SnapshotStore<Snapshot<Data>>,
  dataItems: T[]
) => void;

const useUIRealtimeData = (
  initialData: RealtimeDataItem[],
  updateCallback: RealtimeUpdateCallback<RealtimeData> 
  
) => {
  const [realtimeData, setRealtimeData] = useState<RealtimeDataItem[]>(initialData);
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on(
      "updateData",
      (
        data: any,
        events: Record<string, CalendarEvent[]>,
        snapshotStore: SnapshotStore<Snapshot<Data>>,
        dataItems: RealtimeDataItem[]
      ) => {
        // Call the provided updateCallback with the updated data, events, snapshotStore, and dataItems
        updateCallback(data, events, snapshotStore, dataItems);

        // Emit an event to trigger further updates, if needed
        socket.emit("realtimeUpdate", data);
      }
    );

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      // Implement error handling, such as retry logic or showing an error message
      // For example, you can attempt to reconnect after a delay
      setTimeout(() => {
        socket.connect();
      }, 3000); // Retry connection after 3 seconds (adjust as needed)
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      // Implement logic for reconnection or notifying the user
      // You may want to check the reason for disconnection and handle accordingly
      if (reason === "io server disconnect") {
        // Automatic reconnection is attempted
      } else {
        // Manually attempt reconnection
        socket.connect();
      }
    });

    const fetchData = async (userId: string, dispatchAction: (action: any) => void) => {
      try {
        const response = await axiosInstance.get("/api/data");
        setRealtimeData(response.data);
        await axiosInstance.post("/api/synchronize_cache", {
          preferences: response.data,
        });
        dispatchAction({ type: "UPDATE_REALTIME_DATA", payload: response.data });
        socket!.emit("updateData", response.data);
      } catch (error) {
        console.error("Error fetching or synchronizing data:", error);
      }
    };
    

    const userId = useSecureUserId()
    // Initial fetch
    fetchData(String(userId), dispatch);

    // Interval for periodic updates
    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds (adjust as needed)

    return () => {
      // Cleanup: Stop the interval and disconnect WebSocket when the component unmounts
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [setRealtimeData, updateCallback]);

  return { realtimeData, fetchData };
};

// Define your update callback function
const updateCallback = (events: Record<string, CalendarEvent[]>) => {
  // Your update logic here

  // Perform any additional logic based on the updated events data
  // For example, you can directly use the updated events data
  Object.keys(events).forEach((eventId: string) => {
    const calendarEvents = events[eventId];
    // Perform actions based on each calendar event
    calendarEvents.forEach((event: CalendarEvent) => {
      // Example: Update UI or trigger notifications based on the event
      console.log(`Updated event with ID ${eventId}:`, event);
    });
  });
};

export default useUIRealtimeData;
