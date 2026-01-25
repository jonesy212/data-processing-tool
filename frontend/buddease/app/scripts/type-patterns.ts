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
    /Response$/,    // Includes: AxiosResponse
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
    /ReturnType$/,
    /Action$/,      // For Redux Toolkit - PayloadAction, Action
    /Reducer$/,     // For Redux Toolkit
    /Middleware$/,  // For Redux Toolkit
    /Observable$/,  // NEW: For MobX - IObservableArray, IObservableValue
  ],
  
  prefixes: [
    /^Base[A-Z]/,
    /^Default[A-Z]/,
    /^Snapshot[A-Z]/,
    /^Version[A-Z]/,
    /^Realtime[A-Z]/,
    /^T[A-Z]/,      // Generic types (TData, TEntity)
    /^I[A-Z]/,      // Interface naming convention (IUser)
    /^Axios[A-Z]/,  // AxiosResponse, AxiosError, AxiosRequestConfig
    /^Observable/,  // NEW: For MobX observable types
  ],
  
  fullMatch: [
    /^[A-Z][a-z]+[A-Z][a-z]+$/, // PascalCase multi-words
  ],
  
  exactMatches: new Set([
    // Your existing exact matches
    'TriggerIncentivesParams',
    'LogActivityParams',
    'BaseDataEntity',
    'DefaultExcludedFields', 
    'DefaultMeta',
    'Attachment',
    'Data',
    'Task',
    'Snapshot',
    'DetailsItem',
    'TaskEntity',
    
    // Redux Toolkit types
    'PayloadAction',
    'Action',
    'Reducer',
    'Middleware',
    'Store',
    'Dispatch',
    'ThunkAction',
    'AnyAction',
    'State',
    'Slice',
    'CaseReducer',
    'PrepareAction',
    'ActionCreatorWithPayload',
    'ActionCreatorWithoutPayload',
    'ActionCreatorWithPreparedPayload',
    'SerializableMiddleware',
    
    // MobX types
    'IObservableArray',
    'IObservableValue',
    'IObservableObject',
    'IReactionDisposer',
    'IAutorunOptions',
    'IReactionOptions',
    'IComputedValue',
    'IComputedValueOptions',
    'ObservableMap',
    'ObservableSet',
    'Reaction',
    'Autorun',
    'When',
    'Computed',
    
    // Axios types
    'AxiosResponse',
    'AxiosError',
    'AxiosRequestConfig',
    'AxiosInstance',
    'AxiosStatic',
    'AxiosPromise',
    'AxiosInterceptorManager',
  ]),
} as const;

export const VALUE_PATTERNS = {
  prefixes: [
    /^use[A-Z]/,        // React hooks (useAuthStore, useTaskManagerStore)
    /^create[A-Z]/,     // Factory functions (createSlice, createReducer, makeObservable)
    /^get[A-Z]/,        // Getter functions
    /^set[A-Z]/,        // Setter functions
    /^is[A-Z]/,         // Checker functions
    /^has[A-Z]/,        // Checker functions
    /^[a-z]/,           // lowercase usually values
    /^fetch[A-Z]/,      // Fetch functions
    /^update[A-Z]/,     // Update functions
    /^delete[A-Z]/,     // Delete functions
    /^add[A-Z]/,        // Add functions
    /^remove[A-Z]/,     // Remove functions
    /^configure[A-Z]/,  // configureStore
    /^combine[A-Z]/,    // combineReducers
    /^make[A-Z]/,       // NEW: MobX makeObservable, makeAutoObservable
    /^autorun/,         // NEW: MobX autorun
    /^reaction/,        // NEW: MobX reaction
    /^when/,            // NEW: MobX when
    /^computed/,        // NEW: MobX computed
    /^observable/,      // NEW: MobX observable (when used as function)
  ],
  
  suffixes: [
    /Api$/,
    /StoreClass$/,
    /Service$/,
    /Helper$/,
    /Util$/,
    /Utils$/,
    /Actions$/,     // ProjectActions, UIActions (these are runtime!)
    /Progress$/,    // TaskProgress, TeamProgress (React components)
    /Renderer$/,    // ContentRenderer (React component)
    /Button$/,      // ReusableButton (React component)
    /Store$/,       // NEW: BUT CAREFUL! ProjectStore, TaskStore are classes (runtime), but DataStore might be type
  ],
  
  exactMatches: new Set([
    // Your existing exact matches
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
    'AxiosError',
    'Router',
    'useRouter',
    'React',
    'useEffect',
    'useState',
    'Member',
    'Phase',
    'Project',
    'ProjectDetails',
    'Progress',
    'ExtendedRouter',
    'DataAnalysisResult',
    'Todo',
    'VideoData',
    
    // Redux Toolkit runtime exports
    'createSlice',
    'createReducer',
    'configureStore',
    'createAsyncThunk',
    'combineReducers',
    'createAction',
    'createEntityAdapter',
    'getDefaultMiddleware',
    
    // MobX runtime exports
    'observable',
    'makeObservable',
    'makeAutoObservable',
    'autorun',
    'reaction',
    'when',
    'computed',
    'action',
    'runInAction',
    'flow',
    'toJS',
    'isObservable',
    'isObservableArray',
    'isObservableObject',
    'isObservableMap',
    'isObservableSet',
    'isComputed',
    'isAction',
    
    // Your MobX stores (from architecture diagram)
    'RootStore',
    'ProjectStore',
    'TaskStore',
    'UserStore',
    'CalendarStore',
    'SnapshotStore',
    
    // Axios runtime exports
    'axios',
    'default',
    'create',
  ]),
} as const;

export const AMBIGUOUS_CASES = new Map<string, (sourcePath?: string) => boolean>([
  // Your existing ambiguous cases
  ['VideoData', (sourcePath) => {
    if (!sourcePath) return false;
    return sourcePath.includes('typings') || sourcePath.includes('types');
  }],
  
  ['Data', (sourcePath) => {
    if (!sourcePath) return false;
    return sourcePath.includes('models/data/Data');
  }],
  
  ['AuthContext', () => false],
  ['AppContext', () => false],
  
  ['DataAnalysisResult', (sourcePath) => {
    if (!sourcePath) return false;
    return sourcePath.includes('DataAnalysisResult');
  }],
  
  // AxiosError can be both a class (runtime) and a type
  ['AxiosError', (sourcePath) => {
    // When used as a type (in annotations), should be type import
    // When used as value (new AxiosError(), instanceof), should be regular import
    // Default to true (type) since it's more commonly used as a type
    return true;
  }],
  
  // Store is ambiguous - could be MobX class (runtime) or Redux type
  ['Store', (sourcePath) => {
    if (!sourcePath) return false;
    
    // If from Redux Toolkit, it's a type
    if (sourcePath.includes('@reduxjs/toolkit') || sourcePath.includes('redux')) {
      return true;
    }
    
    // If from MobX, it's usually a runtime class
    if (sourcePath.includes('mobx') || sourcePath.includes('store')) {
      return false;
    }
    
    // Default: assume it's a type
    return true;
  }],
  
  // Redux Toolkit ambiguous cases
  ['Dispatch', (sourcePath) => {
    if (!sourcePath) return false;
    // If from Redux Toolkit, it's a type
    return sourcePath.includes('@reduxjs/toolkit') || sourcePath.includes('redux');
  }],
  
  ['State', (sourcePath) => {
    if (!sourcePath) return false;
    // If from Redux Toolkit, it's a type
    return sourcePath.includes('@reduxjs/toolkit') || sourcePath.includes('redux');
  }],
  
  // Specific store names from your architecture
  ['ProjectStore', () => false],   // MobX class - runtime
  ['TaskStore', () => false],      // MobX class - runtime  
  ['UserStore', () => false],      // MobX class - runtime
  ['CalendarStore', () => false],  // MobX class - runtime
  ['SnapshotStore', () => false],  // MobX class - runtime
  ['RootStore', () => false],      // MobX class - runtime
  
  // MobX exports can be both
  ['observable', (sourcePath) => {
    // When used as type: import { observable } from 'mobx' (runtime)
    // When used in annotations: Observable<T> (type)
    if (!sourcePath) return false;
    
    // If it's "Observable" (capital O), it's a type
    if (sourcePath.includes('Observable<')) {
      return true;
    }
    
    // If from mobx package, it's a runtime function
    return false;
  }],
  
  ['computed', (sourcePath) => {
    // Similar to observable
    if (!sourcePath) return false;
    
    // If it's "Computed" (capital C), it's a type
    if (sourcePath.includes('Computed<')) {
      return true;
    }
    
    // If from mobx package, it's a runtime function
    return false;
  }],
  
  ['action', (sourcePath) => {
    if (!sourcePath) return false;
    
    // If from Redux Toolkit, often a type (Action)
    if (sourcePath.includes('@reduxjs/toolkit')) {
      return true;
    }
    
    // If from MobX, it's a runtime decorator/function
    if (sourcePath.includes('mobx')) {
      return false;
    }
    
    return true; // Default to type
  }],
]);