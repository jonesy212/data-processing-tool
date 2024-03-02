import { endpoints } from "../api/ApiEndpoints";
import { endpointPreferences } from "../api/ApiPreferencesEndpoints";

// ApiCodeGenerator.ts
interface ApiMethod {
  name: string;
  parameters: (string | Function)[]; // Allow functions as parameters
}

// ApiCodeOptions.ts
interface ApiCodeOptions {
  baseUrl: string;
  endpoints: {
    [key: string]: string | Function; // Ensure values can be strings or functions
  };
  methods: ApiMethod[];
}





// Function to generate TypeScript API code
function generateApiCode(options: ApiCodeOptions): string {
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




  // Example implementation:
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
    { name: "fetchTeamMemberData", parameters: [] }
    // Add other methods as needed
  ],

  
  endpoints: { ...endpoints, userMiscellaneousPreferences: },
    // Add more endpoint groups as needed
};

const generatedApiCode = generateApiCode(apiCodeOptions);
console.log(generatedApiCode); // Output generated TypeScript API code

// Accessing the generated API endpoints


// Accessing the generated API endpoints
const usersEndpoints = endpoints.users as { [key: string]: string | ((userId: number) => string) };
console.log((endpoints.apiConfig as { [key: string]: string })?.updateUserApiConfig); // Output: https://your-api-base-url/api/user/api-config
console.log((endpoints.apiConfig as { [key: string]: string })?.aquaConfig); // Output: https://your-api-base-url/api/aqua-config

console.log((endpoints.users as { [key: string]: string })?.list); // Output: https://your-api-base-url/users
console.log(usersEndpoints?.single(123)); // Output: https://your-api-base-url/users/123
console.log((endpoints.users as { [key: string]: string })?.add); // Output: https://your-api-base-url/users
console.log((endpoints.users as { [key: string]: (userId: number) => string })?.remove(456)); // Output: https://your-api-base-url/users/456
console.log(usersEndpoints?.updateRole(123)); // Output: https://your-api-base-url/users/123/update-role
console.log((endpoints.users as { [key: string]: string })?.updateList); // Output: https://your-api-base-url/users/update-list
console.log((endpoints.users as { [key: string]: string })?.search); // Output: https://your-api-base-url/users/search
console.log((endpoints.users as { [key: string]: (userId: number) => string })?.updateRole(123)); // Output: https://your-api-base-url/users/123/update-role
console.log((endpoints.users as { [key: string]: string })?.updateRoles([456, 789])); // Output: https://your-api-base-url/users/456,789/update-roles

console.log(endpointPreferences.userMiscellaneousPreferences.setMiscellaneousPreferences); // Output: https://your-api-base-url/api/user/preferences/miscellaneous/set

console.log(endpointPreferences.userPreferences.fetchUserPreferences); // Output: https://your-api-base-url/api/user/preferences
console.log(endpointPreferences.userPreferences.updateUserPreferences); // Output: https://your-api-base-url/api/user/preferences
console.log(endpointPreferences.userPreferences.deleteUserPreferences); // Output: https://your-api-base-url/api/user/preferences
console.log(endpointPreferences.userPreferences.setTheme); // Output: https://your-api-base-url/api/user/preferences/theme
console.log(endpointPreferences.userPreferences.setIdeationPhase); // Output: https://your-api-base-url/api/user/preferences/ideation-phase


// console.log(endpointPreferences.apiConfig.getUserApiConfig);
// console.log(endpointPreferences.users.list);
// console.log(endpointPreferences.userPreferences.setTheme);

// Example usage of the generated service method code
// Assuming you have the `generateServiceMethod` function implemented in the same file or imported from another module
const createTeamMethod = generateServiceMethod({ name: "createTeam", parameters: ["teamDatimport { endpointPreferences } from '@/app/api/ApiPreferencesEndpoints';
a: any"] });import { endpointPreferences } from '@/app/api/ApiPreferencesEndpoints';
import { endpointPreferences } from '@/app/api/ApiPreferencesEndpoints';
import { endpointPreferences } from '@/app/api/ApiPreferencesEndpoints';
import { endpointPreferences } from '@/app/api/ApiPreferencesEndpoints';

const deleteTeamMethod = generateServiceMethod({ name: "deleteTeam", parameters: ["teamId: string"] });
const fetchTeamMemberDataMethod = generateServiceMethod({ name: "fetchTeamMemberData", parameters: [] });

// Log the generated service method code
console.log(createTeamMethod);
console.log(deleteTeamMethod);
console.log(fetchTeamMemberDataMethod);
