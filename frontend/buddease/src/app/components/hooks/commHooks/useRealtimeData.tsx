// useRealtimeData.tsx
import { isArrayOfTypeT } from '@/app/components/utils/snapshotUtils';
import { endpoints } from "@/app/api/ApiEndpoints";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import socketIOClient, { Socket } from 'socket.io-client';
import { Data } from "../../models/data/Data";
import { RealtimeData, RealtimeDataItem } from "../../models/realtime/RealtimeData";
import axiosInstance from "../../security/csrfToken";
import SnapshotStore from "../../snapshots/SnapshotStore";
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';

export const ENDPOINT = endpoints.backend

export type RealtimeUpdateCallback<T extends RealtimeData, K extends T = T> = (
  id: string,
  data: SnapshotStore<T, K>,
  events: Record<string, CalendarEvent[]>,
  snapshotStore: SnapshotStore<T, K>,
  dataItems: T[]
) => void;

const useRealtimeData = <T extends RealtimeDataItem, K extends T = T>(
  initialData: RealtimeDataItem[],
  updateCallback: RealtimeUpdateCallback<T, K>
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeDataItem[]>(initialData);
  const dispatch = useDispatch();

  const fetchData = async (userId: string, callback: (action: any) => void) => {
    try {
      const response = await axiosInstance.get("/api/data");
      setRealtimeData(response.data);
      await axiosInstance.post("/api/synchronize_cache", {
        preferences: response.data,
      });
      dispatch({ type: "UPDATE_REALTIME_DATA", payload: response.data });
      socket!.emit("updateData", response.data);
      callback(response.data); // Call the callback function with the response data
    } catch (error) {
      console.error("Error fetching or synchronizing data:", error);
    }
  };
  
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    setSocket(socket);

    socket.on(
      "updateData",
      (
        id: string,
        data: SnapshotStore<T, K>,
        events: Record<string, CalendarEvent[]>,
        snapshotStore: SnapshotStore<T, K>, // Also fix type here
        dataItems: RealtimeDataItem[]
      ) => {

        
        if (isArrayOfTypeT<T>(dataItems)) {
          updateCallback(id, data, events, snapshotStore, dataItems);
          setRealtimeData(dataItems);
        } else {
          console.error("Received dataItems do not match the expected type T");
        }

        setRealtimeData(dataItems);
        socket.emit("realtimeUpdate", data);
      }
    );  

    socket.on("connect_error", (error: any) => {
      console.error("WebSocket connection error:", error);
      setTimeout(() => {
        socket.connect();
      }, 3000); // Retry connection after 3 seconds
    });

    socket.on("disconnect", (reason: string) => {
      console.log("WebSocket disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    const intervalId = setInterval(() => {
      if (socket.connected) {
        fetchData("", () => {}).catch(console.error);
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [setRealtimeData, updateCallback]);

  return { realtimeData, fetchData };
};

export default useRealtimeData;
