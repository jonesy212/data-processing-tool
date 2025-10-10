import fs from "fs";
import path from "path";
import { ModifiedDate } from "@/app/documents/DocType";
import { DocumentData } from "@/app/documents/editing/DocumentBuilder";
import { buildDocument } from '@/app/documents/editing/DocumentBuilderComponent';
import {
    getDefaultDocumentOptions,
    getDocumentPhase,
    mapDocumentToProjectPhase
} from "@/app/documents/DocumentOptions";
import DocumentPermissions from "@/app/documents/DocumentPermissions";
import { Content } from '@/app/models/content/AddContent';
import { BaseData } from '@/app/models/data/Data';
import { CategoryProperties, dataVisualizationProperties } from '@/app/pages/personas/ScenarioBuilder';
import { allCategories, AllCategoryValues } from "@/app/models/data/DataStructureCategories";
import { DocumentSize } from "@/app/models/data/StatusType";
import { ProgressPhase } from '@/app/models/tracker/ProgressBar';
import { Phase } from '@/app/models/phases/Phase';
import { Label } from '@/app/branding/BrandingSettings';
import { generateValidationRulesCode } from "@/server/security/validationRulesCode";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { DocumentObject } from '@/app/state/redux/slices/DocumentSlice';
import { UserData } from '@/app/users/User';
import { createLatestVersion } from '@/app/versions/createLatestVersion';
import { Version } from "@/app/versions/Version";
import { VersionData } from "@/app/versions/VersionData";
import { createMetaState } from '@/config//metadata/MetadataHooks';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { useState } from "react";
import PersonaTypeEnum, { PersonaBuilder } from "@/pages/personas/PersonaBuilder";
import { CategoryProperties } from '@/pages/personas/ScenarioBuilder';
import { AppStructuredMetadata, AppUnifiedMetadata } from "@/app/utils/web3/dAppAdapter/AppEntity";

const area = fetchUserAreaDimensions().toString()
const currentMetadata: AppUnifiedMetadata = useMetadata('calendar-event-area')
const currentMeta: AppStructuredMetadata = useMeta(area)

// Helper functions (you need to implement these)
function mergeCategoryProperties(properties: Partial<CategoryProperties>): CategoryProperties {
  return { ...getDefaultCategoryProperties(), ...properties };
}

function convertToCategoryProperties(properties: CategoryProperties): CategoryProperties {
  return properties;
}

function generateUserInterfaceComponent(name: string, description: string, brand: any): string {
  return `// User Interface Component: ${name}`;
}

function generateDataVisualizationComponent(name: string, dataProps: any, chartType: string, brand: any): string {
  return `// Data Visualization Component: ${name}`;
}

function findExistingComponent(componentName: string, targetDirectory: string): string | null {
  const potentialPath = path.join(targetDirectory, componentName, `${componentName}.tsx`);
  return fs.existsSync(potentialPath) ? potentialPath : null;
}

function generateDefaultPromptingContent(componentName: string): string {
  return `Default prompting content for ${componentName}`;
}

function generateComponent(
  componentName: string,
  category?: AllCategoryValues,
  properties: Partial<CategoryProperties> = {},
  brand?: any,
  nestedCategory?: NestedCategoryKeys,
  targetDirectory: string = process.cwd(),
  promptingContent: string = ""
): string {
  // Check if component already exists
  const existingComponentPath = findExistingComponent(componentName, targetDirectory);
  if (existingComponentPath) {
    throw new Error(`Component '${componentName}' already exists at ${existingComponentPath}`);
  }

  // Generate prompting content if not provided
  if (!promptingContent) {
    promptingContent = generateDefaultPromptingContent(componentName);
  }

  // Merge the provided properties with the defaults
  const mergedProperties: CategoryProperties = mergeCategoryProperties(properties);
  
  // Use convertToCategoryProperties to initialize properties with defaults
  const fullProperties = convertToCategoryProperties(mergedProperties);

  let reactCode = '';

  // Category-based generation
  if (category && nestedCategory) {
    // Handle nested categories
    switch (nestedCategory) {
      case "UserInterface":
        reactCode = generateUserInterfaceComponent(componentName, fullProperties.componentDescription || '', brand);
        break;
      case "DataVisualization":
        reactCode = generateDataVisualizationComponent(componentName, fullProperties.dataProperties, fullProperties.chartType, brand);
        break;
      default:
        throw new Error("Unknown nested category");
    }
  } else if (category) {
    // Existing logic for handling top-level categories
    switch (category) {
      case "assignedNotes":
        reactCode = generateUserInterfaceComponent(componentName, fullProperties.description || '', brand);
        break;
      // Handle other top-level categories...
      default:
        throw new Error("Unknown category");
    }
  } else {
    // Default generation
    reactCode = `import React from 'react';

interface ${componentName}Props {
  // Add component props here
}

const ${componentName}: React.FC<${componentName}Props> = (props) => {
  // Component implementation
  return <div>${componentName} Component</div>;
};

export default ${componentName};`;
  }

  // Create component directory
  const componentDir = path.join(targetDirectory, componentName);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  // Write component file
  const componentFilePath = path.join(componentDir, `${componentName}.tsx`);
  fs.writeFileSync(componentFilePath, reactCode);

  console.log(`${componentName} component generated successfully in ${targetDirectory}.`);
  
  return reactCode;
}

// Define function to create user scenarios and map out user journey
async function createUserScenarios(props: any, type: PersonaTypeEnum, reactCode: string) {
    const [options, setOptions] = useState(getDefaultDocumentOptions());

    // Create instances of UserPersonaBuilder and DocumentBuilder
    const userPersonaBuilder = new PersonaBuilder();
    
    // Create and set phase data directly, not using PhaseManager instance directly
    const phases: Phase[] = [
      // Example phase objects
      {
        id: "201-1",
        name: "Phase 1",
        startDate: new Date(),
        endDate: new Date(),
        description: "default_phase description",
        label: {
          text: '',
          color: ''
        }, 
        date: new Date(), 
        createdBy: "User123",
        component: () => <div>Phase 1 Component</div>,
        subPhases: [],
        hooks: {
          canTransitionTo: () => true,
          handleTransitionTo: () => {},
          resetIdleTimeout: () => Promise.resolve(),
          isActive: false,
          progress: null,
          condition: defaultCondition,
        },
        duration: 1000,
        lessons: [],
        currentMetadata: {
          metadataEntries: {},
          childIds: [],
          relatedData: [],
          id: '',
          apiEndpoint: '',
          apiKey: undefined,
          timeout: 0,
          retryAttempts: 0,
          name: '',
          category: '',
          timestamp: undefined,
          createdBy: '',
          tags: [],
          metadata: undefined,
          initialState: undefined,
          meta: undefined,
          events: undefined
        }
      },
      // Add more phases as needed
    ];

    // Process phases as needed
    const userPersona = PersonaBuilder.buildPersona(
      PersonaTypeEnum.CasualUser,
      props
    );

    // Assuming you want to map user scenarios to phases
    const scenarios = userPersonaBuilder.buildScenarios(userPersona);
    const userJourney = userPersonaBuilder.mapUserJourney(type, scenarios);

    // Output or utilize the created user scenarios and mapped user journey
    console.log("User scenarios and user journey mapped successfully.");

    // Generate validation rules code
    const validationRules = generateValidationRulesCode(
      dataVisualizationProperties.Forms?.validationRules
    );
    
    // Generate component code
    generateComponent(
      "ValidationRules",
      "Forms",
      {
        formFields: dataVisualizationProperties.Forms?.validationRules,
      },
      validationRules
    );
    
    // Save component code to file
    fs.writeFileSync(componentFilePath, reactCode);
    

    const content: Content<UserData, UserData, StructuredMetadata<UserData, UserData>> = {
      // Initialize with appropriate values for UserData and StructuredMetadata
      metadata: {/* initialize StructuredMetadata properties */},
      userData: {/* initialize UserData properties */},
    };    
    // Example usage of buildDocument function
    const documentObject: DocumentObject<UserData, K<UserData>, StructuredMetadata<UserData, K<UserData>>> = {
      createdBy: undefined,
      alinkColor: '',
      supportedLanguages: [],
      bgColor: '',
      documentURI: '',
      phaseType: ProgressPhase.Ideation,
      DocumentData: {},
      currentScript: null,
      defaultView: undefined,
      doctype: null,
      ownerDocument: null,
      scrollingElement: null,
      timeline: undefined,
      _rev: undefined,
      id: '',
      title: '',
      content: content,
      createdAt: undefined,
      updatedBy: '',
      visibility: undefined,
      characterSet: '',
      charset: '',
      compatMode: '',
      contentType: '',
      cookie: '',
      designMode: '',
      dir: '',
      domain: '',
      inputEncoding: '',
      lastModified: '',
      linkColor: '',
      referrer: '',
      vlinkColor: '',
      fullscreen: false,
      fullscreenEnabled: false,
      hidden: false,
      readyState: '',
      URL: '',
      rootElement: null,
      _id: '',
      documents: [],
      permissions: undefined,
      folders: [],
      options: undefined,
      folderPath: '',
      previousMetadata: undefined,
      currentMeta: currentMeta,
      currentMetadata: {} as UnifiedMetaDataOptions<UserData<BaseData<any, any, StructuredMetadata<any, any>>, BaseData<any, any, StructuredMetadata<any, any>>>, UserData<T, K>,
        StructuredMetadata<UserData<BaseData<any, any, StructuredMetadata<any, any>>, BaseData<any, any, StructuredMetadata<any, any>>>, UserData<T, K>>, never>,
      accessHistory: [],
      documentPhase: undefined,
      version: undefined,
      versionData: undefined,
      documentSize: DocumentSize.A4,
      lastModifiedDate: undefined,
      lastModifiedBy: '',
      name: undefined,
      createdByRenamed: undefined,
      createdDate: undefined,
      documentType: '',
      document: undefined,
      label: {} as Label,
      date: undefined,
      filePathOrUrl: '',
      uploadedBy: '',
      tagsOrCategories: '',
      format: '',
      uploadedByTeamId: null,
      uploadedByTeam: null,
      selectedDocument: null,
      documentList: [],
      filteredDocuments: [],
      searchResults: [],
      loading: false,
      error: null
    };

    // Call buildDocument function directly
    await buildDocument(
      options,
      documentObject,
      "document type" // Define your document type here
    );
    // Instead, include the DocumentBuilder component in your JSX markup with the required props:
    const docPermissions = new DocumentPermissions(true, true);

    const documents: DocumentData<UserData, K<UserData>, StructuredMetadata<UserData, K<UserData>>>[] = [
      {
        id: "1",
        documentSize: DocumentSize.A4,
        versionData: {} as VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        version: {} as Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        visibility: "public",
        _id: "1",
        permissions: docPermissions,
        folders: [],
        lastModifiedDate: {
          value: new Date(),
          // todo add timezone
          // utc: true,
          isModified: true,
        } as ModifiedDate,
        lastModifiedBy: "user1",
        name: "Document 1",
        description: "Description for Document 1",
        createdBy: "user1",
        createdDate: new Date(),
        status: "active",
        type: "type1",
         title: "Document 1",
        content: {
          text: "Content for Document 1",
          id: "",
          title: "",
          description: "",
          subscriberId: "",
          
          category: "",
          categoryProperties: "",
          timestamp: "",
          length: 0,
         
          items: [],
          data: {},
          latestVersion: createLatestVersion<BaseData<any>, BaseData<any>>(),
          schema: {}
         } as Content<UserData, K<UserData>, StructuredMetadata<UserData, K<UserData>>>,
        highlights: ["highlighted phrase 1", "tagged item 2"],
        topics: ["topic 1", "topic 2"],
        files: [
          {
            name: "file 1",
            content: "",
            fileSize: 0,
            fileType: "",
            filePath: "",
            uploader: "uploader1",
            fileName: "",
            uploadDate: new Date(),
            id: "file1",
            title: "",
            description: "",
            scheduledDate: new Date(),
            createdBy: "user1",
          },
          {
            name: "file 2",
            content: "",
            fileSize: 0,
            fileType: "",
            filePath: "",
            uploader: "uploader2",
            fileName: "",
            uploadDate: new Date(),
            id: "file2",
            title: "",
            description: "",
            scheduledDate: new Date(),
            createdBy: "user2",
          },
        ],
        documentType: "document type 1",
        options: getDefaultDocumentOptions(),
        documentPhase: getDocumentPhase(mapDocumentToProjectPhase(document)),
        keywords: ["keyword 1", "keyword 2"],
        folderPath: "",
        previousMetadata: createMetaState(
          "", // id: unique identifier for the metadata
          "", // apiEndpoint: endpoint for the API to fetch metadata
          "", // apiKey: authentication key for API requests
          0, // timeout: request timeout in milliseconds
          0, // retryAttempts: number of retry attempts in case of failure
          "", // name: name of the metadata entity
          "", // category: category for metadata
          "", // timestamp: timestamp when the metadata was last modified
          "", // createdBy: user who created the metadata
          [], // tags: tags associated with the metadata
          undefined, // metadata: metadata object, can be undefined initially
          undefined, // initialState: initial state of the metadata, can be undefined
          {} as Map<string, Snapshot<UserData<BaseData<any, any, StructuredMetadata<any, any>>, never>, never, StructuredMetadata<UserData<BaseData<any, any, StructuredMetadata<any, any>>, never>, never>, never>>, // meta: additional metadata, can be an empty array if not needed
          { eventRecords: {} }, // events: event manager data, initializing with an empty event record
          [], // relatedData: related data associated with metadata, empty array for now
          {} as Version, // version: version information, can be undefined if not applicable
          {} as VersionHistory, // lastUpdated: last updated version history, it should be provided
          true, // isActive: boolean flag indicating whether metadata is active or not
          {}, // config: configuration settings for the metadata, using an empty object
          [], // permissions: permissions associated with the metadata, empty for now
          {}, // customFields: any custom fields you might have for metadata, empty object
          "" // baseUrl: the base URL for API requests, can be an empty string if not used
        ),
        
        currentMetadata: createMetaState(
          "", // id: unique identifier for the metadata
          "", // apiEndpoint: endpoint for the API to fetch metadata
          "", // apiKey: authentication key for API requests
          0, // timeout: request timeout in milliseconds
          0, // retryAttempts: number of retry attempts in case of failure
          "", // name: name of the metadata entity
          "", // category: category for metadata
          "", // timestamp: timestamp when the metadata was last modified
          "", // createdBy: user who created the metadata
          [], // tags: tags associated with the metadata
          {}, // metadata: metadata object, can be undefined initially
          undefined, // initialState: initial state of the metadata, can be undefined
          {} as Map<string, Snapshot<UserData<BaseData<any, any, StructuredMetadata<any, any>>, never>, never, StructuredMetadata<UserData<BaseData<any, any, StructuredMetadata<any, any>>, never>, never>, never>>, // meta: additional metadata, can be an empty array if not needed
          { eventRecords: {} }, // events: event manager data, initializing with an empty event record
          {} as Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // version: version information, can be undefined if not applicable
          {} as VersionHistory, // lastUpdated: last updated version history, it should be provided
          true, // isActive: boolean flag indicating whether metadata is active or not
          {}, // config: configuration settings for the metadata, using an empty object
          [], // permissions: permissions associated with the metadata, empty for now
          {}, // customFields: any custom fields you might have for metadata, empty object
          "", // baseUrl: the base URL for API requests, can be an empty string if not used
          [], // relatedData: related data associated with metadata, empty array for now
          [], 
        ),
        accessHistory: [],
        _rev: "1",
        _attachments: {},
        _links: {},
        _etag: "etag1",
        _local: false,
        _revs: [],
        _source: {},
        _shards: {},
        _size: 0,
        _version: 1,
        _version_conflicts: 0,
        _seq_no: 0,
        _primary_term: 1,
        _routing: "route1",
        _parent: "parent1",
        _parent_as_child: false,
        _slices: [],
        _highlight: {},
        _highlight_inner_hits: {},
        _source_as_doc: false,
        _source_includes: [],
        _routing_keys: [],
        _routing_values: [],
        _routing_values_as_array: [],
        _routing_values_as_array_of_objects: [],
        _routing_values_as_array_of_objects_with_key: [],
        _routing_values_as_array_of_objects_with_key_and_value: [],
        _routing_values_as_array_of_objects_with_key_and_value_and_value: [],
        filePathOrUrl: "",
        uploadedBy: "",
        uploadedAt: "",
        tagsOrCategories: "",
        format: "",
        uploadedByTeamId: null,
        uploadedByTeam: null,
        document: undefined,
        all: null,
        selectedDocument: null,
        documents: [],
        createdByRenamed: "user1",
        createdAt: new Date(),
        updatedBy: "user1",
        currentMeta: "",
        phaseType: PhaseTypeEnums,
        label: "",
        date: new Date()
        
      },
      // Add more document data as needed
    ];    // Output or utilize the created user scenarios and mapped user journey
    console.log("User scenarios and user journey mapped successfully.");

  // Get properties based on the selected category
  const properties = dataVisualizationProperties[category as keyof CategoryProperties];

    // Ensure properties is of the correct type before passing it
    const validProperties: Partial<CategoryProperties> | undefined = 
    typeof properties === "object" && !Array.isArray(properties) && properties !== null
      ? (properties as Partial<CategoryProperties>)
      : undefined;

  if (!properties) {
    console.error("Invalid category.");
    process.exit(1);
  }

  // Generate the component
  generateComponent(componentName, category, validProperties, validationRules);


}



// Read component name from command line arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error("Please provide a component name.");
  process.exit(1);
}

// Prompting content necessary to answer the prompts
const promptingContent = `
  // Provide the necessary content here to answer the prompts
`;

// Generate the component
generateComponent(componentName, promptingContent);


export {
generateComponent,
};

// Example usage
generateComponent("MyDataVizComponent", "DataVisualization", { dataProperties: ["data"], chartType: "bar" }, dataVisualizationProperties);