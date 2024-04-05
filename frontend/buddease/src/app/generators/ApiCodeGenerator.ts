import { NestedEndpoints, endpoints } from "../api/ApiEndpoints";
import  {endpointPreferences}  from "../api/ApiPreferencesEndpoints";

// ApiCodeGenerator.ts
interface ApiMethod {
  name: string;
  parameters: (string | Function)[]; // Allow functions as parameters
}

export default ApiMethod;





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
    { name: "fetchTeamMemberData", parameters: [] },
  ],
  endpoints: {
    teams: '',
    users: '',
    apiConfig: '',
    projects: '',
    tasks: '',
    todos: '',

  },
};

const generatedApiCode = generateApiCode(apiCodeOptions);
console.log(generatedApiCode); // Output generated TypeScript API code

// Accessing the generated API endpoints


// Accessing the generated API endpoints
const usersEndpoints = endpoints.users as { [key: string]: string | ((userId: number) => string) };
console.log((endpoints.apiConfig as { [key: string]: string })?.updateUserApiConfig); // Output: https://your-api-base-url/api/user/api-config
console.log((endpoints.apiConfig as { [key: string]: string })?.aquaConfig); // Output: https://your-api-base-url/api/aqua-config

console.log((endpoints.users as { [key: string]: string })?.list); // Output: https://your-api-base-url/users
console.log((endpoints.users as { [key: string]: string })?.add); // Output: https://your-api-base-url/users
console.log((endpoints.users as { [key: string]: (userId: number) => string })?.remove(456)); // Output: https://your-api-base-url/users/456
console.log((endpoints.users as { [key: string]: string })?.updateList); // Output: https://your-api-base-url/users/update-list
console.log((endpoints.users as { [key: string]: string })?.search); // Output: https://your-api-base-url/users/search
console.log((endpoints.users as { [key: string]: (userId: number) => string })?.updateRole(123)); // Output: https://your-api-base-url/users/123/update-role
console.log(
  (usersEndpoints as { [key: string]: (userId: number) => string })?.single?.(
    123
  )
);
// Output: https://your-api-base-url/users/123
console.log(
  (usersEndpoints as { [key: string]: (userId: number) => string })?.updateRole(
    123
  )
);
// Output: https://your-api-base-url/users/123/update-role
console.log(
  (
    endpoints.users as { [key: string]: (userIds: number[]) => string }
  )?.updateRoles([456, 789])
);
// Output: https://your-api-base-url/users/456,789/update-roles


// Type assertion to inform TypeScript that endpointPreferences.userMiscellaneousPreferences is of type NestedEndpoints
const userMiscellaneousPreferences = endpointPreferences.userMiscellaneousPreferences as NestedEndpoints;

// Now you can access the setMiscellaneousPreferences endpoint
console.log(userMiscellaneousPreferences.setMiscellaneousPreferences); // Output: https://your-api-base-url/api/user/preferences/miscellaneous/set
console.log(userMiscellaneousPreferences.fetchUserPreferences); // Output: https://your-api-base-url/api/user/preferences
console.log(userMiscellaneousPreferences.updateUserPreferences); // Output: https://your-api-base-url/api/user/preferences
console.log(userMiscellaneousPreferences.deleteUserPreferences); // Output: https://your-api-base-url/api/user/preferences
console.log(userMiscellaneousPreferences.setTheme); // Output: https://your-api-base-url/api/user/preferences/theme
console.log(userMiscellaneousPreferences.setIdeationPhase); // Output: https://your-api-base-url/api/user/preferences/ideation-phase


// Example usage of the generated service method code
// Assuming you have the `generateServiceMethod` function implemented in the same file or imported from another module
const createTeamMethod = generateServiceMethod({
  name: "createTeam", parameters: ["teamData: any"] });
 
const deleteTeamMethod = generateServiceMethod({ name: "deleteTeam", parameters: ["teamId: string"] });
const fetchTeamMemberDataMethod = generateServiceMethod({ name: "fetchTeamMemberData", parameters: [] });

// Log the generated service method code
console.log(createTeamMethod);
console.log(deleteTeamMethod);
console.log(fetchTeamMemberDataMethod);
