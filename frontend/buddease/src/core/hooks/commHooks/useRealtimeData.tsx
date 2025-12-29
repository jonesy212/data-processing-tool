// useRealtimeData.tsx
import axiosInstance from '@/core/api/csrfToken';
import { endpoints } from '@/core/api/endpointConfigurations';
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Data } from '@/core/models/data/Data';
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { RealtimeDataItem } from "@/core/typings/realtimeTypes";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import socketIOClient, { Socket } from 'socket.io-client';

export const ENDPOINT = endpoints.backend

type RealtimeUpdateCallback<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = (
    id: string,
    events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
) => void;

const useRealtimeData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  initialData: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  updateCallback: RealtimeUpdateCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>(initialData);
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
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
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
export type { RealtimeUpdateCallback };
