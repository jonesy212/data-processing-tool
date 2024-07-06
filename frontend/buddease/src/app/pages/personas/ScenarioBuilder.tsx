import DocumentBuilder, { DocumentData } from "@/app/components/documents/DocumentBuilder";
import {
  getDefaultDocumentOptions,
  getDocumentPhase,
} from "@/app/components/documents/DocumentOptions";
import FileData from "@/app/components/models/data/FileData";
import PhaseManager from "@/app/components/phases/PhaseManager";
import { generateValidationRulesCode } from "@/app/components/security/validationRulesCode";
import fs from "fs";
import React, { useState } from "react";
import PersonaTypeEnum, { PersonaBuilder } from "./PersonaBuilder";
import { categorizeNews } from "@/app/components/community/articleKeywords";
import useDocumentStore from "@/app/components/state/stores/DocumentStore";
import { FormData } from "../forms/PreviewForm";
import { VersionData } from "@/app/components/versions/VersionData";
import Version from "@/app/components/versions/Version";
import { ModifiedDate } from "@/app/components/documents/DocType";
import { DocumentSize } from "@/app/components/models/data/StatusType";

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
};

function convertToCategoryProperties(category: string | CategoryProperties | undefined): CategoryProperties {
  if (typeof category === 'string') {
    // Convert the string to CategoryProperties
    return {
      name: category,
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
    return category;
  } else {
    throw new Error("Invalid category");
  }
}

const componentFilePath = apiFilePath;

const reactCode = generateUserInterfaceComponent(componentName, properties.componentDescription, brand);

// Define function to create user scenarios and map out user journey
async function createUserScenarios(props: any, type: PersonaTypeEnum) {
  const [options, setOptions] = useState(getDefaultDocumentOptions());

  // Create instances of UserPersonaBuilder, PhaseManager, and DocumentBuilder
  const userPersonaBuilder = new PersonaBuilder();
  const phaseManager = new PhaseManager({ phases: [] });

  // Use the modules to create detailed user scenarios and map out user journey
  // Example:
  const userPersona = PersonaBuilder.buildPersona(
    PersonaTypeEnum.CasualUser,
    props
  );
  // Check if phaseManager is not null or undefined before accessing its properties
  const phases = phaseManager?.phases?.[0];
  // Generate user scenarios and map out user journey
  if (phases) {
    phases.scenarios = userPersonaBuilder.buildScenarios(userPersona);
    phases.userJourney = userPersonaBuilder.mapUserJourney(type, phases.scenarios);
  }
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
  // Return component name

  const document = await DocumentBuilder.buildDocument(
    userPersona,
    phaseManager,
    options
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
      selectedDocument: null
    },
    // Add more document data as needed
  ];
  // Output or utilize the created user scenarios and mapped user journey
  console.log("User scenarios and user journey mapped successfully.");
}


function generateComponent(componentName: string, category: keyof CategoryProperties, properties: any, brand: any) {
  let reactCode = "";

  switch (category) {
    case "UserInterface":
      reactCode = generateUserInterfaceComponent(componentName, properties.componentDescription, brand);
      break;
    case "DataVisualization":
      reactCode = generateDataVisualizationComponent(componentName, properties.dataProperties, properties.chartType, brand);
      break;
    // Add cases for other categories
    default:
      console.error("Invalid category.");
      return;
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
const category = process.argv[3] as keyof CategoryProperties;

if (!componentName || !category) {
  console.error("Please provide a component name and category.");
  process.exit(1);
}

// Get properties based on the selected category
const properties = categoryProperties[category];

if (!properties) {
  console.error("Invalid category.");
  process.exit(1);
}

// Simulating validation rules for DataVisualization category
const validationRules = {}; // Include your validation rules here

// Generate the component
generateComponent(componentName, category, properties, validationRules);



// Example usage
generateComponent("MyDataVizComponent", "DataVisualization", { dataProperties: ["data"], chartType: "bar" }, categoryProperties);
export type { CategoryProperties };
export {convertToCategoryProperties}





// Example usage of categories
const newsFeedData = { /* Provide your news feed data here */ };
const categories = categorizeNews(newsFeedData);
console.log('News categories:', categories);

// Accessing categories from categoryProperties
console.log('Communication categories:', categoryProperties.Communication);
console.log('Task management categories:', categoryProperties.TaskManagement);
console.log('Crypto categories:', categoryProperties.Crypto);

