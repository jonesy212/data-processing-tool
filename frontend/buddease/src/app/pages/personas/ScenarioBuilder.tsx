import DocumentBuilder from "@/app/components/documents/DocumentBuilder";
import { DocumentOptions, getDefaultDocumentOptions, getDocumentPhase } from "@/app/components/documents/DocumentOptions";
import PhaseManager from "@/app/components/phases/PhaseManager";
import { generateValidationRulesCode } from "@/app/components/security/validationRulesCode";
import fs from "fs";
import { useState } from "react";
import PersonaTypeEnum, { PersonaBuilder } from "./PersonaBuilder";
import { User } from "@/app/components/users/User";
import FileData from "@/app/components/models/data/FileData";

// Define categories and their associated properties
interface CategoryProperties {
  UserInterface: string[];
  DataVisualization: string[];
  Forms: FormData[];
  

  // Add more categories and properties as needed
}

const categoryProperties: CategoryProperties = {
  UserInterface: ["componentName", "componentDescription"],
  DataVisualization: ["dataProperties", "chartType"],
  Forms: {

  } as FormData[],
  
};

// Define function to create user scenarios and map out user journey
async function createUserScenarios(props: any) {
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
  const phases = phaseManager.phases ? phaseManager.phases[0] : undefined;
  // Generate user scenarios and map out user journey
  if (phases) {
    phases.scenarios = userPersonaBuilder.buildScenarios(userPersona);
    phases.userJourney = userPersonaBuilder.mapUserJourney(phases.scenarios);
  }
  // Output or utilize the created user scenarios and mapped user journey
  console.log("User scenarios and user journey mapped successfully.");
  // Generate validation rules code
  const validationRules = generateValidationRulesCode(
    categoryProperties.Forms.validationRules
  );
  // Generate component code
  generateComponent(
    "ValidationRules",
    "Forms",
    {
      formFields: categoryProperties.Forms.validationRules,
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
  const documents = (
    <DocumentBuilder
      documents={[
        {
          id: 1,
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
              uploader: {} as FileData["username"],
              fileName: "",
              uploadDate: new Date(),
              id: "",
              title: "",
              description: "",
              scheduledDate: new Date(),
              createdBy: "",
            },
            {
              name: "file 2",
              content: "",
              fileSize: 0,
              fileType: "",
              filePath: "",
              uploader: undefined,
              fileName: "",
              uploadDate: undefined,
              id: "",
              title: "",
              description: "",
              scheduledDate: undefined,
              createdBy: "",
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
        },
        // Add more document data as needed
      ]}
      isDynamic={true}
      options={getDefaultDocumentOptions()}
      onOptionsChange={(newOptions) => {
        // Update the DocumentOptions state
        setOptions(newOptions);
      }}
      setOptions={setOptions} // Define setOptions prop
      documentPhase={getDocumentPhase(documents)}
      version={getDocumentVersion()}
    />
  );

  // Output or utilize the created user scenarios and mapped user journey
  console.log("User scenarios and user journey mapped successfully.");
}

function generateComponent(
  componentName: string,
  category: keyof CategoryProperties,
  properties: any,
  validationRules: any // Include validationRules parameter
) {
  // Generate React component code based on the selected category and properties
  let reactCode = "";

  switch (category) {
    case "UserInterface":
      reactCode = generateUserInterfaceComponent(
        componentName,
        properties.componentDescription
      );
      break;
    case "DataVisualization":
      // Pass validationRules as the last parameter
      reactCode = generateDataVisualizationComponent(
        componentName,
        properties.dataProperties,
        properties.chartType,
        validationRules
      );
      break;
    case "Forms":
      reactCode = generateFormsComponent(
        componentName,
        properties.formFields,
        validationRules // Pass validationRules
      );
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
function generateUserInterfaceComponent(
  componentName: string,
  componentDescription: string // Change to string type
) {
  return `
    import React from 'react';

    interface ${componentName}Props {
        // Add component props here
    }

    const ${componentName}: React.FC<${componentName}Props> = (props) => {
        // Component implementation
        return <div>${componentName} Component - ${componentDescription}</div>;
    };

    export default ${componentName};
    `;
}

// Function to generate data visualization component code
function generateDataVisualizationComponent(
  componentName: string,
  dataProperties: string[],
  chartType: string,
  validationRules: any // Include validationRules parameter
): string {
  // Generate React component code for data visualization

  // Define data properties
  const dataPropsCode = dataProperties
    .map((prop) => `    ${prop}: any;`)
    .join("\n");

  // Generate component code
  const componentCode = `
      import React from 'react';
      import { ChartOptions } from 'chart.js';
      import ChartComponent from "../forms/ChartComponent"; // Import the ChartComponent

      interface ${componentName}Props {
  ${dataPropsCode}
      }

      const ${componentName}: React.FC<${componentName}Props> = ({ ${dataProperties.join(
    ", "
  )} }) => {
          // Implement data visualization component logic here
          return (
              <div>
                  <h2>${componentName} Component</h2>
                  <p>Chart Type: ${chartType}</p>
                  <ChartComponent type="${chartType}" data={{ /* Pass your data here */ }} />
              </div>
          );
      };

      export default ${componentName};
    `;

  return componentCode;
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

export type { CategoryProperties };
