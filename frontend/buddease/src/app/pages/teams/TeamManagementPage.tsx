// TeamManagementPage.tsx

import React from 'react';
import { useTeamContext } from '@/app/components/context/TeamContext';
const TeamManagementPage: React.FC = () => {
    const { teamData, createTeam, deleteTeam } = useTeamContext(); // Access team-related data and functions from the context

    // Function to handle team creation
    const handleCreateTeam = () => {
        // Implement logic for creating a team
        const newTeamData = {
            name: 'New Team', members: [], // Add more properties as needed };
            createTeam(newTeamData);
        };

        // Function to handle team deletion
        const handleDeleteTeam = (teamId: string) => {
            // Implement logic for deleting a team
            deleteTeam(teamId);
        };

        return (
            <div>
                <h1>Team Management</h1>
                {/* Render team data and provide UI for creating and deleting teams */}
                <button onClick={handleCreateTeam}>Create Team</button>
                <ul>
                    {teamData.map(team => (
                        <li key={team.id}>
                            <span>{team.name}</span>
                            <button onClick={() => handleDeleteTeam(team.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };
}

export default TeamManagementPage;
