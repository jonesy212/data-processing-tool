// useDatabase.ts
// app/state/hooks/useDatabase.ts

import { useContext } from "react";
import { DatabaseContext } from "@/app/state/context/DatabaseContext";

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};
