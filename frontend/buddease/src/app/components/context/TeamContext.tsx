// TeamContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { Team } from '../models/teams/Team';

// Define the type for the context props
type TeamContextProps = {
  teamData: Team[]; // Use the defined type for team data
  updateTeamData: (newData: Team[] | ((prevState: Team[]) => Team[])) => void;
  children: React.ReactNode;
};

// Define the context type
type TeamContextType = {
  teamData: Team[];
  updateTeamData: (newData: Team[] | ((prevState: Team[]) => Team[])) => void;
  
};

// Create the context
const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Custom hook for consuming the context
export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeamContext must be used within a TeamProvider');
  }
  return context;
};

// Provider component for managing team data
export const TeamProvider: React.FC<TeamContextProps> = ({ children }) => {
  // State to store team data
  const [teamData, setTeamData] = useState<Team[]>([]);

  // Function to update team data
  const updateTeamData = (newData: Team[] | ((prevState: Team[]) => Team[])) => {
    setTeamData(newData);
  };

  // Context value to provide to consumers
  const contextValue: TeamContextType = {
    teamData,
    updateTeamData,
  };

  // Render the provider with the context value
  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
};
