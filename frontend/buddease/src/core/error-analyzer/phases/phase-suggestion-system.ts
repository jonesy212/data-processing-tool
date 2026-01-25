// phase-suggestion-system.ts
// Main coordinator that delegates to specialized analyzers
import { ComponentPatternAnalyzer } from '@/core/generators/corrections/analyzers/ComponentPatternAnalyzer';
import { RelationshipAnalyzer } from './analyzers/RelationshipAnalyzer';

interface PhaseConfig {
  name: string;
  categories: string[];
  priority: number;
  enabled: boolean;
}

interface ErrorCategory {
  
    name: 'config' | 'api' | 'middleware' | 'redux' | 'mobx' | 'types' | 'imports' | 'stores';
  patterns: RegExp[];
  suggestionRules: SuggestionRule[];
  analyzer: BaseAnalyzer;
}

class PhaseSuggestionSystem {
  private phases: Map<string, Phase> = new Map();
  private config: SystemConfig;
  
  constructor() {
    this.initializePhases();
  }
  
    private initializePhases() {
        
        
        // Phase 1: Foundation - Config & Types (highest priority)
        this.phases.set('foundation', new Phase('foundation', 1, [
            new ConfigAnalyzer(),
            new ConfigurationValidator(),    // ✅ Your existing validator
            new FileStructureValidator(),    // ✅ Your existing validator
            new PackageJsonValidator(),      // ✅ Your existing validator
            new ImportAnalyzer(),            // ✅ Your existing analyzer
            new TypeDefinitionAnalyzer(),    // Additional analyzer
            new RelationshipAnalyzer() 
        ]));
  
    
    // Phase 2: State Layer - Redux & MobX

    this.phases.set('state', new Phase('state', 2, [
      new ReduxAnalyzer(),
      new MobXAnalyzer(),
      new StoreInterfaceAnalyzer()
    ]));
    
    // Phase 3: API & Middleware
    this.phases.set('data', new Phase('data', 3, [
    new MultiPlatformDirectoryValidator(), // ✅ Your existing validator
            
      new APIAnalyzer(),
      new MiddlewareAnalyzer()
    ]));
    
    // Phase 4: UI & Components
    this.phases.set('ui', new Phase('ui', 4, [
      new ComponentAnalyzer(),   // ✅ Pattern-aware component analysis
      new HookAnalyzer(),        // ✅ Hook best practices
      new CSSAnalyzer(),         // ✅ CSS coverage
      new ThemeAnalyzer(),       // ✅ Theme/branding validation
      new UIStoreAnalyzer(),     // ✅ UI store patterns
      new ComponentPatternAnalyzer() // ✅ Raw pattern data
    ]));
  }
  
  async analyze(options: AnalysisOptions) {
    // Run phases in order with progress tracking
    for (const [name, phase] of this.phases) {
      if (options.phase && options.phase !== name) continue;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📍 PHASE ${phase.priority}: ${name.toUpperCase()}`);
      console.log(`${'='.repeat(60)}`);
      
      await phase.execute(options);
      
      if (phase.hasCriticalErrors() && !options.continueOnError) {
        console.log(`\n❌ Phase ${name} has critical errors. Stopping.`);
        break;
      }
    }
  }
}