// ScenarioBuilder.tsx
import { categorizeNews } from "@/app/components/community/articleKeywords";
import { allCategories } from "@/app/models/data/DataStructureCategories";
import { generateValidationRulesCode } from "@/app/server/security/validationRulesCode";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { BaseDataRoot } from '@/app/config/BaseConfig'

type NestedCategoryKeys = 'UserInterface' | 'DataVisualization' | 'Forms' | 'Analysis' | 'Communication' | 'TaskManagement' | 'Crypto';

// Define categories and their associated properties
// Updated CategoryProperties with generics
interface CategoryProperties<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T
> {
  id: string;
  type: string;
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
  componentDescription?: string;
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
  chartType: string;
  dataProperties: (keyof T | keyof K | string)[];
  formFields: (keyof T | keyof K | string)[];
}



const defaultCategoryProperties: CategoryProperties = {
  id: "default",
  type: "Category",
  name: "DefaultCategory",
  description: "",
  icon: "",
  color: "",
  iconColor: "",
  isActive: true,
  isPublic: true,
  isSystem: true,
  isDefault: true,
  isHidden: false,
  isHiddenInList: false,
  UserInterface: [],
  DataVisualization: [],
  Forms: undefined,
  Analysis: [],
  Communication: [],
  TaskManagement: [],
  Crypto: [],
  brandName: "",
  brandLogo: "",
  brandColor: "",
  brandMessage: "",
  chartType: '',
  dataProperties: [],
  formFields: []
};


const mergeCategoryProperties = (overrides: Partial<CategoryProperties>): CategoryProperties => ({
  ...defaultCategoryProperties,
  ...overrides,
});

const dataVisualizationProperties = mergeCategoryProperties({
  name: "Data Visualization",
  description: "Data visualization component",
  icon: "fa-chart-bar",
  color: "#007bff",
  iconColor: "#fff",
  isSystem: false,
  isDefault: false,
  UserInterface: ["componentName", "componentDescription"],
  DataVisualization: ["dataProperties", "chartType"],
  Analysis: ["categorizeNews"],
  Communication: ["audio", "video", "text"],
  TaskManagement: ["phases", "tasks", "dataAnalysis"],
  Crypto: ["portfolioManagement", "trading", "marketAnalysis", "communityEngagement"],
  brandName: "MyBrand",
  brandLogo: "path/to/logo.png",
  brandColor: "#ff5733",
  brandMessage: "Bringing insights to life",
  componentDescription: "This component provides data visualization capabilities.",
});


export function convertToCategoryProperties(
  category: Category
): CategoryProperties {
  if (typeof category === 'string' || typeof category === 'symbol') {
    return mergeCategoryProperties({
      name: typeof category === 'string' ? category : category.toString()  // Handle symbol case
    });
  } else if (category !== undefined) {
    return category as CategoryProperties;  // Assume it's already a valid CategoryProperties object
  } else {
    throw new Error("Invalid category");
  }
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
    import ChartComponent from "@/app/forms/ChartComponent"; // Import the ChartComponent

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
import { User } from '@/app/components/users/User';

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
if (category in dataVisualizationProperties) {
  const properties = dataVisualizationProperties[category as keyof CategoryProperties];
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


export {
  categorizeNews, dataVisualizationProperties, defaultCategoryProperties,
  generateFormsComponent, generateNewsCategories,
  generateNewsComponent, generateUserJourneyComponent,
  generateUserJourneyMapComponent,
  generateUserScenarioComponent, generateUserScenarioMapComponent
};

export type { CategoryProperties };
// Example usage of categories
const newsFeedData = { /* Provide your news feed data here */ };
const categories = categorizeNews(newsFeedData);
console.log('News categories:', categories);

// Accessing categories from dataVisualizationProperties
console.log('Communication categories:', dataVisualizationProperties.Communication);
console.log('Task management categories:', dataVisualizationProperties.TaskManagement);
console.log('Crypto categories:', dataVisualizationProperties.Crypto);

