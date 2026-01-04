useDatabase.ts
app/state/hooks/useDatabase.ts

import { DatabaseContext } from "@/core/state/context/DatabaseContext";
import { useContext } from "react";

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};
