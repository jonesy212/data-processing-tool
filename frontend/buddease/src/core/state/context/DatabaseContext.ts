// DatabaseContext.ts
app/interfaces/provider/DatabaseContext.ts
'use client';

import DatabaseClient from "@/core/api/DatabaseClient";
import { createContext, useContext } from "react";

export interface DatabaseContextType {
  client: DatabaseClient;
  status: "idle" | "connected" | "error";
  reconnect: () => Promise<void>;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const useDatabase = (): DatabaseContextType => {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error("useDatabase must be used inside DatabaseProvider");
  }
  return ctx;
};
