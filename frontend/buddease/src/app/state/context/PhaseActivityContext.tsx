// PhaseActivityContext.ts
import React, { createContext, useContext } from "react";
import { usePhaseActivity } from '@/app/hooks/usePhaseActivity';

interface PhaseActivityContextType {
  getLastActivityTime: (phaseName: string) => number;
  recordActivity: (phaseName: string) => void;
  getPhaseStats: (phaseName: string) => { lastActivityTime: number; activityCount: number };
  clearActivities: () => void;
  getPhaseNames: () => string[];
  getTotalActivityCount: () => number;
}

const PhaseActivityContext = createContext<PhaseActivityContextType | undefined>(undefined);

export const PhaseActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const phaseActivity = usePhaseActivity();

  return (
    <PhaseActivityContext.Provider value={phaseActivity}>
      {children}
    </PhaseActivityContext.Provider>
  );
};

export const usePhaseActivityContext = (): PhaseActivityContextType => {
  const context = useContext(PhaseActivityContext);
  if (!context) {
    throw new Error("usePhaseActivityContext must be used within a PhaseActivityProvider");
  }
  return context;
};