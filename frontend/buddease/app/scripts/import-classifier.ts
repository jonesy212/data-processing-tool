// import-classifier.ts
import { TYPE_PATTERNS, VALUE_PATTERNS, AMBIGUOUS_CASES } from '@/app/scripts/type-patterns'

interface ImportClassifierConfig {
  typePatterns: Array<string | RegExp>;
  valuePatterns: Array<string | RegExp>;
  forceType: string[];
  forceValue: string[];
}

const DEFAULT_CONFIG: ImportClassifierConfig = {
  typePatterns: [
    'Entity$', 'Data$', 'Config$', 'Store$', 'Props$', 'Options$',
    'Manager$', 'Type$', 'Interface$', 'State$', 'Meta$', 'Payload$',
    'Event$', 'Category$', 'Version$', 'Snapshot$', 'Attachment$',
    'Collection$', 'Item$', 'Field$', '^Base[A-Z]', '^Default[A-Z]',
    '^Snapshot[A-Z]', '^Version[A-Z]', '^Realtime[A-Z]',
    '^[A-Z][a-z]+[A-Z][a-z]+$', /name$/i, '^Subscription$',
    'Subscription$', 'Processing$', 'Result$', 'Feedback$',
    'Model$', 'Response$', 'Request$', 'Context$', 'Handler$',
    'Callback$', 'Collection$', 'Level$', 'Details$', 'Properties$',
    'Enum$', 'Params$', 'Analysis$', 'Definition$', 'Transition$',
    'Parameters$', 'ReturnType$', '^T[A-Z]'
  ],
  
  valuePatterns: [
    '^use[A-Z]', '^create[A-Z]', '^get[A-Z]', '^set[A-Z]',
    '^is[A-Z]', '^has[A-Z]', '^[a-z]', 'Service$', 'Api$',
    'StoreClass$', 'Utils$', 'Helper$', '^Content$',
    '^fetch[A-Z]', '^update[A-Z]', '^delete[A-Z]', '^add[A-Z]',
    '^remove[A-Z]', '^Pool$', '^Client$', '^Connection$',
    '^Database$', '^Query$', '^Transaction$', /^logger$/i,
    /^console$/i, /^process$/i, /^window$/i, /^document$/i,
    /^navigator$/i
  ],
  
  forceType: ['TriggerIncentivesParams', 'LogActivityParams'],
  forceValue: ['dataProcessingService']
};


/**
 * Enhanced version with known types tracking for better accuracy
 */
export function createTypeChecker(knownTypes: Set<string> = new Set()) {
  return function shouldBeTypeOnlyWithCache(
    importName: string, 
    filePath: string, 
    source: string
  ): boolean {
    // First check if it's in our known types cache
    if (knownTypes.has(importName)) {
      return true;
    }

    // Run the regular check
    const result = shouldBeTypeOnly(importName, filePath, source);
    
    // Cache the result if it's a type
    if (result) {
      knownTypes.add(importName);
    }
    
    return result;
  };
}

/**
 * Bulk check for multiple imports from the same source
 * More efficient when processing many imports
 */
export function classifyImports(
  importNames: string[],
  filePath: string,
  source: string
): { typeOnly: string[]; value: string[] } {
  const typeOnly: string[] = [];
  const value: string[] = [];
  
  for (const name of importNames) {
    if (shouldBeTypeOnly(name, filePath, source)) {
      typeOnly.push(name);
    } else {
      value.push(name);
    }
  }
  
  return { typeOnly, value };
}

// Helper to check if source module likely exports only types
export function isTypeOnlyModule(source: string): boolean {
  // Type declaration files
  if (source.endsWith('.d.ts')) {
    return true;
  }
  
  // DefinitelyTyped packages
  if (source.includes('@types/')) {
    return true;
  }
  
  // Common type-only directories
  const typeOnlyPatterns = [
    /\/types?\//,          // /types/ or /type/ directory
    /\/@types\//,          // Scoped types directory
    /-types$/,             // Package ends with -types
    /\.types$/,            // File ends with .types
    /\/interfaces\//,      // /interfaces/ directory
  ];
  
  return typePatterns.some(pattern => pattern.test(source));
}




/**
 * Bulk classification with pattern-based detection
 */
export function classifyImportsWithPatterns(
  importNames: string[],
  filePath: string,
  sourcePath: string,
  checker = shouldBeTypeOnly
): { typeOnly: string[]; value: string[] } {
  const typeOnly: string[] = [];
  const value: string[] = [];
  
  for (const name of importNames) {
    if (checker(name, filePath, sourcePath)) {
      typeOnly.push(name);
    } else {
      value.push(name);
    }
  }
  
  return { typeOnly, value };
}

/**
 * Module-level type analysis
 */
export function analyzeModuleImports(
  statements: ImportStatement[],
  filePath: string
): {
  typeImports: Set<string>;
  valueImports: Set<string>;
  ambiguousImports: Map<string, string>;
} {
  const typeImports = new Set<string>();
  const valueImports = new Set<string>();
  const ambiguousImports = new Map<string, string>();
  
  const checker = createCachedTypeChecker();
  
  for (const stmt of statements) {
    if (!stmt.source) continue;
    
    const resolvedSource = resolveSourcePath(stmt.source, filePath);
    
    for (const spec of stmt.specifiers) {
      const isType = checker(spec.importedName, filePath, resolvedSource);
      
      if (isType) {
        typeImports.add(spec.importedName);
      } else {
        valueImports.add(spec.importedName);
      }
      
      // Track ambiguous cases
      const typePattern = TYPE_PATTERNS.suffixes.some(p => p.test(spec.importedName)) ||
                          TYPE_PATTERNS.prefixes.some(p => p.test(spec.importedName));
                          
      const valuePattern = VALUE_PATTERNS.suffixes.some(p => p.test(spec.importedName)) ||
                           VALUE_PATTERNS.prefixes.some(p => p.test(spec.importedName));
      
      if (typePattern && valuePattern) {
        ambiguousImports.set(spec.importedName, `Matches both type and value patterns: ${spec.importedName}`);
      }
    }
  }
  
  return { typeImports, valueImports, ambiguousImports };
}

/**
 * Check if source module likely exports types
 */
function isLikelyTypeSource(sourcePath: string): boolean {
  if (!sourcePath) return false;
  
  // Type declaration files
  if (sourcePath.endsWith('.d.ts')) {
    return true;
  }
  
  // DefinitelyTyped packages
  if (sourcePath.includes('@types/')) {
    return true;
  }
  
  // Common type directories
  const typeSourcePatterns = [
    /\/types?\//,
    /\/@types\//,
    /-types$/,
    /\.types$/,
    /\/interfaces\//,
    /\/typings\//,
    /\/models\//,       // Model directories often contain types
    /\/entities\//,     // Entity directories
    /\/schemas\//,      // Schema directories
  ];
  
  return typeSourcePatterns.some(pattern => pattern.test(sourcePath));
}


/**
 * Type detection by naming convention with source context
 */
export function isLikelyTypeByConvention(name: string, sourcePath: string): boolean {
  // TypeScript convention: types/interfaces start with uppercase
  if (!/^[A-Z]/.test(name)) {
    return false;
  }

  // Common non-type uppercase names
  const commonRuntimeUppercase = new Set([
    // React hooks
    'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback',
    'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue',
    
    // React components/APIs
    'Component', 'PureComponent', 'Fragment', 'StrictMode', 'Suspense',
    'lazy', 'memo', 'createElement', 'cloneElement', 'isValidElement',
    'Children', 'createContext', 'forwardRef', 'createRef',
    
    // Redux Toolkit runtime
    'createSlice', 'createReducer', 'configureStore', 'createAsyncThunk',
    'combineReducers', 'createAction', 'createEntityAdapter',
    
    // MobX runtime
    'observable', 'makeObservable', 'makeAutoObservable', 'autorun',
    'reaction', 'when', 'computed', 'action', 'runInAction',
    
    // Your custom runtime (add more as needed)
    'ProjectStore', 'TaskStore', 'UserStore', 'CalendarStore',
    'SnapshotStore', 'RootStore',
  ]);

  if (commonRuntimeUppercase.has(name)) {
    return false;
  }

  // Check source context
  if (isLikelyTypeSource(sourcePath)) {
    return true;
  }

  // Default: assume uppercase is a type (TypeScript convention)
  return true;
}

/**
 * Cached version for better performance
 */
export function createCachedTypeChecker() {
  const cache = new Map<string, boolean>();
  const knownTypes = new Set<string>();
  const knownValues = new Set<string>();

  // Initialize with your exact matches
  TYPE_PATTERNS.exactMatches.forEach(type => knownTypes.add(type));
  VALUE_PATTERNS.exactMatches.forEach(value => knownValues.add(value));

  return function cachedShouldBeTypeOnly(
    importName: string,
    filePath: string,
    sourcePath: string = ''
  ): boolean {
    const cacheKey = `${importName}::${sourcePath}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    // Quick checks
    if (knownTypes.has(importName)) {
      cache.set(cacheKey, true);
      return true;
    }
    
    if (knownValues.has(importName)) {
      cache.set(cacheKey, false);
      return false;
    }

    // Full check
    const result = shouldBeTypeOnly(importName, filePath, sourcePath);
    
    // Update caches
    cache.set(cacheKey, result);
    if (result) {
      knownTypes.add(importName);
    } else {
      knownValues.add(importName);
    }
    
    return result;
  };
}

export class ImportClassifier {
  private typePatterns: RegExp[];
  private valuePatterns: RegExp[];
  private forceType: Set<string>;
  private forceValue: Set<string>;
  
  constructor(config: Partial<ImportClassifierConfig> = {}) {
    const merged = { ...DEFAULT_CONFIG, ...config };
    
    this.typePatterns = merged.typePatterns.map(p => 
      typeof p === 'string' ? new RegExp(p) : p
    );
    
    this.valuePatterns = merged.valuePatterns.map(p => 
      typeof p === 'string' ? new RegExp(p) : p
    );
    
    this.forceType = new Set(merged.forceType);
    this.forceValue = new Set(merged.forceValue);
  }
  
  shouldBeTypeImport(name: string): boolean {
    // Handle single-letter type parameters FIRST (before other checks)
    if (name.length === 1 && /^[A-Z]$/.test(name)) {
      console.log(`   ✅ "${name}" is a single capital letter (generic type parameter)`);
      return true; // Single capital letters like K, T, V are ALWAYS types
    }
    // Check forced classifications first
    if (this.forceType.has(name)) return true;
    if (this.forceValue.has(name)) return false;
    // Check patterns
    const isType = this.typePatterns.some(pattern => pattern.test(name));
    const isValue = this.valuePatterns.some(pattern => pattern.test(name));
    
    return isType && !isValue;
  }
  
  // Add patterns at runtime if needed
  addTypePattern(pattern: RegExp | string): void {
    this.typePatterns.push(typeof pattern === 'string' ? new RegExp(pattern) : pattern);
  }
  
  addValuePattern(pattern: RegExp | string): void {
    this.valuePatterns.push(typeof pattern === 'string' ? new RegExp(pattern) : pattern);
  }
}

// Singleton instance
export const classifier = new ImportClassifier();