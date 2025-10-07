// useRealtimeData.tsx
import { endpoints } from '@/app/api/endpointConfigurations';
import axiosInstance from '@/app/api/csrfToken';
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { RealtimeData, RealtimeDataItem } from "@/app/models/realtime/RealtimeData";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import socketIOClient, { Socket } from 'socket.io-client';
 
export const ENDPOINT = endpoints.backend

export type RealtimeUpdateCallback<
  T extends RealtimeData<
    BaseDataEntity,
    BaseDataEntity,
    DefaultMeta<BaseDataEntity, BaseDataEntity>,
    keyof BaseDataEntity
  >,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> = (
  id: string,
  events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
  dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
  data?: InitializedData<T, K, Meta, ExcludedFields> | null
) => void;

const useRealtimeData = <
  T extends RealtimeData<BaseDataEntity, BaseDataEntity>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  initialData: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
  updateCallback: RealtimeUpdateCallback<T, K, Meta, ExcludedFields>
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeDataItem<T, K, Meta, ExcludedFields>[]>(initialData);
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
      callback(response.data);
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
        events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
        snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
        dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
        data?: InitializedData<T, K, Meta, ExcludedFields> | null
      ) => {
        if (!data || !snapshotStore || !dataItems) {
          console.error("Received data, snapshotStore, or dataItems is null");
          return;
        }

        updateCallback(id, events, snapshotStore, dataItems, data);
        setRealtimeData(dataItems);
        socket.emit("realtimeUpdate", data);
      }
    );

    // handle socket errors
    socket.on("connect_error", (error: any) => {
      console.error("WebSocket connection error:", error);
      setTimeout(() => socket.connect(), 3000);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("WebSocket disconnected:", reason);
      if (reason === "io server disconnect") socket.connect();
    });

    const intervalId = setInterval(() => {
      if (socket.connected) fetchData("", () => {}).catch(console.error);
    }, 5000);

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [setRealtimeData, updateCallback]);

  return { realtimeData, fetchData };
};


export default useRealtimeData;
