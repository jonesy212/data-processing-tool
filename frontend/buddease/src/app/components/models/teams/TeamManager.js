// TeamManager.ts

import { TeamFull, createDefaultTeam } from '@/app/typings/entities/TeamEntity';

const TeamManager = () => {
  const [currentTeam, setCurrentTeam] = useState<TeamFull>(emptyTeam);
  const [teams, setTeams] = useState<TeamFull[]>([]);

  const createNewTeam = (name: string, ownerId: string) => {
    const newTeam = createDefaultTeam({ 
      name, 
      ownerId,
      members: [ownerId]
    });
    setTeams(prev => [...prev, newTeam]);
  };

  return (
    // Your component JSX
  );
};

// In API calls
const fetchTeam = async (teamId: string): Promise<TeamFull> => {
  const response = await api.get(`/teams/${teamId}`);
  return createDefaultTeam(response.data);
};