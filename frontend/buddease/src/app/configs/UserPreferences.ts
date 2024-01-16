
//todo update to modue names
export type ModuleType =
  "profileManagement"
  | "taskTracking"
  | "communication"
  | "inteigents"
  | "animations" 
  | "auth"
  | "calendar"
  | "cards"
  | "communications"
  | "admin"
  | "analytics"
  | "lazyLoadScriptConfig"
  | "tools"
  | "scheduler"
  | "containers"
  | "dashboards"
  | "documents"
  | "hooks"
  | "icons"
  | "interfaces"
  | "lists"
  | "models"
  | "navigation"
  | "onboarding"
  | "phases"
  | "projects"
  | "prompts"
  | "referrals"
  | "routing"
  | "shared"
  | "state"
  | "styling"
  | "subscriptions"
  | "support"
  | "tasks"
  | "teams"
  | "todos";
// userPreferences.ts
const userPreferences = {
  modules: "modules" as ModuleType,
  actions: [],
  reducers: [],
    // ... other userPreferences content
  };
  
  export default userPreferences;
  