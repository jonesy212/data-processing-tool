'use client';

import DatabaseClient from "@/core/api/DatabaseClient";
import { DatabaseContext } from "@/core/state/context/DatabaseContext";
import { useAuthStore } from "@/core/state/stores/AuthStore";
import React, { useEffect, useRef, useState } from "react";

interface DatabaseProviderProps {
  children: React.ReactNode;
  dbStatus?: any;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
  dbStatus
}) => {
  const clientRef = useRef<DatabaseClient | null>(null);
  const authStore = useAuthStore();

  const [status, setStatus] = useState<"idle" | "connected" | "error">("idle");
  const connectInProgress = useRef(false);

  const connect = async () => {
    if (connectInProgress.current) return;
    connectInProgress.current = true;

    try {
      if (!clientRef.current) {
        clientRef.current = new DatabaseClient();
      }

      await clientRef.current.connect();
      setStatus("connected");
    } catch (err) {
      console.error("Database connection failed", err);
      setStatus("error");
    } finally {
      connectInProgress.current = false;
    }
  };

  const reconnect = async () => {
    setStatus("idle");
    await connect();
  };

  // Initial connection on mount
  useEffect(() => {
    connect();
  }, []);

  // Reconnect whenever auth token changes
  useEffect(() => {
    if (authStore.accessToken) {
      reconnect();
    }
  }, [authStore.accessToken]);

  return (
    <DatabaseContext.Provider
      value={{
        client: clientRef.current as DatabaseClient,
        status,
        reconnect,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
