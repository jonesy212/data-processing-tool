// type-patterns.ts
export const TYPE_PATTERNS = {
  suffixes: [
    /Entity$/,
    /Data$/,        // BUT: VideoData might be a class, Data might be interface
    /Config$/,
    /Store$/,       // CAREFUL: DataStore is type, useTaskManagerStore is runtime
    /Props$/,
    /Options$/,
    /Manager$/,     // CAREFUL: Could be class
    /Type$/,
    /Interface$/,
    /State$/,
    /Meta$/,
    /Payload$/,
    /Event$/,
    /Category$/,
    /Version$/,
    /Snapshot$/,
    /Attachment$/,
    /Collection$/,
    /Item$/,
    /Field$/,
    /Response$/,
    /Request$/,
    /Context$/,     // CAREFUL: AuthContext might be runtime
    /Handler$/,     // CAREFUL: Could be class
    /Callback$/,
    /Level$/,
    /Details$/,
    /Properties$/,
    /Enum$/,
    /Params$/,
    /Model$/,
    /Analysis$/,
    /Definition$/,
    /Transition$/,
    /Parameters$/,
    /ReturnType$/
  ],
  
  prefixes: [
    /^Base[A-Z]/,
    /^Default[A-Z]/,
    /^Snapshot[A-Z]/,
    /^Version[A-Z]/,
    /^Realtime[A-Z]/,
    /^T[A-Z]/, // Generic types (TData, TEntity)
    /^I[A-Z]/, // Interface naming convention (IUser)
  ],
  
  fullMatch: [
    /^[A-Z][a-z]+[A-Z][a-z]+$/, // PascalCase multi-words
  ],
  
  exactMatches: new Set([
    'TriggerIncentivesParams',
    'LogActivityParams',
    // Add known type exports from your project
    'BaseDataEntity',
    'DefaultExcludedFields', 
    'DefaultMeta',
    'Attachment',
    'Data',
    'Task',
    'Snapshot',
    'DetailsItem',
    'TaskEntity',
    // Add more as you discover them
  ]),
} as const;

export const VALUE_PATTERNS = {
  prefixes: [
    /^use[A-Z]/, // React hooks (useAuthStore, useTaskManagerStore)
    /^create[A-Z]/, // Factory functions
    /^get[A-Z]/, // Getter functions
    /^set[A-Z]/, // Setter functions
    /^is[A-Z]/, // Checker functions
    /^has[A-Z]/, // Checker functions
    /^[a-z]/, // lowercase usually values
    /^fetch[A-Z]/, // Fetch functions
    /^update[A-Z]/, // Update functions
    /^delete[A-Z]/, // Delete functions
    /^add[A-Z]/, // Add functions
    /^remove[A-Z]/, // Remove functions
  ],
  
  suffixes: [
    /Api$/,
    /StoreClass$/,
    /Service$/,
    /Helper$/,
    /Util$/,
    /Utils$/,
    /Actions$/, // ProjectActions, UIActions (these are runtime!)
    /Progress$/, // TaskProgress, TeamProgress (React components)
    /Renderer$/, // ContentRenderer (React component)
    /Button$/, // ReusableButton (React component)
  ],
  
  exactMatches: new Set([
    'dataProcessingService',
    'Content',
    'Pool',
    'Client',
    'Connection',
    'Database',
    'Query',
    'Transaction',
    'logger',
    'console',
    'process',
    'window',
    'document',
    'navigator',
    // Add known runtime exports
    'ProjectActions',
    'UIActions',
    'checkTodoCompletion',
    'updateTodo',
    'handleTaskApiErrorAndNotify',
    'updateUI',
    'brandingSettings',
    'PriorityTypeEnum',
    'StatusType',
    'rootStores',
    'useTaskManagerStore',
    'useTrackerStore',
    'todoService',
    'AnalysisTypeEnum',
    'createMilestone',
    'AxiosError', // IMPORTANT: This is a class!
    'Router',
    'useRouter',
    'React',
    'useEffect',
    'useState',
    'Member', // Check if class - might need adjustment
    'Phase', // Check if class
    'Project', // Check if class
    'ProjectDetails', // Check if class
    'Progress', // Check if component
    'ExtendedRouter', // Check if class
    'DataAnalysisResult', // Check if class
    'Todo', // Check if class
    'VideoData', // Check if class
  ]),
} as const;

// Special handling for ambiguous cases
export const AMBIGUOUS_CASES = new Map<string, (sourcePath?: string) => boolean>([
  // VideoData might be interface OR class - check source
  ['VideoData', (sourcePath) => {
    if (!sourcePath) return false;
    return sourcePath.includes('typings') || sourcePath.includes('types');
  }],
  
  // Data might be interface OR class
  ['Data', (sourcePath) => {
    if (!sourcePath) return false;
    return sourcePath.includes('models/data/Data');
  }],
  
  // Store might be type (DataStore) or runtime (useAuthStore)
  // This is handled by prefix patterns above
  
  // Context might be type or runtime
  ['AuthContext', () => false], // Likely runtime context
  ['AppContext', () => false], // Likely runtime context
  
  // Result might be type or class
  ['DataAnalysisResult', (sourcePath) => {
    if (!sourcePath) return false;
    return sourcePath.includes('DataAnalysisResult');
  }],
]);

