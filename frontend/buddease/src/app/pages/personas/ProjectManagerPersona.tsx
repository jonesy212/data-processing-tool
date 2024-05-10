import { Data } from "@/app/components/models/data/Data";
import SearchResultItem from "@/app/components/models/data/SearchResultItem";
import { Team, team } from "@/app/components/models/teams/Team";
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
import Version from "@/app/components/versions/Version";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";

interface ProjectManagerPersonaProps {
  teams: Team[];
}

const ProjectManagerPersona: React.FC<ProjectManagerPersonaProps> = ({
  teams,
}) => {
  const [searchResults, setSearchResults] = useState<DetailsItem<Team>[]>([]);
  const { searchQuery } = useSearch();
  const versionInfo = {
    id: 0,
    versionNumber: "",
    appVersion: "",
    content: "",
    data: [],
    name: "",
    url: "",
  };
  const version = new Version(versionInfo);
  const structure = version.getStructure ? version.getStructure() : {};

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

  React.useEffect(() => {
    setSearchResults(filterTeams(teams));
  }, [searchQuery, teams]);

  const calculateProgress = (team: Team): Progress | null => {
    if (team.progress === null) {
      return {
        id: team.id,
        label: `${team.teamName} Progress`,
        value: 0,
        current: 0,
        max: 100,
      };
    } else {
      const progressValue =
        typeof team.progress.value === "number" ? team.progress.value : 0;

      return {
        id: team.id,
        label: `${team.teamName} Progress`,
        value: progressValue,
        current: team.progress.current || 0,
        max: team.progress.max || 100,
      };
    }
  };

  return (
    <div>
      <h2>Track Progress</h2>
      {searchResults.length > 0
        ? searchResults.map((item, index) => (
            <div key={index}>
              {item.data && <TeamProgressBar team={item.data as Team} />}
              <ProgressBar
                progress={calculateProgress(
                  Array.isArray(item.data) ? item.data[0] : (item.data as Team)
                )}
                phase={{} as ProgressPhase}
                duration={0}
                animationID={""}
                uniqueID={""}
              />
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
      <SearchResult
        result={{
          id: 1,
          title: "Example Result",
          description: "This is an example result",
          source: "https://example.com",
          content: "Example content",
          topics: ["example", "topic"],
          highlights: [],
          keywords: ["example", "keyword"],
          load: (content: any) => console.log(content),
          folders: [],
          query: searchQuery,
           items: searchResults,
           totalCount: searchResults.length,
           options: {
             limit: 10,
             page: 1
           },
           folderPath: null,
           previousMetadata: null,
           currentMetadata: null,
           accessHistory: [],
           lastModifiedDate: new Date(),
           searchHistory: [],
           results: searchResults,  
        }}
      />

      <CommunityProjectsPage
        community={{
          teams,
          id: "",
          name: "",
          description: "",
          projects: [],
          teamMembers: [],
        }}
      />
    </div>
  );
};

export default ProjectManagerPersona;
