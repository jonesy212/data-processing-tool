import React, { useState } from "react";
import TeamProgressBar from "@/app/components/projects/projectManagement/TeamProgressBar";
import { Persona } from "./Persona";
import PersonaTypeEnum from "./PersonaBuilder";
import Team from "@/app/components/models/teams/Team";
import { useSearch } from "../searchs/SearchContext";
import ProgressBar, {
  Progress,
} from "@/app/components/models/tracker/ProgresBar";
import SearchResultItem from "@/app/components/models/data/SearchResultItem";
import CommunityProjectsPage from "../community/CommunityProjectsPage";
import { DetailsItem } from "@/app/components/state/stores/DetailsListStore";
import { Data } from "@/app/components/models/data/Data";
import TeamData from "@/app/components/models/teams/TeamData";

interface ProjectManagerPersonaProps {
  teams: Team[];
}

const ProjectManagerPersona: React.FC<ProjectManagerPersonaProps> = ({
  teams,
}) => {
  const [searchResults, setSearchResults] = useState<DetailsItem<Data>[]>([]); // Updated state type
  const { searchQuery } = useSearch(); // Using the useSearch hook to access search query

  // Method to filter teams based on search query

   const filterTeams = (teams: Team[]): DetailsItem<Data>[] => {
    return teams
      .filter((team) =>
        team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((team) => ({
        data: team, // Assuming DetailsItem<Data> requires a 'data' property of type 'Data'
      }));
  };


  // Update search results when search query changes
  React.useEffect(() => {
    setSearchResults(filterTeams(teams));
  }, [searchQuery, teams]);

  // Calculate progress for a specific team
  const calculateProgress = (team: Team): Progress | null => {
    // Calculate progress logic goes here
    // Check if team.progress is null
    if (team.progress === null) {
      // Handle the case where team.progress is null, for example:
      return {
        label: `${team.teamName} Progress`,
        value: 0, // Provide a default value or handle it according to your logic
      };
    } else {
      // If team.progress is not null, ensure that value is of type number
      const progressValue =
        typeof team.progress.value === "number" ? team.progress.value : 0;

      return {
        label: `${team.teamName} Progress`,
        value: progressValue,
      };
    }
  };

  return (
    <div>
    <h2>Track Progress</h2>
    {/* Render search results if available, otherwise render all teams */}
    {searchResults.length > 0
      ? searchResults.map((team, index) => (
          <div key={index}>
            <TeamProgressBar team={team.data} /> {/* Updated usage */}
            <ProgressBar progress={calculateProgress(team.data)} /> {/* Updated usage */}
          </div>
        ))
      : teams.map((team, index) => (
          <div key={index}>
            <TeamProgressBar team={team} />
            <ProgressBar progress={calculateProgress(team)} />
          </div>
        ))}
    {/* Render search results list */}
    <SearchResultItem items={searchResults} />
    {/* Render CommunityProjectsPage component */}
    <CommunityProjectsPage teams={teams} />
  </div>
  );
};

export default ProjectManagerPersona;
