import { LanguageEnum } from "@/app/components/communications/LanguageEnum";
import { DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import { BorderStyle, DocumentSize } from "@/app/components/models/data/StatusType";
import { Team } from "@/app/components/models/teams/Team";
import ProgressBar, {
  Progress,
  ProgressPhase,
} from "@/app/components/models/tracker/ProgressBar";
import TeamProgressBar from "@/app/components/projects/projectManagement/TeamProgressBar";
import SearchResult, { SearchResultWithQuery } from "@/app/components/routing/SearchResult";
import { AlignmentOptions } from "@/app/components/state/redux/slices/toolbarSlice";
import { Settings } from "@/app/components/state/stores/SettingsStore";
import Version from "@/app/components/versions/Version";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import React, { useState } from "react";
import CommunityProjectsPage from "../community/CommunityProjectsPage";
import { useSearch } from "../searchs/SearchContext";
import SearchResultComponent from "@/app/components/routing/SearchResult";
import { ContentState } from "draft-js";



interface ProjectManagerPersonaProps {
  teams: TeamDocument[];
}

type TeamDocument = Document & Team

// Adjust the SearchResultProps interface to accept Team instead of Document

const ProjectManagerPersona: React.FC<ProjectManagerPersonaProps> = ({
  teams,
}) => {
  const [searchResults, setSearchResults] = useState<SearchResultWithQuery<TeamDocument>[]>([]);
  const { searchQuery } = useSearch();
  const versionInfo = {
    id: 0,
    versionNumber: "",
    appVersion: "",
    description: "",
    content: "",
    checksum: "",
    data: [],
    name: "",
    url: "",
    buildNumber: 0,
    metadata: "",
    versions: [],
    versionHistory: {
      versions: [],
    },
    userId: "",
    documentId: "",
    parentId: "",
    parentType: "",
    parentVersion: "",
    parentTitle: "",
    parentContent: "",
    parentName: "",
    parentUrl: "",
    parentChecksum: "",
    parentMetadata: "",
    parentAppVersion: "",
    parentVersionNumber: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    draft: false,
    isLatest: false,
    isPublished: false,
    publishedAt: new Date(),
    source: "",
    status: "",
    workspaceName: "",
    workspaceType: "",
    workspaceUrl: "",
    workspaceId: "",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
  };

  const version = new Version(versionInfo);
  const structure = version.getStructure ? version.getStructure() : {};

  const filterTeams = (teams: TeamDocument[]): SearchResultWithQuery<TeamDocument>[] => {
    return teams
      .filter((team) => team.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((filteredTeam) => ({
        items: [filteredTeam],
        totalCount: 1,
        id: filteredTeam.id,
        title: filteredTeam.teamName,
        description: filteredTeam.description,
        source: filteredTeam.source,
        content: filteredTeam.content,
        topics: filteredTeam.topics,
        highlights: filteredTeam.highlights,
        keywords: filteredTeam.keywords,
        folders: filteredTeam.folders,
        options: filteredTeam.options,
        folderPath: filteredTeam.folderPath,
        previousMetadata: filteredTeam.previousMetadata,
        currentMetadata: filteredTeam.currentMetadata,
        accessHistory: filteredTeam.accessHistory,
        lastModifiedDate: filteredTeam.lastModifiedDate,
        searchHistory: filteredTeam.searchHistory,
        version: filteredTeam.version,
        load: filteredTeam.load,
        query: searchQuery,
        results: [],
        repoName: filteredTeam.repoName,
        repoURL: filteredTeam.repoURL,
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
        percentage: 0,
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
        percentage: (progressValue / (team.progress.max || 100)) * 100,
      };
    }
  };

  return (
    <div>
      <h2>Track Progress</h2>
      {searchResults.length > 0
        ? searchResults.map((team, index) => (
            <div key={index}>
              <TeamProgressBar team={team} />
              <ProgressBar
              progress={calculateProgress(team)}
              phase={{
                type: 'team project',
                duration: 0,
                value: 0,
              }}
              duration={0}
              animationID={""}
              uniqueID={""}
              phaseType={ProgressPhase.Ideation} />
            </div>
          ))
        : teams.map((team, index) => (
            <div key={index}>
              <TeamProgressBar team={team} />
              <ProgressBar
              progress={calculateProgress(team)}
              phase={{ type: "", duration: 0, value: 0 }}
              duration={0}
              animationID={""}
              uniqueID={""} phaseType={ProgressPhase.Ideation}              />
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
            page: 1,
            uniqueIdentifier: "",
            documentType: DocumentTypeEnum.Default,
            userIdea: "",
            documentSize: DocumentSize.A4,
            additionalOptions: undefined,
            documentPhase: "",
            version: {
              _structure: structure,
              name: "",
              url: "",
              versionNumber: "",
              buildNumber: '0',
              versions: {
                data: undefined,
                backend: undefined,
                frontend: undefined,
              },
              getVersionNumber: () => "",
              appVersion: "",
              description: "",
              createdAt: undefined,
              updatedAt: undefined,
              id: 0,
              content: "",
              userId: "",
              documentId: "",
              parentId: "",
              parentType: "",
              parentVersion: "",
              parentTitle: "",
              parentContent: "",
              parentName: "",
              parentUrl: "",
              parentChecksum: "",
              parentMetadata: undefined,
              parentAppVersion: "",
              parentVersionNumber: "",
              checksum: "",
              isLatest: false,
              isPublished: false,
              publishedAt: null,
              source: "",
              status: "",
              workspaceId: "",
              workspaceName: "",
              workspaceType: "",
              workspaceUrl: "",
              workspaceViewers: [],
              workspaceAdmins: [],
              workspaceMembers: [],
              frontendStructure: undefined,
              backendStructure: undefined,
              data: [],
              metadata: {
                author: "",
                timestamp: undefined
              },
              draft: false,
              getVersion: async function (): Promise<string | null> {
                throw new Error("Function not implemented.");
              },
              versionHistory: {
                versions: []
              },
              setFrontendAndBackendStructure: function (): Promise<void> {
                throw new Error("Function not implemented.");
              },
              getStructure: function (): Record<string, AppStructureItem[]> {
                throw new Error("Function not implemented.");
              }
            },
            isDynamic: undefined,
            size: DocumentSize.A4,
            animations: {
              type: "fade",
              duration: 10
            },
            layout: undefined,
            panels: undefined,
            pageNumbers: false,
            footer: "",
            watermark: {
              enabled: false,
              text: "",
              color: "",
              opacity: 0,
              size: "",
              x: 0,
              y: 0,
              rotation: 0,
              borderStyle: "",
              fontSize: 0
            },
            headerFooterOptions: {
              enabled: true,
              headerContent: undefined,
              footerContent: undefined,
              showHeader: false,
              showFooter: false,
              dateFormat: undefined,
              differentFirstPage: false,
              differentOddEven: false,
              headerOptions: {
                height: {
                  type: "",
                  value: 0
                },
                fontSize: 0,
                fontFamily: "",
                fontColor: "",
                alignment: "",
                font: "",
                bold: false,
                italic: false,
                underline: false,
                strikeThrough: false,
                margin: {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0
                }
              },
              footerOptions: {
                alignment: "",
                font: "",
                fontSize: 0,
                fontFamily: "",
                fontColor: "",
                bold: false,
                italic: false,
                underline: false,
                strikeThrough: false,
                height: {
                  type: "",
                  value: 0
                },
                margin: {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0
                }
              }
            },
            zoom: 0,
            showRuler: false,
            showDocumentOutline: false,
            showComments: false,
            showRevisions: false,
            spellCheck: false,
            grammarCheck: false,
            visibility: undefined,
            fontSize: 0,
            font: "",
            textColor: "",
            backgroundColor: "",
            fontFamily: "",
            lineSpacing: 0,
            alignment: AlignmentOptions.LEFT,
            indentSize: 0,
            bulletList: false,
            numberedList: false,
            headingLevel: 0,
            toc: false,
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            subscript: false,
            superscript: false,
            hyperlink: "",
            textStyles: {},
            image: "",
            links: false,
            embeddedContent: false,
            bookmarks: false,
            crossReferences: false,
            footnotes: false,
            endnotes: false,
            comments: false,
            revisions: {
              enabled: false,
              author: "",
              dataFormat: ""
            },
            embeddedMedia: false,
            embeddedCode: false,
            styles: {},
            tableCells: {
              enabled: false,
              padding: 0,
              fontSize: 0,
              alignment: "left",
              borders: {
                top: BorderStyle.NONE,
                bottom: BorderStyle.NONE,
                left: BorderStyle.NONE,
                right: BorderStyle.NONE
              }
            },
            table: false,
            tableRows: 0,
            tableColumns: 0,
            codeBlock: false,
            tableStyles: {},
            blockquote: false,
            codeInline: false,
            quote: "",
            todoList: false,
            orderedTodoList: false,
            unorderedTodoList: false,
            colorCoding: {} as Record<string, string>,
            highlight: false,
            highlightColor: "",
            customSettings: {},
            documents: [],
            includeType: "none",
            footnote: false,
            defaultZoomLevel: 0,
            customProperties: undefined,
            value: undefined,
            includeTitle: false,
            includeContent: false,
            includeStatus: false,
            includeAdditionalInfo: false,
            userSettings: {
              userId: 0,
              userSettings: new NodeJS.Timeout,
              communicationMode: "",
              enableRealTimeUpdates: false,
              defaultFileType: "",
              allowedFileTypes: [],
              enableGroupManagement: false,
              enableTeamManagement: false,
              idleTimeout: {
                isActive: false,
                intervalId: undefined,
                animateIn: function (selector: string): void {
                  const element = document.querySelector(selector);
                  if (element) {
                    element.classList.add('animate-in');

                  } else {
                    console.error('Element not found');
                  }

                },
                idleTimeoutId: null, // Initialize with null or NodeJS.Timeout | null
                startIdleTimeout: function (timeoutDuration: number): void {
                  this.isActive = true;
                  this.intervalId = setInterval(() => {
                    // Perform some action on timeout
                  }, timeoutDuration) as any;
                },
                toggleActivation: async function (): Promise<boolean> {
                  this.isActive = !this.isActive;
                  if (this.isActive) {
                    this.startAnimation();
                  } else {
                    this.stopAnimation();
                  }
                  return this.isActive;
                },
                startAnimation: function (): void {
                },
                stopAnimation: function (): void {
                  this.isActive = false;
                  clearInterval(this.intervalId);
                },
                resetIdleTimeout: async () => { }
              },
              startIdleTimeout: function (timeoutDuration: number, onTimeout: () => void): void {
                throw new Error("Function not implemented.");
              },
              idleTimeoutDuration: 0,
              activePhase: "",
              realTimeChatEnabled: false,
              todoManagementEnabled: false,
              notificationEmailEnabled: false,
              analyticsEnabled: false,
              twoFactorAuthenticationEnabled: false,
              projectManagementEnabled: false,
              documentationSystemEnabled: false,
              versionControlEnabled: false,
              userProfilesEnabled: false,
              accessControlEnabled: false,
              taskManagementEnabled: false,
              loggingAndNotificationsEnabled: false,
              securityFeaturesEnabled: false,
              theme: "",
              language: LanguageEnum.English,
              fontSize: 0,
              darkMode: false,
              enableEmojis: false,
              enableGIFs: false,
              emailNotifications: false,
              pushNotifications: false,
              notificationSound: "",
              timeZone: "",
              dateFormat: "",
              timeFormat: "",
              defaultProjectView: "",
              taskSortOrder: "",
              showCompletedTasks: false,
              projectColorScheme: "",
              showTeamCalendar: false,
              teamViewSettings: [],
              defaultTeamDashboard: "",
              passwordExpirationDays: 0,
              privacySettings: [],
              thirdPartyApiKeys: undefined,
              externalCalendarSync: false,
              dataExportPreferences: [],
              dashboardWidgets: [],
              customTaskLabels: [],
              customProjectCategories: [],
              customTags: [],
              formHandlingEnabled: false,
              paginationEnabled: false,
              modalManagementEnabled: false,
              sortingEnabled: false,
              notificationSoundEnabled: false,
              localStorageEnabled: false,
              clipboardInteractionEnabled: false,
              deviceDetectionEnabled: false,
              loadingSpinnerEnabled: false,
              errorHandlingEnabled: false,
              toastNotificationsEnabled: false,
              datePickerEnabled: false,
              themeSwitchingEnabled: false,
              imageUploadingEnabled: false,
              passwordStrengthEnabled: false,
              browserHistoryEnabled: false,
              geolocationEnabled: false,
              webSocketsEnabled: false,
              dragAndDropEnabled: false,
              idleTimeoutEnabled: false,
              enableAudioChat: false,
              enableVideoChat: false,
              enableFileSharing: false,
              enableBlockchainCommunication: false,
              enableDecentralizedStorage: false,
              selectDatabaseVersion: "",
              selectAppVersion: "",
              enableDatabaseEncryption: false,
              id: "",
              filter: function (key: "communicationMode" | "defaultFileType" | keyof Settings): void {
                throw new Error("Function not implemented.");
              },
              appName: ""
            },
            dataVersions: {
              backend: new Promise<string>(() => ""),
              frontend: new Promise<string>(() => ""),
            },
            metadata: undefined,
            lastModifiedBy: "",
            levels: {
              enabled: false,
              startLevel: 0,
              endLevel: undefined,
              format: "",
              separator: "",
              style: {
                main: "",
                styles: []
              }
            },
            language: LanguageEnum.English,
            versionData: undefined,
            previousMetadata: undefined,
            currentMetadata: undefined,
            currentContent: new ContentState,
            previousContent: undefined,
            lastModifiedDate: undefined,
            accessHistory: [],
            color: ""
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
      <SearchResultComponent
        result={{
          items: searchResults,
          totalCount: searchResults.length,
          id: 1,
          title: "Search Results",
          description: "Results from search",
          source: "https://example.com",
          content: "Search results content",
          topics: ["search", "results"],
          highlights: [],
          keywords: ["search", "keywords"],
          folders: [],
          options: {
            limit: 10,
            page: 1,
            uniqueIdentifier: "",
            documentType: "team",
            documentSize: DocumentSize.A4,
            lastModifiedBy: "",
            levels: {
              enabled: false,
              startLevel: 0,
              endLevel: undefined,
              format: "",
              separator: "",
              style: {
                main: "",
                styles: []
              }
            },
            additionalOptions: undefined,
            language: LanguageEnum.English,
            documentPhase: "",
            versionData: undefined,
            isDynamic: undefined,
            size: DocumentSize.A4,
            animations: undefined,
            layout: undefined,
            panels: undefined,
            pageNumbers: false,
            footer: "",
            watermark: {
              enabled: false,
              text: "",
              color: "",
              opacity: 0,
              fontSize: 0,
              size: "",
              x: 0,
              y: 0,
              rotation: 0,
              borderStyle: ""
            },
            headerFooterOptions: {
              enabled: false,
              headerContent: undefined,
              footerContent: undefined,
              showHeader: false,
              showFooter: false,
              dateFormat: undefined,
              differentFirstPage: false,
              differentOddEven: false,
              headerOptions: undefined,
              footerOptions: undefined
            },
            zoom: 0,
            showRuler: false,
            showDocumentOutline: false,
            showComments: false,
            showRevisions: false,
            spellCheck: false,
            grammarCheck: false,
            visibility: undefined,
            fontSize: 0,
            font: "",
            textColor: "",
            backgroundColor: "",
            fontFamily: "",
            lineSpacing: 0,
            alignment: AlignmentOptions.LEFT,
            indentSize: 0,
            bulletList: false,
            numberedList: false,
            headingLevel: 0,
            toc: false,
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            subscript: false,
            superscript: false,
            hyperlink: "",
            textStyles: {},
            image: "",
            links: false,
            embeddedContent: false,
            bookmarks: false,
            crossReferences: false,
            footnotes: false,
            endnotes: false,
            comments: false,
            revisions: undefined,
            embeddedMedia: false,
            embeddedCode: false,
            styles: {},
            previousMetadata: undefined,
            currentMetadata: undefined,
            currentContent: new ContentState,
            previousContent: undefined,
            lastModifiedDate: undefined,
            accessHistory: [],
            tableCells: {
              enabled: false,
              padding: 0,
              fontSize: 0,
              alignment: "left",
              borders: undefined
            },
            table: false,
            tableRows: 0,
            tableColumns: 0,
            codeBlock: false,
            blockquote: false,
            codeInline: false,
            quote: "",
            todoList: false,
            orderedTodoList: false,
            unorderedTodoList: false,
            color: "",
            colorCoding: undefined,
            highlight: false,
            highlightColor: "",
            customSettings: undefined,
            documents: [],
            includeType: "none",
            footnote: false,
            defaultZoomLevel: 0,
            customProperties: undefined,
            value: undefined,
            includeTitle: false,
            includeContent: false,
            includeStatus: false,
            includeAdditionalInfo: false,
            metadata: undefined,
            userSettings: undefined,
            dataVersions: undefined
          },
          folderPath: null,
          previousMetadata: null,
          currentMetadata: null,
          accessHistory: [],
          lastModifiedDate: new Date(),
          searchHistory: [],
          results: searchResults,
          query: searchQuery,
        }}
      />
      
    </div>
  );
};

export default ProjectManagerPersona;
