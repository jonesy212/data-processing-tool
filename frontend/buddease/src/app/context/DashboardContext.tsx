import React, { createContext, useContext, useState } from 'react';

type DashboardContextType = {
  currentDashboard: string | null;
  setCurrentDashboard: React.Dispatch<React.SetStateAction<string | null>>;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider: React.FC = ({ children }) => {
  const [currentDashboard, setCurrentDashboard] = useState<string | null>(null);

  return (
    <DashboardContext.Provider value={{ currentDashboard, setCurrentDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
