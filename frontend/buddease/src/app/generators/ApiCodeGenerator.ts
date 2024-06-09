import ApiCodeOptions from "./ApiCodeOptions";

// ApiCodeGenerator.ts
interface ApiMethod {
  name: string;
  parameters: (string | Function)[]; // Allow functions as parameters
}


// Function to generate TypeScript API code
export function generateApiCode(options: ApiCodeOptions): string {
  // Generate API code using the provided options
  const { baseUrl, endpoints, methods } = options;

// Generate endpoint strings based on the provided endpoints object
const endpointCode = Object.keys(endpoints).map(group => {
  const groupEndpoints = endpoints[group] as unknown as { [key: string]: string | Function };
  // Inside the generateApiCode function
  const endpointStrings = Object.keys(groupEndpoints).map(endpoint => {
    const endpointValue = groupEndpoints[endpoint];
    if (typeof endpointValue === 'string') {
      return `${group}.${endpoint}: \`\${BASE_URL}${endpointValue}\`,`; 
    } else if (typeof endpointValue === 'function') {
      // Handle functions appropriately
      return `${group}.${endpoint}: ${endpointValue.name},`; // Assuming you want to include function name
    }
    return '';
  }).join('\n      ');


  return `    ${group}: {\n      ${endpointStrings}\n    },`;
}).join('\n');

  // Define imports
  const imports = `
import axios from 'axios';
import { BASE_URL } from './config'; // Assuming you have a config file defining BASE_URL`;

  // Define service methods
  let serviceMethods = '';
  methods.forEach(method => {
    serviceMethods += generateServiceMethod(method);
  });



 // Define the API base URL constant
const apiUrlConstant = `const API_BASE_URL = "${baseUrl}";`;

  
// Define an array of endpoint objects
const endpointDefinitions = [
  { group: 'apiConfig', name: 'getUserApiConfig', url: '/api/user/api-config' },
  { group: 'apiConfig', name: 'updateUserApiConfig', url: '/api/user/api-config' },
  { group: 'apiConfig', name: 'aquaConfig', url: '/api/aqua-config' },
  // Add more endpoint definitions as needed
];
  
  
  
// Generate endpoint preferences dynamically
let endpointPreferencesCode = '';
endpointDefinitions.forEach(endpoint => {
  const { group, name, url } = endpoint;
  if (!endpointPreferencesCode.includes(group)) {
    endpointPreferencesCode += `  ${group}: {\n`;
  }
  endpointPreferencesCode += `    ${name}: \`\${API_BASE_URL}${url}\`,\n`;
});
  
// Example implementation:
const apiCode = `
  ${apiUrlConstant}

  // Generated API endpoints
  export const endpointPreferences = {
${endpointPreferencesCode}
  };

  // Combine imports, API base URL, endpoint code, and service methods
  ${imports}\n${endpointCode}\n${serviceMethods}\n\nexport default userManagementService;\n`;

  return apiCode
}


// Function to generate service method code
const generateServiceMethod = (method: ApiMethod): string => {
  const { name, parameters } = method;

  // Generate function signature
  let functionSignature = `${name}: async (${parameters.join(', ')}): Promise<any> => {\n`;
  functionSignature += `  try {\n`;
  functionSignature += `    // Add API call logic here\n`;
  functionSignature += `  } catch (error) {\n`;
  functionSignature += `    if (error instanceof Error) {\n`;
  functionSignature += `      // Add error handling logic here\n`;
  functionSignature += `      throw error;\n`;
  functionSignature += `    }\n`;
  functionSignature += `  }\n`;
  functionSignature += `},\n\n`;

  return functionSignature;
};

// Example usage
const apiCodeOptions: ApiCodeOptions = {
  baseUrl: "https://your-api-base-url",
  methods: [
    { name: "createTeam", parameters: ["teamData: any"] },
    { name: "deleteTeam", parameters: ["teamId: string"] },
    { name: "fetchTeamMemberData", parameters: [] },
  ],
  endpoints: {
    teams: '/teams', // Example endpoint path for teams
    users: '/users', // Example endpoint path for users
    apiConfig: '/api-config', // Example endpoint path for apiConfig
    projects: '/projects', // Example endpoint path for projects
    tasks: '/tasks', // Example endpoint path for tasks
    todos: '/todos', // Example endpoint path for todos


  },
};

export default ApiMethod;

export const generatedApiCode = generateApiCode(apiCodeOptions);
console.log(generatedApiCode); // Output generated TypeScript API code
