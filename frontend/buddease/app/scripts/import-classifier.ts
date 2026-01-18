// import-classifier.ts
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