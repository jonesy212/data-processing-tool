import { debounce } from "@/app/pages/searchs/Debounce";
import { MessageType } from "@/app/generators/MessaageType";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { CodingLanguageEnum, LanguageEnum } from "../communications/LanguageEnum";
import { DocumentTypeEnum } from "../documents/DocumentGenerator";
import { FileTypeEnum } from "../documents/FileType";
import FormatEnum from "../form/FormatEnum";
import AnimationTypeEnum from "../libraries/animations/AnimationLibrary";
import { SearchLogger } from "../logging/Logger";
import  { BookmarkStatus, CalendarStatus, DataStatus, DevelopmentPhaseEnum, DocumentSize, NotificationStatus, PriorityTypeEnum, PrivacySettingEnum, ProjectPhaseTypeEnum, StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus, TodoStatus } from "../models/data/StatusType";
import { ContentManagementPhaseEnum } from "../phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "../phases/FeedbackPhase";
import { TaskPhaseEnum } from "../phases/TaskProcess";
import { TenantManagementPhaseEnum } from "../phases/TenantManagementPhase";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { SecurityFeatureEnum } from "../security/SecurityFeatureEnum";
import { RootState } from "../state/redux/slices/RootSlice";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { userService } from "../users/ApiUser";
import { IdeaCreationPhaseEnum } from "../users/userJourney/IdeaCreationPhase";
import { Entity, fuzzyMatchEntities } from "./FuzzyMatch";
import { BaseData, Data } from "../models/data/Data";
import LoadingSpinner from "../models/tracker/LoadingSpinner";
import { searchDocuments } from "@/app/api/ApiDocument";
import SearchComponent from "@/app/pages/searchs/SearchComponent";
import useSearchOptions from "@/app/pages/searchs/useSearchOptions";
import { sanitizeInput } from "../security/SanitizationFunctions";
import { setLoading, clearError } from "../state/stores/UISlice";
import SearchResult, { SearchResultWithQuery } from "./SearchResult";
import useErrorHandling from "../hooks/useErrorHandling";
import useSearchPagination from "../hooks/commHooks/useSearchPagination";
import { selectEventLoading } from "../state/redux/slices/EventSlice";
import { DocumentData } from "../documents/DocumentBuilder";
import { SupportedData } from "../models/CommonData";
import { User } from "../users/User";
import { Progress } from "../models/tracker/ProgressBar";
import { Team } from "../models/teams/Team";
import { Project } from "../projects/Project";

interface SearchCriteria extends BaseData {
  startDate?: Date;
  endDate?: Date;
  status?: StatusType | null;
  priority?: string | PriorityTypeEnum | null;
  assignedUser?: string | null;
  notificationType?: NotificationTypeEnum | null;
  todoStatus?: TodoStatus | null;
  taskStatus?: TaskStatus | null;
  teamStatus?: TeamStatus | null;
  dataStatus?: DataStatus | null;
  calendarStatus?: CalendarStatus | null;
  notificationStatus?: NotificationStatus | null;
  bookmarkStatus?: BookmarkStatus | null;
  priorityType?: PriorityTypeEnum | null;
  projectPhase?: ProjectPhaseTypeEnum | null;
  developmentPhase?: DevelopmentPhaseEnum | null;
  subscriberType?: SubscriberTypeEnum | null;
  subscriptionType?: SubscriptionTypeEnum | null;
  analysisType?: AnalysisTypeEnum | null;
  documentType?: DocumentTypeEnum | null;
  fileType?: FileTypeEnum | null;
  tenantType?: TenantManagementPhaseEnum | null;
  ideaCreationPhaseType?: IdeaCreationPhaseEnum | null;
  securityFeatureType?: SecurityFeatureEnum | null;
  feedbackPhaseType?: FeedbackPhaseEnum | null;
  contentManagementType?: ContentManagementPhaseEnum | null;
  taskPhaseType?: TaskPhaseEnum | null;
  animationType?: AnimationTypeEnum | null;
  languageType?: LanguageEnum | null;
  codingLanguageType?: CodingLanguageEnum | null;
  formatType?: FormatEnum | null;
  privacySettingsType?: PrivacySettingEnum | null;
  messageType?: MessageType | null;
}




// Extending the DocumentData interface
interface SupportedSearchResult<T extends  BaseData<any>> extends Entity, DocumentData<T> {
  // Now you can access all properties from both Entity and DocumentData
}



// You can also make SupportedData extend SearchResult
type EnhancedSupportedData<T extends  BaseData<any>> = SupportedData<T> & SupportedSearchResult<T>;



// Example usage
const exampleData: EnhancedSupportedData = {
  id: '123',
  name: 'Sample Document',
  createdAt: new Date(),
  createdBy: 'user@example.com',
  updatedBy: 'admin@example.com',
  filePathOrUrl: 'http://example.com/document.pdf',
  // Include any other properties from SupportedData
  type: 'exampleType', // Example type
  additionalProperty: 'someValue' // Other custom properties
};


type SearchResultItem = Entity | SearchResultWithQuery<any>;

const SearchCriteriaComponent: React.FC<{
  onUpdateCriteria: (criteria: string) => void;
}> = ({ onUpdateCriteria }) => {
  const [criteria, setCriteria] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const dispatch = useDispatch();
  const entities = useSelector((state: RootState) => state.entityManager);
  const { searchOptions, handleFilterTasks, handleSortTasks } = useSearchOptions();
  const { currentPage, nextPage, previousPage, pageSize, changePageSize } = useSearchPagination();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { handleError } = useErrorHandling()
  const [error, setError] = useState<string | null>(null);

  const loading = useSelector(selectEventLoading);

  // Function to perform fuzzy search with debounce
  const { userId } = useParams()

  setEffect(() => {
    if (searchQuery || searchTerm) {
      performSearch(searchQuery || searchTerm);
    }
  }, [searchQuery, searchTerm, currentPage]);

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      const sanitizedQuery = sanitizeInput(query);
      const results = await searchDocuments(sanitizedQuery);
      setSearchResults(results);
      setLoading(false);
      SearchLogger.logSearchResults(query, results.length, String(userId));
      setError(null);
    } catch (error: any) {
      handleError("Failed to fetch search results. Please try again.");
      SearchLogger.logSearchError(query, error.message, String(userId));
      setLoading(false);
      setError("Failed to fetch search results. Please try again.");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    SearchLogger.logSearch(query, userId);
  };

  const handleCriteriaUpdate = (criteria: string) => {
    setSearchQuery(criteria);
  };


  const debouncedSearch = debounce(async (term: string) => {
    try {
      const matchedEntities = await fuzzyMatchEntities(
        term,
        Object.values(entities)
      );
      setSearchResults(matchedEntities);
      if (userId !== undefined) {
        // Log search results along with the user ID
        const fetchedUserId: string | undefined =
          await userService.fetchUserById(userId);
        if (fetchedUserId !== undefined) {
          // User ID is defined, proceed with logging
          SearchLogger.logSearchResults(
            term,
            matchedEntities.length,
            fetchedUserId
          );
        } else {
          // User ID is undefined, handle accordingly (e.g., provide a default value)
          SearchLogger.logSearchResults(
            term,
            matchedEntities.length,
            "Unknown"
          );
        }
      }
    } catch (error: any) {
      console.error("Error occurred while performing search:", error);
      // Log search error
      if (userId !== undefined) {
        SearchLogger.logSearchError(term, error.message, userId);
      }
    }
  }, 300);

  // Handle search term changes
  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    setSearchTerm(value);
    debouncedSearch(value);
    // Log search query
    if (userId !== undefined) {
      SearchLogger.logSearch(value, userId);
    }
  };

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCriteria(e.target.value);
    onUpdateCriteria(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCriteria(criteria);
  };

  // Dispatch action example (not used currently)
  const handleDispatchExample = () => {
    dispatch({ type: "EXAMPLE_ACTION" });
  };
  return (
    <div>
      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          id="searchInput"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <button onClick={() => handleSearch(searchTerm)}>Search</button>
      </div>

      {/* Search Criteria Form */}
      <h2>Search Criteria</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="criteria">Enter Search Criteria:</label>
        <input
          type="text"
          id="criteria"
          value={criteria}
          onChange={handleCriteriaChange}
          placeholder="Enter search criteria..."
          required
        />
        <button type="submit">Search</button>
      </form>

      {/* Additional Filters */}
      <div>
        <h3>Additional Filters:</h3>
        <select>
          <option value="">All Phases</option>
          <option value="ideation">Ideation</option>
          <option value="team-creation">Team Creation</option>
          <option value="product-brainstorming">Product Brainstorming</option>
          <option value="product-launch">Product Launch</option>
          <option value="data-analysis">Data Analysis</option>
        </select>
        <input type="text" placeholder="Filter by Team Member..." />
        <input type="text" placeholder="Filter by Tags or Categories..." />
      </div>

      {/* Loading and Error Handling */}
      <LoadingSpinner loading={loading} />
      {error && <div>Error: {error}</div>}

      {/* Search Results */}
      <div className="search-results">
      {searchResults.map((result, index) => {
          if ('query' in result) {
            // Handle SearchResultWithQuery rendering
            return (
              <div key={index}>
                <h3>{result.title}</h3>
                <p>Query: {result.query}</p>
                <p>Total Count: {result.totalCount}</p>
                {result.items.map((item, subIndex) => (
                  <SearchResult key={`${index}-${subIndex}`} result={item} />
                ))}
              </div>
            );
          } else {
            // Handle Entity rendering
            const entityResult = result as Entity & SearchResultWithQuery<any>;
            return <SearchResult key={index} result={entityResult} />;
          }
        })}
        <SearchComponent
          componentSpecificData={searchResults
            .filter((result) => result.source === "local")
            .map((result) => ({
              id: result.id !== undefined && result.id !== null ? Number(result.id) : 0, // Ensure id is a number
              title: result.name !== undefined && result.name  !== null ? result.name.toString() : "",  // Map 'name' to 'title'
              description: result.description !== undefined && result.description !== null ? result.description.toString(): "",
              source: result.source !== undefined && result.source !== null ? result.source.toString(): "",
            }))}
            documentData={


              searchResults
              .filter((result) => result.source === "global")
              .map((result) => ({
                createdAt: result.createdAt || new Date(), // Use the actual value or default to now
                createdBy: result.createdBy || "", // Default to an empty string if not available
                updatedBy: result.updatedBy || "", // Default to an empty string if not available
                filePathOrUrl: result.filePathOrUrl || "", // Default to an empty string if not available
                uploadedBy: '', 
                tagsOrCategories: '', 
                format: "", 
                uploadedByTeamId: 0, 
                uploadedByTeam: {
                  team: { 
                    id: "",
                     current: 0,
                     name: "",
                     color: null,
                     max: 0,
                     min: 0,
                     label: "",
                     percentage: 0,
                     value: 0,
                     description: "",
                     done: false
                   },
                  
                  _id: "",
                  id: "",
                  color: "",
                  teamName: "",
                   
                  projects: [],
                  creationDate: new Date(),
                  isActive: false,
                   
                  leader: {} as User,
                  progress: {} as Progress,
                  percentage: 0,
                  assignedProjects: [],
                   
                  reassignedProjects: [],
                  assignProject: (team: Team, project: Project, assignedDate: Date) => { },
                  reassignProject: (team: Team, project: Project, previousTeam: Team, reassignmentDate: Date) => { },
                  unassignProject: (team: Team, project: Project) => {},
                  updateProgress: (team: Team, project: Project) => {},
                  }, 
                
                selectedDocument: {} as DocumentData< BaseData<any>>,
                id: result.id,  // Assuming this can be a number or string
                _id: result.id.toString(), // Assuming you convert it to string
                // Map 'name' to 'title'
                title: result.name !== undefined && result.name !== null ? result.name.toString() : "",
                content: "", // Provide a default or fetch appropriate content
                documents: [], // Default to empty array or map documents if available
                permissions: undefined, // Or assign based on your logic
                topics: [], // Default to empty array or fetch topics if available
                highlights: [], // Default to empty array or fetch highlights if available
                keywords: [], // Default to empty array or fetch keywords if available
                load: undefined, // Provide implementation if needed
                file: undefined, // Assign if available
                files: [], // Default to empty array or map files if available
                folder: undefined, // Assign if available
                folders: [], // Default to empty array or map folders if available
                filePath: undefined, // Assign if available
                status: undefined, // Assign based on your logic
                type: undefined, // Assign based on your logic
                locked: false, // Default value
                category: undefined, // Assign based on your logic
                changes: false, // Default value
                timestamp: new Date(), // Default to now or fetch actual timestamp
                source: result.source,
                report: undefined, // Assign if available
                options: undefined, // Assign if available
                folderPath: "", // Provide a default or fetch appropriate folder path
                previousContent: undefined, // Assign if available
                currentContent: undefined, // Assign if available
                previousMetadata: undefined, // Assign if available
                currentMetadata: undefined, // Assign if available
                accessHistory: [], // Default to empty array or fetch access history if available
                documentPhase: undefined, // Assign if available
                version: undefined, // Assign if available
                versionData: undefined, // Assign if available
                visibility: undefined, // Assign based on your logic
                url: undefined, // Assign if available
                updatedDocument: undefined, // Assign if available
                documentSize: DocumentSize.A4, // Provide appropriate structure
                lastModifiedDate: undefined, // Assign if available
                lastModifiedBy: "", // Default value
                lastModifiedByTeamId: null, // Default value
                lastModifiedByTeam: undefined, // Assign if available
                name: result.name, // Keep name
                descriptionRenamed: null, // Default or assign if available
                createdByRenamed: "", // Default value
                createdDate: new Date(), // Default to now or fetch actual created date
                documentType: "", // Default value or assign as needed
                documentData: undefined, // Assign if available
                document: undefined, // Assign if available
                _rev: undefined, // Assign if available
                _attachments: undefined, // Assign if available
                _links: undefined, // Assign if available
                _etag: undefined, // Assign if available
                _local: false, // Default value
                _revs: [], // Default to empty array
                _source: undefined, // Assign if available
                _shards: undefined, // Assign if available
                _size: undefined, // Assign if available
                _version: undefined, // Assign if available
                _version_conflicts: 0, // Default value
                _seq_no: undefined, // Assign if available
                _primary_term: undefined, // Assign if available
                _routing: undefined, // Assign if available
                _parent: undefined, // Assign if available
                _parent_as_child: false, // Default value
                _slices: [], // Default to empty array
                _highlight: undefined, // Assign if available
                _highlight_inner_hits: undefined, // Assign if available
                _source_as_doc: false, // Default value
                _source_includes: [], // Default to empty array
                _routing_keys: [], // Default to empty array
                _routing_values: [], // Default to empty array
                _routing_values_as_array: [], // Default to empty array
                _routing_values_as_array_of_objects: [], // Default to empty array
                _routing_values_as_array_of_objects_with_key: [], // Default to empty array
                _routing_values_as_array_of_objects_with_key_and_value: [], // Default to empty array
                _routing_values_as_array_of_objects_with_key_and_value_and_value: [], // Default to empty array
              }
            ))
            label={}
            date={}
          }
              searchQuery={searchQuery || searchTerm}
              />
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={previousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <button onClick={nextPage}>Next</button>
        <span>Page: {currentPage}</span>
      </div>

      {/* Dispatch Example Action */}
      <button onClick={handleDispatchExample}>Dispatch Example Action</button>

      {/* Summary of Search */}
      <div>
        <p>Search Term: {searchTerm}</p>
        <p>Search Results: {searchResults.length}</p>
      </div>
    </div>
  );
};


export default SearchCriteriaComponent;
export type { SearchCriteria };
  
  function setEffect(arg0: () => void, arg1: (string | number)[]) {
    // TODO: Implement setEffect function
  }

