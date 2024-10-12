import * as React from  'react' 
import { categorizeNews } from "@/app/components/community/articleKeywords";
import { ModifiedDate } from "@/app/components/documents/DocType";
import DocumentBuilder, { DocumentData } from "@/app/components/documents/DocumentBuilder";
import {
    getDefaultDocumentOptions,
    getDocumentPhase,
} from "@/app/components/documents/DocumentOptions";
import { DocumentSize } from "@/app/components/models/data/StatusType";
import PhaseManager from "@/app/components/phases/PhaseManager";
import { generateValidationRulesCode } from "@/app/components/security/validationRulesCode";
import Version from "@/app/components/versions/Version";
import { VersionData } from "@/app/components/versions/VersionData";
import fs from "fs";
import { useState } from "react";
import PersonaTypeEnum, { PersonaBuilder } from "./PersonaBuilder";
import { Category } from "@/app/components/libraries/categories/generateCategoryProperties";
import { CategoryKeys } from "@/app/components/libraries/categories/CategoryManager";
import DocumentPermissions from "@/app/components/documents/DocumentPermissions";
import { allCategories, AllCategoryValues } from "@/app/components/models/data/DataStructureCategories";
import { Phase } from "@/app/components/phases/Phase";
import { DocumentObject } from '@/app/components/state/redux/slices/DocumentSlice';
import { buildDocument } from '@/app/components/documents/DocumentBuilderComponent';



type NestedCategoryKeys = 'UserInterface' | 'DataVisualization' | 'Forms' | 'Analysis' | 'Communication' | 'TaskManagement' | 'Crypto';

// Define categories and their associated properties
interface CategoryProperties {
  name: string;
  description: string;
  icon: string;
  color: string;
  iconColor: string;
  isActive: boolean;
  isPublic: boolean;
  isSystem: boolean;
  isDefault: boolean;
  isHidden: boolean;
  isHiddenInList: boolean;
  UserInterface: string[];
  DataVisualization: string[];
  Forms: Record<string, any> | undefined;
  Analysis: string[];
  Communication: string[];
  TaskManagement: string[];
  Crypto: string[];
  brandName: string;
  brandLogo: string;
  brandColor: string;
  brandMessage: string;
  componentDescription?: string;  // Add this if it's a direct property
}

const categoryProperties: CategoryProperties = {
  name: "Data Visualization",
  description: "Data visualization component",
  icon: "fa-chart-bar",
  color: "#007bff",
  iconColor: "#fff",
  isActive: true,
  isPublic: true,
  isSystem: false,
  isDefault: false,
  isHidden: false,
  isHiddenInList: false,
  UserInterface: ["componentName", "componentDescription"],
  DataVisualization: ["dataProperties", "chartType"],
  Forms: {},
  Analysis: ["categorizeNews"],
  Communication: ["audio", "video", "text"],
  TaskManagement: ["phases", "tasks", "dataAnalysis"],
  Crypto: ["portfolioManagement", "trading", "marketAnalysis", "communityEngagement"],
  brandName: "MyBrand",
  brandLogo: "path/to/logo.png",
  brandColor: "#ff5733",
  brandMessage: "Bringing insights to life",
  componentDescription: "This component provides data visualization capabilities."

};


export function convertToCategoryProperties(category: string | symbol | CategoryKeys | CategoryProperties | undefined): CategoryProperties {
  if (typeof category === 'string' || typeof category === 'symbol') {
    // Convert the string or symbol to CategoryProperties
    return {
      name: typeof category === 'string' ? category : category.toString(),  // Handle symbol case
      description: '',
      icon: '',
      color: '',
      iconColor: '',
      isActive: false,
      isPublic: false,
      isSystem: false,
      isDefault: false,
      isHidden: false,
      isHiddenInList: false,
      UserInterface: [],
      DataVisualization: [],
      Forms: undefined,
      Analysis: [],
      Communication: [],
      TaskManagement: [],
      Crypto: [],
      brandName: '',
      brandLogo: '',
      brandColor: '',
      brandMessage: ''
    };
  } else if (category !== undefined) {
    return category as CategoryProperties;  // Assume it's already a valid CategoryProperties object
  } else {
    throw new Error("Invalid category");
  }
}


function generateComponent(
  componentName: string, 
  category: AllCategoryValues, // Updated to use conditional types
  properties: any, 
  brand: any,
  nestedCategory?: NestedCategoryKeys 
) {
  let reactCode = "";

 
  if (nestedCategory) {
    // Handle nested categories
    switch (nestedCategory) {
      case "UserInterface":
        reactCode = generateUserInterfaceComponent(componentName, properties.componentDescription, brand);
        break;
      case "DataVisualization":
        reactCode = generateDataVisualizationComponent(componentName, properties.dataProperties, properties.chartType, brand);
        break;
      default:
        throw new Error("Unknown nested category");
    }
  } else {
    // Existing logic for handling top-level categories
    switch (category) {
      case "assignedNotes":
        reactCode = generateUserInterfaceComponent(componentName, properties.description, brand);
        break;
      // Handle other top-level categories...
      default:
        throw new Error("Unknown category");
    }
  }

  // Create a directory for the component
  const componentDir = `src/app/components/${componentName}`;
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir);
  }

  // Create a new file for the generated component
  const componentFilePath = `${componentDir}/${componentName}.tsx`;

  // Write the generated component code to the file
  fs.writeFileSync(componentFilePath, reactCode);

  console.log(`${componentName} component generated successfully.`);

  return reactCode;
}


function generateUserJourneyComponent(componentName: string, brand: any, userScenarios: string[]): string {
  // Generate React component code for user journey
  
  // Generate the user interface code
  const userJourneyInterfaceCode = `
    import React from 'react';
    import { UserJourney } from '@/app/components/UserJourney';
  
    interface ${componentName}Props {
      userScenarios: string[]; // Props for user scenarios
      brand: any; // Props for brand
    }
  
    const ${componentName}: React.FC<${componentName}Props> = ({ userScenarios, brand }) => {
      // Implement user journey logic here
      return (
        <div style={{ borderColor: brand.brandColor, borderStyle: "solid" }}>
          <img src={brand.brandLogo} alt={brand.brandName} />
          <h2>${componentName} Component</h2>
          <UserJourney scenarios={userScenarios} />
          <p>{brand.brandMessage}</p>
        </div>
      );
    };
  
    export default ${componentName};
  `;

  return userJourneyInterfaceCode;
}

function generateUserScenarioComponent(componentName: string, brand: any, userScenario: string): string {
  // Generate React component code for user scenario
  const userScenarioInterfaceCode = `
    import React from 'react';
    import { UserScenario } from '@/app/components/UserScenario';
  
    interface ${componentName}Props {
      userScenario: string; // Props for user scenario
      brand: any; // Props for brand
    }
  
    const ${componentName}: React.FC<${componentName}Props> = ({ userScenario, brand }) => {
      return (
        <div style={{ borderColor: brand.brandColor, borderStyle: "solid", padding: "20px" }}>
          <img src={brand.brandLogo} alt={brand.brandName} />
          <h2>${componentName} Component</h2>
          <UserScenario scenario={userScenario} />
          <p>{brand.brandMessage}</p>
        </div>
      );
    };
  
    export default ${componentName};
  `;

  return userScenarioInterfaceCode;
}


function generateUserJourneyMapComponent(componentName: string, brand: any, userJourneyData: any[]): string {
  // Generate React component code for user journey map
  const userJourneyMapComponentCode = `
    import React from 'react';
    import { UserJourneyMap } from '@/app/components/UserJourneyMap'; // Import your journey map component

    interface ${componentName}Props {
      userJourneyData: Array<{ step: string, description: string }>; // Props for user journey data
      brand: any; // Props for brand
    }

    const ${componentName}: React.FC<${componentName}Props> = ({ userJourneyData, brand }) => {
      return (
        <div style={{ borderColor: brand.brandColor, borderStyle: "solid", padding: "20px" }}>
          <img src={brand.brandLogo} alt={brand.brandName} />
          <h2>${componentName} Component</h2>
          <UserJourneyMap data={userJourneyData} /> {/* Render the journey map */}
          <p>{brand.brandMessage}</p>
        </div>
      );
    };

    export default ${componentName};
  `;

  return userJourneyMapComponentCode;
}


function generateNewsComponent(componentName: string, brand: any, newsData: { title: string; summary: string; content: string; date: string; author: string }[]): string {
  // Generate React component code for news
  const newsComponentCode = `
    import React from 'react';
    import { NewsItem } from '@/app/components/NewsItem'; // Import your news item component

    interface ${componentName}Props {
      newsData: Array<{ title: string, summary: string, content: string, date: string, author: string }>;
      brand: any; // Props for brand
    }

    const ${componentName}: React.FC<${componentName}Props> = ({ newsData, brand }) => {
      return (
        <div style={{ borderColor: brand.brandColor, borderStyle: "solid", padding: "20px" }}>
          <img src={brand.brandLogo} alt={brand.brandName} />
          <h2>${componentName} Component</h2>
          {newsData.map((newsItem, index) => (
            <NewsItem
              key={index}
              title={newsItem.title}
              summary={newsItem.summary}
              content={newsItem.content}
              date={newsItem.date}
              author={newsItem.author}
            />
          ))}
          <p>{brand.brandMessage}</p>
        </div>
      );
    };

    export default ${componentName};
  `;

  return newsComponentCode;
}


function generateNewsCategories(componentName: string, categories: { category: string; newsData: { title: string; summary: string; content: string; date: string; author: string }[] }[], brand: any): string {
  // Generate React component code for news categories
  const newsCategoriesCode = `
    import React from 'react';
    import { NewsItem } from '@/app/components/NewsItem'; // Import your news item component

    interface NewsCategory {
      category: string;
      newsData: Array<{ title: string, summary: string, content: string, date: string, author: string }>;
    }

    interface ${componentName}Props {
      categories: NewsCategory[];
      brand: any; // Props for brand
    }

    const ${componentName}: React.FC<${componentName}Props> = ({ categories, brand }) => {
      return (
        <div style={{ borderColor: brand.brandColor, borderStyle: "solid", padding: "20px" }}>
          <img src={brand.brandLogo} alt={brand.brandName} />
          <h2>${componentName} Component</h2>
          {categories.map((category, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <h3>{category.category}</h3>
              {category.newsData.map((newsItem, idx) => (
                <NewsItem
                  key={idx}
                  title={newsItem.title}
                  summary={newsItem.summary}
                  content={newsItem.content}
                  date={newsItem.date}
                  author={newsItem.author}
                />
              ))}
            </div>
          ))}
          <p>{brand.brandMessage}</p>
        </div>
      );
    };

    export default ${componentName};
  `;

  return newsCategoriesCode;
}



function generateUserScenarioMapComponent(componentName: string, brand: any, userScenarioMapData: any[]): string {
  // Generate React component code for user scenario map
  const userScenarioMapComponentCode = `
    import React from 'react';
    import { UserScenarioMap } from '@/app/components/UserScenarioMap'; // Import your scenario map component

    interface ${componentName}Props {
      userScenarioMapData: Array<{ scenario: string, details: string }>; // Props for user scenario map data
      brand: any; // Props for brand
    }

    const ${componentName}: React.FC<${componentName}Props> = ({ userScenarioMapData, brand }) => {
      return (
        <div style={{ borderColor: brand.brandColor, borderStyle: "solid", padding: "20px" }}>
          <img src={brand.brandLogo} alt={brand.brandName} />
          <h2>${componentName} Component</h2>
          <UserScenarioMap data={userScenarioMapData} /> {/* Render the scenario map */}
          <p>{brand.brandMessage}</p>
        </div>
      );
    };

    export default ${componentName};
  `;

  return userScenarioMapComponentCode;
}



// Function to generate data visualization component code
function generateDataVisualizationComponent(componentName: string, dataProperties: string[], chartType: string, brand: any) {
  // Generate React component code for data visualization
  const dataPropsCode = dataProperties.map((prop) => `    ${prop}: any;`).join("\n");

  return `
    import React from 'react';
    import { ChartOptions } from 'chart.js';
    import ChartComponent from "../forms/ChartComponent"; // Import the ChartComponent

    interface ${componentName}Props {
  ${dataPropsCode}
    }

    const ${componentName}: React.FC<${componentName}Props> = ({ ${dataProperties.join(", ")} }) => {
      // Implement data visualization component logic here
      return (
        <div style={{ borderColor: "${brand.brandColor}", borderStyle: "solid" }}>
          <img src="${brand.brandLogo}" alt="${brand.brandName} Logo" />
          <h2>${componentName} Component</h2>
          <p>Chart Type: ${chartType}</p>
          <ChartComponent type="${chartType}" data={{ /* Pass your data here */ }} />
          <p>${brand.brandMessage}</p>
        </div>
      );
    };

    export default ${componentName};
  `;
}



// Function to generate forms component code
function generateFormsComponent(
  componentName: string,
  formFields: string[],
  validationRules: string[]
): string {
  // Generate React component code for forms

  // Define form fields and validation rules
  const formFieldsCode = formFields
    .map((field) => `    ${field}: any;`)
    .join("\n");

  // Generate validation rules code
  const validationRulesCode = generateValidationRulesCode(validationRules); // Generate component code
  const componentCode = `
      import React from 'react';
import { User } from '../../components/users/User';

      interface ${componentName}Props {
        ${formFieldsCode}
        ${validationRulesCode} // Include validation rules code here
      }
      

      const ${componentName}: React.FC<${componentName}Props> = ({ ${formFields.join(
    ", "
  )} }) => {
          // Implement forms component logic here

          // Function to handle form submission
          const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              // Add form submission logic here
          };

          return (
              <div>
                  <h2>${componentName} Form</h2>
                  <form onSubmit={handleSubmit}>
                      {/* Render form fields here */}
  ${formFields
    .map((field) => `                    <input type="text" name="${field}" />`)
    .join("\n")}
                      <button type="submit">Submit</button>
                  </form>
              </div>
          );
      };

      export default ${componentName};
    `;

  return componentCode;
}

// Read component name and category from command line arguments
const componentName = process.argv[2];
// Safely cast the category from the command line argument
const categoryArg = process.argv[3];

// Ensure that the category is a valid key of `CategoryKeys`
const category = categoryArg as keyof typeof allCategories;

if (!componentName || !category) {
  console.error("Please provide a component name and category.");
  process.exit(1);
}


// Function to generate user interface component code
function generateUserInterfaceComponent(componentName: string, componentDescription: string, brand: any) {
  return `
    import React from 'react';

    interface ${componentName}Props {
      // Add component props here
    }

    const ${componentName}: React.FC<${componentName}Props> = (props) => {
      // Component implementation
      return (
        <div style={{ borderColor: "${brand.brandColor}", borderStyle: "solid" }}>
          <img src="${brand.brandLogo}" alt="${brand.brandName} Logo" />
          <h1>${componentName} Component</h1>
          <p>${componentDescription}</p>
          <p>${brand.brandMessage}</p>
        </div>
      );
    };

    export default ${componentName};
  `;
}

// Before accessing the properties, ensure the category is valid
let reactCode = '';

const componentFilePath = `src/app/components/${componentName}/${componentName}.tsx`;


// Before accessing the properties, ensure the category is valid
if (category in categoryProperties) {
  const properties = categoryProperties[category as keyof CategoryProperties];
  if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
    const brand = {
      brandName: 'brandName' in properties && typeof properties.brandName === 'string' ? properties.brandName : '',
      brandLogo: 'brandLogo' in properties && typeof properties.brandLogo === 'string' ? properties.brandLogo : '',
      brandColor: 'brandColor' in properties && typeof properties.brandColor === 'string' ? properties.brandColor : '',
    };

    const componentDescription = Array.isArray(properties.UserInterface)
      ? properties.UserInterface.find((item: string) => item === 'componentDescription')
      : undefined;

    const reactCode = generateUserInterfaceComponent(
      componentName,
      'componentDescription' in properties && typeof properties.componentDescription === 'string' ? properties.componentDescription : '',
      brand
    );
  } else {

    throw new Error(`Properties for category ${String(category)} are undefined or not an object.`);
  }


} else { 
   throw new Error(`Invalid category: ${String(category)}`);
}

const defaultCondition = async (idleTimeoutDuration: number): Promise<boolean> => {
  // Define the threshold for idle timeout
  const IDLE_TIMEOUT_THRESHOLD = 3000; // 3 seconds

  // Check if the idleTimeoutDuration exceeds the threshold
  return idleTimeoutDuration > IDLE_TIMEOUT_THRESHOLD;
};


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
      categoryProperties.Forms?.validationRules
    );
    
    // Generate component code
    generateComponent(
      "ValidationRules",
      "Forms",
      {
        formFields: categoryProperties.Forms?.validationRules,
      },
      validationRules
    );
    
    // Save component code to file
    fs.writeFileSync(componentFilePath, reactCode);
    
    
     // Example usage of buildDocument function
     const documentObject: DocumentObject = {
      // Define your document object here
    };

    // Call buildDocument function directly
    await buildDocument(
      options,
      documentObject,
      "document type" // Define your document type here
    );
    // Instead, include the DocumentBuilder component in your JSX markup with the required props:
    const docPermissions = new DocumentPermissions(true, true);

    const documents: DocumentData[] = [
      {
        id: "1",
        documentSize: DocumentSize.A4,
        versionData: {} as VersionData,
        version: {} as Version,
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
        // user: "user1",
        title: "Document 1",
        content: "Content for Document 1",
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
        documentPhase: getDocumentPhase(document),
        keywords: ["keyword 1", "keyword 2"],
        folderPath: "",
        previousMetadata: {},
        currentMetadata: {},
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
        uploadedBy: 0,
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
        
      },
      // Add more document data as needed
    ];
    // Output or utilize the created user scenarios and mapped user journey
    console.log("User scenarios and user journey mapped successfully.");

  // Get properties based on the selected category
  const properties = categoryProperties[category as keyof CategoryProperties];

  if (!properties) {
    console.error("Invalid category.");
    process.exit(1);
  }

  // Generate the component
  generateComponent(componentName, category, properties, validationRules);

}




// Example usage
generateComponent("MyDataVizComponent", "DataVisualization", { dataProperties: ["data"], chartType: "bar" }, categoryProperties);
export {
    categorizeNews,
    categoryProperties, generateComponent, generateFormsComponent, generateNewsCategories, generateNewsComponent, generateUserJourneyComponent, generateUserJourneyMapComponent, generateUserScenarioComponent, generateUserScenarioMapComponent
};
export type { CategoryProperties };

// Example usage of categories
const newsFeedData = { /* Provide your news feed data here */ };
const categories = categorizeNews(newsFeedData);
console.log('News categories:', categories);

// Accessing categories from categoryProperties
console.log('Communication categories:', categoryProperties.Communication);
console.log('Task management categories:', categoryProperties.TaskManagement);
console.log('Crypto categories:', categoryProperties.Crypto);

