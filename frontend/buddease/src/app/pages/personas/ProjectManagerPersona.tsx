import { Data } from "@/app/components/models/data/Data";
import SearchResultItem from "@/app/components/models/data/SearchResultItem";
import { Team } from "@/app/components/models/teams/Team";
import ProgressBar, {
  Progress,
  ProgressPhase,
} from "@/app/components/models/tracker/ProgressBar";
import TeamProgressBar from "@/app/components/projects/projectManagement/TeamProgressBar";
import { DetailsItem } from "@/app/components/state/stores/DetailsListStore";
import React, { useState } from "react";
import CommunityProjectsPage from "../community/CommunityProjectsPage";
import { useSearch } from "../searchs/SearchContext";
import {
  ProjectProgressProps,
  projectProgressData,
} from "@/app/components/projects/projectManagement/ProjectProgress";
import SearchResult from "@/app/components/routing/SearchResult";

interface ProjectManagerPersonaProps {
  teams: Team[];
}

const ProjectManagerPersona: React.FC<ProjectManagerPersonaProps> = ({
  teams,
}) => {
  const [searchResults, setSearchResults] = useState<DetailsItem<Team>[]>([]); // Updated state type
  const { searchQuery } = useSearch(); // Using the useSearch hook to access search query

  // Method to filter teams based on search query

  const filterTeams = (teams: Team[]): DetailsItem<Team>[] => {
    return teams
      .filter((team) =>
        team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((team) => ({
        id: team.id,
        data: team,
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
        id: team.id,
        label: `${team.teamName} Progress`,
        value: 0, // Provide a default value or handle it according to your logic
      };
    } else {
      // If team.progress is not null, ensure that value is of type number
      const progressValue =
        typeof team.progress.value === "number" ? team.progress.value : 0;

      return {
        id: team.id,
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
              {team.data && <TeamProgressBar team={team.data} />}{" "}
              {/* Updated usage */}
              <ProgressBar
                progress={projectProgressData}
                phase={{} as ProgressPhase}
                duration={0}
                animationID={""}
                uniqueID={""}
              />{" "}
              {/* Updated usage */}
            </div>
          ))
        : teams.map((team, index) => (
            <div key={index}>
              <TeamProgressBar team={team} />
              <ProgressBar
                progress={calculateProgress(team)}
                phase={{} as ProgressPhase}
                duration={0}
                animationID={""}
                uniqueID={""}
              />
            </div>
          ))}
      {/* Render search results list */}
      {/* Render SearchResult component */}
      <SearchResult
        result={searchResults.map((item) => ({
          id: item.id,
          title: item.data?.teamName || "",
          description: `Team ID: ${item.id}`,
          source: "",
          content: "",
          topics: [],
          highlights: [],
          keywords: [],
          load: () => {},
          folders: [],
          version: { version: "", versionCount: 0 },
        }))}
      />

      {/* Render CommunityProjectsPage component */}
      <CommunityProjectsPage teams={teams} />
    </div>
  );
};

export default ProjectManagerPersona;
