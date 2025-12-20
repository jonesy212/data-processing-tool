// src/app/pages/searches/SearchCriteria.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import debounce from 'lodash/debounce';

// Import necessary components and utilities
import { SearchComponent } from '@/app/pages/searches/SearchComponent';
import { SearchResult } from "@/app/components/routing/SearchResult";
import LoadingSpinner from '@/app/components/models/tracker/LoadingSpinner';
import { useSearchOptions } from '@/app/pages/searches/useSearchOptions';
import { useSearchPagination } from '@/app/hooks/commHooks/useSearchPagination';
import { useErrorHandling } from '@/app/hooks/useErrorHandling';
import { SearchLogger } from '@/app/logging/Logger';
import { sanitizeInput } from '@/app/models/cypto/SanitizationFunctions';
import { searchDocuments } from "@/app/api/ApiDocument"
import { fuzzyMatchEntities } from '@/app/routing/FuzzyMatch'
import { userService } from '@/app/api/ApiUser';
import { SupportedData } from '@/app/models/CommonData';

// Import types
import { Entity } from '@/app/config/BaseConfig';
import { SearchResultWithQuery } from "@/app/components/routing/SearchResult";
import { RootState } from '@/app/state/redux/slices/RootSlice'
import { selectEventLoading } from '@/app/state/redux/slices/EventSlice';
import { DocumentData } from "@/app/documents/editing/DocumentBuilder";
import { BaseData } from '@/app/models/data/Data';
import { User } from "@/app/users/User";
import { Team } from '@/app/components/teams/Team';
import { Project } from "@/app/models/projects/Project";
import { Progress } from "@/app/models/tracker/ProgressBar";
import { DocumentSize, StatusType } from '@/app/models/data/StatusType'
import {   
  ActivityActionEnum,
  ActivityTypeEnum, BookmarkStatus,
  BorderStyle,
  CalendarStatus, CalendarViewType, ChatType,
  CollaborationOptionType,
  ComponentStatus,
  DataStatus, DocumentPhaseEnum, DocumentSize,
  IncludeType,
  Layout, NotificationPosition, NotificationStatus,
  Orientation,
  OutcomeType,
  PrivacySettingEnum, ProductStatus, ProjectStateEnum, SortingType,
  StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus,
  TodoStatus, MeetingStatus, PriorityTypeEnum, DevelopmentPhaseEnum,
  PhaseDocumentEnum } from '@/app/models/data/StatusType'
import {LanguageEnum, CodingLanguageEnum} from '@/app/communications/LanguageEnum'
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import { AnalysisTypeEnum } from '@/app/typings/AnalysisType'
import { DocumentTypeEnum } from '@/app/typings/documentTypes'
import { FileTypeEnum } from '@/app/documents/FileType'
import { TenantManagementPhaseEnum } from '@/app/components/phases/TenantManagementPhase'
import { IdeaCreationPhaseEnum } from '@/app/users/userJourney/IdeaCreationPhase'
import { SecurityFeatureEnum } from '@/app/server/security/SecurityFeatureEnum'
import { FeedbackPhaseEnum } from '@/app/components/phases/FeedbackPhase'
import { ContentManagementPhaseEnum } from '@/app/components/phases/ContentManagementPhase'
import { TaskPhaseEnum } from '@/app/components/phases/TaskProcess'
import { AnimationTypeEnum } from '@/app/libraries/animations/AnimationLibrary'
import { FormatEnum } from '@/app/components/form/FormatEnum'
import { MessageType } from '@/app/generators/MessaageType'

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
type EnhancedSupportedData<T extends  BaseData<any>> = SupportedData<T, K, Meta> & SupportedSearchResult<T>;



// Example usage
const exampleData: EnhancedSupportedData<T> = {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const dispatch = useDispatch();
  const entities = useSelector((state: RootState) => state.entityManager);
  const { searchOptions, handleFilterTasks, handleSortTasks } = useSearchOptions();
  const { currentPage, nextPage, previousPage, pageSize, changePageSize } = useSearchPagination();
  const { handleError } = useErrorHandling();
  
  const isLoading = useSelector(selectEventLoading);
  const { userId } = useParams<{ userId: string }>();

  // Function to perform search
  const performSearch = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const sanitizedQuery = sanitizeInput(query);
      const results = await searchDocuments(sanitizedQuery);
      setSearchResults(results);
      SearchLogger.logSearchResults(query, results.length, userId || "Unknown");
      setError(null);
    } catch (error: any) {
      handleError("Failed to fetch search results. Please try again.");
      SearchLogger.logSearchError(query, error.message, userId || "Unknown");
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId, handleError]);

  // Effect for search
  useEffect(() => {
    if (searchQuery || searchTerm) {
      performSearch(searchQuery || searchTerm);
    }
  }, [searchQuery, searchTerm, currentPage, performSearch]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    SearchLogger.logSearch(query, userId || "Unknown");
  };

  const handleCriteriaUpdate = (criteria: string) => {
    setSearchQuery(criteria);
  };

  // Debounced search for fuzzy matching
  const debouncedSearch = debounce(async (term: string) => {
    try {
      const matchedEntities = await fuzzyMatchEntities(
        term,
        Object.values(entities)
      );
      setSearchResults(matchedEntities);
      
      if (userId) {
        const fetchedUserId: string | undefined = await userService.fetchUserById(userId);
        SearchLogger.logSearchResults(
          term,
          matchedEntities.length,
          fetchedUserId || "Unknown"
        );
      }
    } catch (error: any) {
      console.error("Error occurred while performing search:", error);
      if (userId) {
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
    
    if (userId) {
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

  // Filter results for local and global sources
  const localResults = searchResults.filter((result) => 
    'source' in result && result.source === "local"
  );
  
  const globalResults = searchResults.filter((result) => 
    'source' in result && result.source === "global"
  );

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
      <LoadingSpinner loading={loading || isLoading} />
      {error && <div className="error-message">Error: {error}</div>}

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
                  {result.items.map((item: any, subIndex: number) => (
                    <SearchResult key={`${index}-${subIndex}`} result={item} />
                  ))}
              </div>
            );
          } else {
            // Handle Entity rendering
            return <SearchResult key={index} result={result} />;
          }
        })}
        
        <SearchComponent
          label="Search Results"
          date={new Date()}
          componentSpecificData={localResults.map((result) => ({
            id: 'id' in result && result.id !== undefined && result.id !== null 
              ? Number(result.id) 
              : 0,
            title: 'name' in result && result.name !== undefined && result.name !== null 
              ? result.name.toString() 
              : "",
            description: 'description' in result && result.description !== undefined && result.description !== null 
              ? result.description.toString()
              : "",
            source: 'source' in result && result.source !== undefined && result.source !== null 
              ? result.source.toString()
              : "",
          }))}
          documentData={globalResults.map((result) => ({
            createdAt: 'createdAt' in result ? result.createdAt || new Date() : new Date(),
            createdBy: 'createdBy' in result ? result.createdBy || "" : "",
            updatedBy: 'updatedBy' in result ? result.updatedBy || "" : "",
            filePathOrUrl: 'filePathOrUrl' in result ? result.filePathOrUrl || "" : "",
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
              unassignProject: (team: Team, project: Project) => { },
              updateProgress: (team: Team, project: Project) => { },
            },
            selectedDocument: {} as DocumentData<BaseData<any>>,
            id: 'id' in result ? result.id : 0,
            _id: 'id' in result ? result.id.toString() : "0",
            title: 'name' in result && result.name !== undefined && result.name !== null 
              ? result.name.toString() 
              : "",
            content: "",
            documents: [],
            permissions: undefined,
            topics: [],
            highlights: [],
            keywords: [],
            load: undefined,
            file: undefined,
            files: [],
            folder: undefined,
            folders: [],
            filePath: undefined,
            status: undefined,
            type: undefined,
            locked: false,
            category: undefined,
            changes: false,
            timestamp: new Date(),
            source: 'source' in result ? result.source : undefined,
            report: undefined,
            options: undefined,
            folderPath: "",
            previousContent: undefined,
            currentContent: undefined,
            previousMetadata: undefined,
            currentMetadata: undefined,
            accessHistory: [],
            documentPhase: undefined,
            version: undefined,
            versionData: undefined,
            visibility: undefined,
            url: undefined,
            updatedDocument: undefined,
            documentSize: DocumentSize.A4,
            lastModifiedDate: undefined,
            lastModifiedBy: "",
            lastModifiedByTeamId: null,
            lastModifiedByTeam: undefined,
            name: 'name' in result ? result.name : undefined,
            descriptionRenamed: null,
            createdByRenamed: "",
            createdDate: new Date(),
            documentType: "",
            documentData: undefined,
            document: undefined,
            _rev: undefined,
            _attachments: undefined,
            _links: undefined,
            _etag: undefined,
            _local: false,
            _revs: [],
            _source: undefined,
            _shards: undefined,
            _size: undefined,
            _version: undefined,
            _version_conflicts: 0,
            _seq_no: undefined,
            _primary_term: undefined,
            _routing: undefined,
            _parent: undefined,
            _parent_as_child: false,
            _slices: [],
            _highlight: undefined,
            _highlight_inner_hits: undefined,
            _source_as_doc: false,
            _source_includes: [],
            _routing_keys: [],
            _routing_values: [],
            _routing_values_as_array: [],
            _routing_values_as_array_of_objects: [],
            _routing_values_as_array_of_objects_with_key: [],
            _routing_values_as_array_of_objects_with_key_and_value: [],
            _routing_values_as_array_of_objects_with_key_and_value_and_value: [],
          }))}
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

