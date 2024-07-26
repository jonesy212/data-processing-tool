// apiEndpointOutput.ts
import { NestedEndpoints, endpoints } from "../api/ApiEndpoints";
import { generatedApiCode } from "../generators/ApiCodeGenerator";
import { endpointPreferences } from "./ApiPreferencesEndpoints";

console.log(generatedApiCode); // Output generated TypeScript API code

// Type assertion to inform TypeScript that endpointPreferences.userMiscellaneousPreferences is of type NestedEndpoints
const userMiscellaneousPreferences = endpointPreferences.userMiscellaneousPreferences as NestedEndpoints;

// Now you can access the setMiscellaneousPreferences endpoint
console.log(userMiscellaneousPreferences.setMiscellaneousPreferences); // Output: https://your-api-base-url/api/user/preferences/miscellaneous/set
console.log(userMiscellaneousPreferences.fetchUserPreferences); // Output: https://your-api-base-url/api/user/preferences
console.log(userMiscellaneousPreferences.updateUserPreferences); // Output: https://your-api-base-url/api/user/preferences
console.log(userMiscellaneousPreferences.deleteUserPreferences); // Output: https://your-api-base-url/api/user/preferences
console.log(userMiscellaneousPreferences.setTheme); // Output: https://your-api-base-url/api/user/preferences/theme
console.log(userMiscellaneousPreferences.setIdeationPhase); // Output: https://your-api-base-url/api/user/preferences/ideation-phase

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
