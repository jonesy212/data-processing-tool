#!/usr/bin/env tsx
// ProjectPhaseWorkflowManager.ts
// Integrated with generateRoadmaps for comprehensive project management

import type { WorkflowTransition, TransitionEvaluationContext } from '@/core/typings/workflows/WorkflowTransition';
import type { FixResult, TypeImportError } from '@/app/scripts/types/import-fixes';
import type { ProjectPhase, TeamAllocation } from '@/core/models/phases/PhaseManager';
import type { CryptoPortfolioMetrics } from '@/core/crypto/PortfolioManager';
import type { ProjectStructure, DomainStructure } from '@/core/scripts/generateRoadmaps';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Import the roadmap generator
import { generateRoadmaps, categorizeProjectStructure } from '@/core/scripts/generateRoadmaps';

// ========== TYPES ==========
export interface PhaseWorkflowTransition extends WorkflowTransition {
  phaseCategory: 'discovery' | 'planning' | 'execution' | 'review' | 'deployment';
  roadmapRequirements: RoadmapRequirements;
  dependencies: string[]; // Other workflow IDs that must complete first
  deliverables: Deliverable[];
  successMetrics: PhaseSuccessMetrics;
  integrationPoints: IntegrationPoint[];
}

export interface RoadmapRequirements {
  requiredComponents: number;
  requiredApis: number;
  requiredTypes: number;
  complexityLevel: 'simple' | 'moderate' | 'complex';
  teamSkills: string[];
  estimatedTime: number; // minutes
}

export interface Deliverable {
  name: string;
  type: 'code' | 'documentation' | 'test' | 'integration' | 'deployment';
  acceptanceCriteria: string[];
  validationScript?: string;
}

export interface PhaseSuccessMetrics {
  codeCoverage: number;
  testPassRate: number;
  performanceTargets: PerformanceTarget[];
  userAcceptance: number;
}

export interface PerformanceTarget {
  metric: string;
  target: number;
  unit: string;
}

export interface IntegrationPoint {
  system: string;
  api: string;
  dataFlow: string;
  authentication: string;
}

export interface WorkflowContext {
  projectId: string;
  phase: ProjectPhase;
  team: TeamAllocation[];
  cryptoMetrics?: CryptoPortfolioMetrics;
  roadmap?: ProjectStructure;
  domainStructure?: DomainStructure;
  timeline: {
    start: Date;
    deadline: Date;
    estimatedCompletion: Date;
  };
}

// ========== INTEGRATED WORKFLOW DEFINITIONS ==========
export const projectWorkflows: Record<string, PhaseWorkflowTransition> = {
  // 🗺️ Phase 0: Roadmap Generation
  'phase-0-roadmap': {
    id: 'phase-0-roadmap',
    name: 'Project Roadmap Generation',
    description: 'Generate comprehensive roadmap based on project analysis',
    
    fromStepId: 'init',
    toStepId: 'roadmap-complete',
    
    phaseCategory: 'discovery',
    
    roadmapRequirements: {
      requiredComponents: 0,
      requiredApis: 0,
      requiredTypes: 0,
      complexityLevel: 'simple',
      teamSkills: ['analysis', 'documentation'],
      estimatedTime: 10
    },
    
    dependencies: [],
    
    deliverables: [
      {
        name: 'Developer Roadmap',
        type: 'documentation',
        acceptanceCriteria: ['Includes all project components', 'Categorizes by domain', 'Provides implementation phases']
      },
      {
        name: 'Non-technical Roadmap',
        type: 'documentation',
        acceptanceCriteria: ['Executive summary', 'Feature overview', 'Timeline estimates']
      },
      {
        name: 'Package Recommendations',
        type: 'documentation',
        acceptanceCriteria: ['Frontend packages', 'Backend packages', 'Dependency analysis']
      }
    ],
    
    successMetrics: {
      codeCoverage: 0,
      testPassRate: 0,
      performanceTargets: [
        { metric: 'Analysis Time', target: 120, unit: 'seconds' },
        { metric: 'Documentation Quality', target: 90, unit: 'percentage' }
      ],
      userAcceptance: 85
    },
    
    integrationPoints: [
      {
        system: 'Project Analyzer',
        api: 'ProjectTreeAnalyzer',
        dataFlow: 'Project Structure → Roadmap Documents',
        authentication: 'File System'
      }
    ],
    
    preTransitionActions: [
      {
        type: 'execute_script',
        target: 'roadmap-generation',
        payload: { command: 'pnpm generate:roadmaps --prompt="Project analysis for workflow planning"' }
      }
    ],
    
    postTransitionActions: [
      {
        type: 'create_task',
        target: 'team',
        payload: { title: 'Review Generated Roadmaps', assignee: 'team-lead' }
      },
      {
        type: 'track_progress',
        target: 'roadmap',
        payload: { percentage: 100 }
      }
    ],
    
    uiConfig: {
      buttonLabel: '🗺️ Generate Roadmap',
      buttonIcon: 'map',
      colors: {
        button: '#4A90E2',
        buttonHover: '#357ABD',
        text: '#ffffff'
      },
      progressDisplay: {
        showProgressBar: true,
        showPercentage: true,
        successAnimation: 'fade'
      }
    },
    
    priority: 0,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    tags: ['roadmap', 'analysis', 'planning']
  },

  // 🔍 Phase 1: Discovery & Analysis
  'phase-1-discovery': {
    id: 'phase-1-discovery',
    name: 'Project Discovery & Scoping',
    description: 'Analyze project structure using roadmap data',
    
    fromStepId: 'roadmap-complete',
    toStepId: 'analysis-complete',
    
    phaseCategory: 'discovery',
    
    roadmapRequirements: {
      requiredComponents: 0,
      requiredApis: 0,
      requiredTypes: 0,
      complexityLevel: 'moderate',
      teamSkills: ['analysis', 'planning', 'estimation'],
      estimatedTime: 30
    },
    
    dependencies: ['phase-0-roadmap'],
    
    deliverables: [
      {
        name: 'Type Error Analysis',
        type: 'analysis',
        acceptanceCriteria: ['Error count', 'Error categorization', 'Complexity assessment'],
        validationScript: 'pnpm check:types:count'
      },
      {
        name: 'Team Allocation Plan',
        type: 'documentation',
        acceptanceCriteria: ['Role assignments', 'Skill matching', 'Time estimates']
      }
    ],
    
    successMetrics: {
      codeCoverage: 0,
      testPassRate: 0,
      performanceTargets: [
        { metric: 'Analysis Accuracy', target: 95, unit: 'percentage' },
        { metric: 'Time to Analysis', target: 1800, unit: 'seconds' }
      ],
      userAcceptance: 90
    },
    
    integrationPoints: [
      {
        system: 'Roadmap System',
        api: 'categorizeProjectStructure',
        dataFlow: 'Roadmap → Domain Structure → Analysis',
        authentication: 'Module Import'
      }
    ],
    
    preTransitionActions: [
      {
        type: 'execute_script',
        target: 'analysis',
        payload: { command: 'pnpm check:types:count' }
      },
      {
        type: 'ui_action',
        target: 'dashboard',
        payload: { 
          showToast: {
            message: 'Starting project discovery analysis',
            type: 'info',
            duration: 3000
          }
        }
      }
    ],
    
    postTransitionActions: [
      {
        type: 'create_task',
        target: 'team',
        payload: { title: 'Review Analysis Report', assignee: 'team-lead' }
      }
    ],
    
    uiConfig: {
      buttonLabel: '🔍 Start Discovery',
      buttonIcon: 'search',
      colors: {
        button: '#4CAF50',
        buttonHover: '#45a049',
        text: '#ffffff'
      }
    },
    
    priority: 1,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    tags: ['discovery', 'analysis', 'planning']
  },

  // 📋 Phase 2: Planning with Roadmap Data
  'phase-2-planning': {
    id: 'phase-2-planning',
    name: 'Roadmap-Based Planning',
    description: 'Create detailed plans using roadmap insights',
    
    fromStepId: 'analysis-complete',
    toStepId: 'planning-complete',
    
    phaseCategory: 'planning',
    
    roadmapRequirements: {
      requiredComponents: 10,
      requiredApis: 5,
      requiredTypes: 15,
      complexityLevel: 'moderate',
      teamSkills: ['architecture', 'planning', 'roadmapping'],
      estimatedTime: 45
    },
    
    dependencies: ['phase-0-roadmap', 'phase-1-discovery'],
    
    deliverables: [
      {
        name: 'Phase Implementation Plan',
        type: 'documentation',
        acceptanceCriteria: ['Phase definitions', 'Dependency mapping', 'Timeline estimates']
      },
      {
        name: 'Team Sprint Planning',
        type: 'documentation',
        acceptanceCriteria: ['Sprint goals', 'Task breakdown', 'Resource allocation']
      },
      {
        name: 'Risk Assessment',
        type: 'analysis',
        acceptanceCriteria: ['Risk identification', 'Mitigation strategies', 'Contingency plans']
      }
    ],
    
    successMetrics: {
      codeCoverage: 0,
      testPassRate: 0,
      performanceTargets: [
        { metric: 'Plan Completeness', target: 95, unit: 'percentage' },
        { metric: 'Stakeholder Alignment', target: 90, unit: 'percentage' }
      ],
      userAcceptance: 85
    },
    
    integrationPoints: [
      {
        system: 'Roadmap Domain Structure',
        api: 'DomainStructure interface',
        dataFlow: 'Domain Categories → Phase Planning',
        authentication: 'Type Safety'
      }
    ],
    
    preTransitionActions: [
      {
        type: 'track_progress',
        target: 'planning',
        payload: { 
          message: 'Analyzing roadmap for planning...',
          metrics: { roadmapComponents: 0, roadmapApis: 0 }
        }
      }
    ],
    
    phaseManagerConfig: {
      usePhaseManager: true,
      autoAdvance: false,
      backupEnabled: true,
      rollbackOnError: true,
      transitionRules: {
        requireAllDependencies: true,
        validatePhaseState: true
      }
    },
    
    uiConfig: {
      buttonLabel: '📋 Create Plan',
      buttonIcon: 'clipboard',
      colors: {
        button: '#FF9800',
        buttonHover: '#F57C00',
        text: '#ffffff'
      },
      visualFeedback: {
        showProgress: true,
        confirmationRequired: true
      }
    },
    
    priority: 2,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    tags: ['planning', 'roadmap', 'architecture']
  },

  // 🚀 Phase 3: Execution with Type Fixes
  'phase-3-execution': {
    id: 'phase-3-execution',
    name: 'Development Execution',
    description: 'Execute development tasks including type fixes',
    
    fromStepId: 'planning-complete',
    toStepId: 'execution-complete',
    
    phaseCategory: 'execution',
    
    roadmapRequirements: {
      requiredComponents: 0,
      requiredApis: 0,
      requiredTypes: 0,
      complexityLevel: 'complex',
      teamSkills: ['development', 'testing', 'code-review'],
      estimatedTime: 120
    },
    
    dependencies: ['phase-2-planning'],
    
    deliverables: [
      {
        name: 'Code Implementation',
        type: 'code',
        acceptanceCriteria: ['TypeScript compliance', 'Test coverage', 'Code review passed'],
        validationScript: 'pnpm test:types && pnpm test:coverage'
      },
      {
        name: 'Type Import Fixes',
        type: 'code',
        acceptanceCriteria: ['Zero type import errors', 'Proper import separation', 'Backup created'],
        validationScript: 'pnpm check:types:count'
      }
    ],
    
    successMetrics: {
      codeCoverage: 80,
      testPassRate: 95,
      performanceTargets: [
        { metric: 'Type Error Resolution', target: 100, unit: 'percentage' },
        { metric: 'Build Success Rate', target: 100, unit: 'percentage' }
      ],
      userAcceptance: 90
    },
    
    integrationPoints: [
      {
        system: 'Type Import Fixer',
        api: 'unified-type-import-fixer',
        dataFlow: 'Type Errors → Automated Fixes → Verification',
        authentication: 'Command Line'
      }
    ],
    
    preTransitionActions: [
      {
        type: 'send_notification',
        target: 'team',
        payload: { 
          message: 'Starting development execution phase',
          channel: '#development'
        }
      }
    ],
    
    progressTracking: {
      enabled: true,
      trackPerformance: true,
      trackUIMetrics: true,
      trackErrors: true,
      successThreshold: 85,
      timeoutWarning: 300000, // 5 minutes
      autoRetry: true,
      maxRetries: 3
    },
    
    uiConfig: {
      buttonLabel: '🚀 Execute Development',
      buttonIcon: 'rocket',
      colors: {
        button: '#F44336',
        buttonHover: '#D32F2F',
        text: '#ffffff'
      },
      visualFeedback: {
        showProgress: true,
        confirmationRequired: true,
        confirmationMessage: 'This will execute development tasks. Proceed?'
      }
    },
    
    priority: 3,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    tags: ['execution', 'development', 'type-fixes']
  },

  // 🧪 Phase 4: Quality Assurance
  'phase-4-qa': {
    id: 'phase-4-qa',
    name: 'Quality Assurance & Testing',
    description: 'Comprehensive testing and quality checks',
    
    fromStepId: 'execution-complete',
    toStepId: 'qa-complete',
    
    phaseCategory: 'review',
    
    roadmapRequirements: {
      requiredComponents: 0,
      requiredApis: 0,
      requiredTypes: 0,
      complexityLevel: 'moderate',
      teamSkills: ['testing', 'qa', 'automation'],
      estimatedTime: 60
    },
    
    dependencies: ['phase-3-execution'],
    
    deliverables: [
      {
        name: 'Test Results',
        type: 'test',
        acceptanceCriteria: ['All tests passing', 'Coverage targets met', 'Performance benchmarks'],
        validationScript: 'pnpm test:coverage'
      },
      {
        name: 'Quality Report',
        type: 'documentation',
        acceptanceCriteria: ['Bug report', 'Performance metrics', 'Security assessment']
      }
    ],
    
    successMetrics: {
      codeCoverage: 90,
      testPassRate: 100,
      performanceTargets: [
        { metric: 'Test Coverage', target: 90, unit: 'percentage' },
        { metric: 'Bug Discovery Rate', target: 95, unit: 'percentage' }
      ],
      userAcceptance: 95
    },
    
    integrationPoints: [
      {
        system: 'Testing Framework',
        api: 'vitest/jest',
        dataFlow: 'Code → Tests → Reports',
        authentication: 'Test Runner'
      }
    ],
    
    preTransitionActions: [
      {
        type: 'execute_script',
        target: 'testing',
        payload: { command: 'pnpm test:run' }
      }
    ],
    
    uiConfig: {
      buttonLabel: '🧪 Run QA',
      buttonIcon: 'flask',
      colors: {
        button: '#9C27B0',
        buttonHover: '#7B1FA2',
        text: '#ffffff'
      }
    },
    
    priority: 4,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    tags: ['qa', 'testing', 'review']
  },

  // 🚢 Phase 5: Deployment
  'phase-5-deployment': {
    id: 'phase-5-deployment',
    name: 'Deployment & Delivery',
    description: 'Deploy to production and deliver to users',
    
    fromStepId: 'qa-complete',
    toStepId: 'deployment-complete',
    
    phaseCategory: 'deployment',
    
    roadmapRequirements: {
      requiredComponents: 0,
      requiredApis: 0,
      requiredTypes: 0,
      complexityLevel: 'complex',
      teamSkills: ['devops', 'deployment', 'monitoring'],
      estimatedTime: 90
    },
    
    dependencies: ['phase-4-qa'],
    
    deliverables: [
      {
        name: 'Deployment Package',
        type: 'deployment',
        acceptanceCriteria: ['Build artifacts', 'Deployment scripts', 'Environment configuration'],
        validationScript: 'pnpm build:all'
      },
      {
        name: 'User Documentation',
        type: 'documentation',
        acceptanceCriteria: ['User guides', 'API documentation', 'Release notes']
      }
    ],
    
    successMetrics: {
      codeCoverage: 0,
      testPassRate: 100,
      performanceTargets: [
        { metric: 'Deployment Success Rate', target: 100, unit: 'percentage' },
        { metric: 'Rollback Time', target: 300, unit: 'seconds' }
      ],
      userAcceptance: 100
    },
    
    integrationPoints: [
      {
        system: 'CI/CD Pipeline',
        api: 'GitHub Actions/AWS',
        dataFlow: 'Code → Build → Deploy → Monitor',
        authentication: 'OAuth/API Keys'
      }
    ],
    
    preTransitionActions: [
      {
        type: 'execute_script',
        target: 'build',
        payload: { command: 'pnpm build:all' }
      }
    ],
    
    phaseManagerConfig: {
      usePhaseManager: true,
      backupEnabled: true,
      rollbackOnError: true,
      maxRetries: 2,
      notifications: {
        onPhaseStart: true,
        onPhaseComplete: true,
        onError: true,
        onRollback: true
      }
    },
    
    uiConfig: {
      buttonLabel: '🚢 Deploy',
      buttonIcon: 'ship',
      colors: {
        button: '#00BCD4',
        buttonHover: '#0097A7',
        text: '#ffffff'
      },
      visualFeedback: {
        showProgress: true,
        confirmationRequired: true,
        confirmationMessage: 'Deploy to production?'
      }
    },
    
    priority: 5,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    tags: ['deployment', 'delivery', 'production']
  }
};

// ========== INTEGRATED WORKFLOW MANAGER ==========
export class ProjectPhaseWorkflowManager {
  private currentPhase: string = 'phase-0-roadmap';
  private workflowHistory: string[] = [];
  private metrics: Record<string, any> = {};
  private teamAllocation: TeamAllocation[] = [];
  private roadmapData: ProjectStructure | null = null;
  private domainStructure: DomainStructure | null = null;
  
  constructor(private context: WorkflowContext) {
    this.initializeMetrics();
  }
  
  private initializeMetrics() {
    this.metrics = {
      startTime: new Date(),
      phasesCompleted: 0,
      deliverablesCompleted: 0,
      timeSaved: 0,
      roadmapGenerated: false,
      cryptoIntegration: this.context.cryptoMetrics ? 'enabled' : 'disabled'
    };
  }
  
  async analyzeAndPlan(): Promise<ProjectAnalysis> {
    console.log('🗺️ Starting Comprehensive Project Analysis');
    console.log('='.repeat(60));
    
    // Step 1: Generate roadmap
    await this.generateRoadmap();
    
    // Step 2: Analyze project structure
    const analysis = await this.analyzeProjectStructure();
    
    // Step 3: Create phase recommendations
    const recommendations = this.createPhaseRecommendations(analysis);
    
    // Step 4: Generate comprehensive report
    this.generateIntegratedReport(analysis, recommendations);
    
    return { ...analysis, recommendations };
  }
  
  private async generateRoadmap(): Promise<void> {
    console.log('📋 Generating project roadmap...');
    
    try {
      const { projectStructure } = await generateRoadmaps(
        'Project analysis for workflow planning',
        './workflow-roadmaps'
      );
      
      this.roadmapData = projectStructure;
      this.domainStructure = categorizeProjectStructure(projectStructure);
      this.metrics.roadmapGenerated = true;
      
      console.log('✅ Roadmap generated with:');
      console.log(`   - ${projectStructure.components.length} components`);
      console.log(`   - ${projectStructure.interfaces.length} interfaces`);
      console.log(`   - ${projectStructure.apis.length} APIs`);
      
    } catch (error) {
      console.error('❌ Failed to generate roadmap:', error);
      throw new Error('Roadmap generation failed');
    }
  }
  
  private async analyzeProjectStructure(): Promise<ProjectAnalysis> {
    if (!this.roadmapData || !this.domainStructure) {
      throw new Error('Roadmap data not available');
    }
    
    console.log('🔍 Analyzing project structure...');
    
    // Get error count
    const errorCount = this.getErrorCount();
    this.metrics.totalErrors = errorCount;
    
    // Analyze based on roadmap categories
    const categories = this.analyzeRoadmapCategories();
    
    // Calculate complexity
    const complexity = this.calculateComplexity();
    
    const analysis: ProjectAnalysis = {
      errorCount,
      categories,
      complexity,
      roadmapStats: {
        totalComponents: this.roadmapData.components.length,
        totalInterfaces: this.roadmapData.interfaces.length,
        totalApis: this.roadmapData.apis.length
      },
      domainStructure: this.domainStructure,
      estimatedTime: this.calculateTimeEstimate(),
      teamRequirements: this.calculateTeamRequirements(),
      riskAssessment: this.assessRisk(),
      cryptoReady: !!this.context.cryptoMetrics
    };
    
    return analysis;
  }
  
  private analyzeRoadmapCategories(): ErrorCategories {
    if (!this.domainStructure) {
      return { namespace: 0, typeOnly: 0, mixed: 0, complex: 0 };
    }
    
    // Analyze domain structure for type patterns
    const categories: ErrorCategories = {
      namespace: 0,
      typeOnly: 0,
      mixed: 0,
      complex: 0
    };
    
    // Count interfaces by type patterns
    this.domainStructure.shared.types.forEach(type => {
      if (type.name.includes('*') || type.name.includes('Namespace')) {
        categories.namespace++;
      } else if (type.name.match(/Props|Config|Options|Settings$/)) {
        categories.typeOnly++;
      } else {
        categories.complex++;
      }
    });
    
    return categories;
  }
  
  private calculateComplexity(): ProjectComplexity {
    if (!this.roadmapData) {
      return { level: 'simple', factors: [] };
    }
    
    const factors: string[] = [];
    let score = 0;
    
    // Component complexity
    if (this.roadmapData.components.length > 50) {
      score += 2;
      factors.push('Large component library');
    }
    
    // Interface complexity
    if (this.roadmapData.interfaces.length > 100) {
      score += 3;
      factors.push('Complex type system');
    }
    
    // API complexity
    if (this.roadmapData.apis.length > 20) {
      score += 2;
      factors.push('Extensive API surface');
    }
    
    let level: 'simple' | 'moderate' | 'complex' = 'simple';
    if (score >= 5) level = 'complex';
    else if (score >= 2) level = 'moderate';
    
    return { level, factors, score };
  }
  
  private calculateTimeEstimate(): TimeEstimate {
    if (!this.roadmapData) {
      return { optimistic: 0, realistic: 0, pessimistic: 0 };
    }
    
    const baseHours = this.roadmapData.components.length * 0.5 + // 30 min per component
                     this.roadmapData.interfaces.length * 0.25 + // 15 min per interface
                     this.roadmapData.apis.length * 1; // 1 hour per API
    
    return {
      optimistic: Math.round(baseHours * 0.8),
      realistic: Math.round(baseHours),
      pessimistic: Math.round(baseHours * 1.5)
    };
  }
  
  private calculateTeamRequirements(): TeamRequirement[] {
    if (!this.domainStructure) {
      return [];
    }
    
    const requirements: TeamRequirement[] = [];
    
    // Frontend team based on components
    if (this.domainStructure.frontend.uiComponents.length > 0) {
      requirements.push({
        role: 'frontend-developer',
        count: Math.ceil(this.domainStructure.frontend.uiComponents.length / 10),
        duration: Math.ceil(this.domainStructure.frontend.uiComponents.length * 0.5)
      });
    }
    
    // Backend team based on APIs
    if (this.domainStructure.backend.apiEndpoints.length > 0) {
      requirements.push({
        role: 'backend-developer',
        count: Math.ceil(this.domainStructure.backend.apiEndpoints.length / 5),
        duration: Math.ceil(this.domainStructure.backend.apiEndpoints.length * 1)
      });
    }
    
    // QA team
    requirements.push({
      role: 'qa-engineer',
      count: 1,
      duration: Math.ceil((requirements.reduce((sum, req) => sum + req.duration, 0) * 0.3))
    });
    
    return requirements;
  }
  
  private createPhaseRecommendations(analysis: ProjectAnalysis): PhaseRecommendation[] {
    const recommendations: PhaseRecommendation[] = [];
    
    // Always start with roadmap
    recommendations.push({
      phaseId: 'phase-0-roadmap',
      reason: 'Foundation for all planning',
      priority: 'critical'
    });
    
    // Add discovery if we have errors
    if (analysis.errorCount > 0) {
      recommendations.push({
        phaseId: 'phase-1-discovery',
        reason: `${analysis.errorCount} type issues to resolve`,
        priority: 'high'
      });
    }
    
    // Add planning based on roadmap complexity
    if (analysis.complexity.level !== 'simple') {
      recommendations.push({
        phaseId: 'phase-2-planning',
        reason: `Complex project requires detailed planning`,
        priority: 'high'
      });
    }
    
    // Execution phase
    recommendations.push({
      phaseId: 'phase-3-execution',
      reason: 'Core development work',
      priority: 'critical'
    });
    
    // QA phase
    recommendations.push({
      phaseId: 'phase-4-qa',
      reason: 'Quality assurance',
      priority: 'high'
    });
    
    // Deployment phase
    recommendations.push({
      phaseId: 'phase-5-deployment',
      reason: 'Production delivery',
      priority: 'high'
    });
    
    return recommendations;
  }
  
  private generateIntegratedReport(analysis: ProjectAnalysis, recommendations: PhaseRecommendation[]): void {
    const reportDir = '.workflow-reports';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const report = `
# Integrated Project Analysis & Roadmap
## Generated: ${new Date().toISOString()}

## 📊 Executive Summary
- **Project Complexity**: ${analysis.complexity.level} (score: ${analysis.complexity.score})
- **Type Issues**: ${analysis.errorCount} errors
- **Roadmap Components**: ${analysis.roadmapStats.totalComponents}
- **Time Estimate**: ${analysis.estimatedTime.realistic} hours

## 🗺️ Roadmap Analysis
### Frontend
- Pages: ${this.domainStructure?.frontend.pages.length || 0}
- UI Components: ${this.domainStructure?.frontend.uiComponents.length || 0}
- Custom Hooks: ${this.domainStructure?.frontend.hooks.length || 0}

### Backend  
- API Endpoints: ${this.domainStructure?.backend.apiEndpoints.length || 0}
- Services: ${this.domainStructure?.backend.services.length || 0}
- Data Models: ${this.domainStructure?.backend.dataModels.length || 0}

### Shared
- Types: ${this.domainStructure?.shared.types.length || 0}
- Utilities: ${this.domainStructure?.shared.utils?.length || 0}

## 🚀 Phase Recommendations
${recommendations.map(rec => `
### ${projectWorkflows[rec.phaseId].name}
**Priority**: ${rec.priority}
**Reason**: ${rec.reason}
**Estimated Time**: ${projectWorkflows[rec.phaseId].roadmapRequirements.estimatedTime} minutes
`).join('\n')}

## 👥 Team Requirements
${analysis.teamRequirements.map(req => 
  `- ${req.role}: ${req.count} person(s) for ${req.duration} hours`
).join('\n')}

## ⚠️ Risk Factors
${analysis.riskAssessment.factors.map(factor => `- ${factor}`).join('\n')}

## 💎 Crypto Integration
Status: ${analysis.cryptoReady ? '✅ Enabled' : '❌ Disabled'}

## 🎯 Next Steps
Run: \`pnpm workflow:execute --phase=phase-0-roadmap\`
    `.trim();
    
    const reportPath = path.join(reportDir, 'integrated-analysis.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log('\n' + report);
    console.log(`\n📄 Full report saved to: ${reportPath}`);
  }
  
  async executePhase(phaseId: string): Promise<PhaseExecutionResult> {
    const workflow = projectWorkflows[phaseId];
    if (!workflow) {
      throw new Error(`Phase ${phaseId} not found`);
    }
    
    console.log(`🚀 Executing Phase: ${workflow.name}`);
    console.log('='.repeat(60));
    
    // Check dependencies
    await this.checkDependencies(workflow);
    
    const startTime = Date.now();
    
    try {
      // Execute pre-transition actions
      await this.executePhaseActions(workflow.preTransitionActions || []);
      
      // Execute main phase logic
      await this.executePhaseLogic(workflow);
      
      // Execute post-transition actions
      await this.executePhaseActions(workflow.postTransitionActions || []);
      
      // Update metrics
      const duration = Math.round((Date.now() - startTime) / 60000);
      this.metrics.phasesCompleted++;
      this.workflowHistory.push(phaseId);
      
      // Validate deliverables
      const validationResults = await this.validateDeliverables(workflow.deliverables);
      
      return {
        success: true,
        phaseId,
        duration,
        deliverables: validationResults,
        nextPhase: this.determineNextPhase(phaseId)
      };
      
    } catch (error) {
      console.error(`❌ Phase execution failed:`, error);
      
      return {
        success: false,
        phaseId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Math.round((Date.now() - startTime) / 60000)
      };
    }
  }
  
  private async checkDependencies(workflow: PhaseWorkflowTransition): Promise<void> {
    for (const depId of workflow.dependencies) {
      if (!this.workflowHistory.includes(depId)) {
        throw new Error(`Dependency ${depId} not completed. Run it first.`);
      }
    }
  }
  
  private async executePhaseActions(actions: any[]): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'execute_script':
          await this.executeScript(action.payload.command);
          break;
        case 'create_task':
          console.log(`📋 Creating task: ${action.payload.title}`);
          break;
        case 'send_notification':
          console.log(`📢 Notification: ${action.payload.message}`);
          break;
        case 'track_progress':
          console.log(`📊 Tracking progress: ${JSON.stringify(action.payload)}`);
          break;
        case 'ui_action':
          console.log(`🎨 UI Action: ${JSON.stringify(action.payload)}`);
          break;
      }
    }
  }
  
  private async executePhaseLogic(workflow: PhaseWorkflowTransition): Promise<void> {
    // Special handling for roadmap phase
    if (workflow.id === 'phase-0-roadmap') {
      await this.generateRoadmap();
      return;
    }
    
    // Special handling for type fixes
    if (workflow.id === 'phase-3-execution') {
      await this.executeTypeFixes();
      return;
    }
    
    // Default phase logic
    console.log(`💻 Executing ${workflow.name} logic...`);
    
    // Simulate work based on estimated time
    const estimatedSeconds = workflow.roadmapRequirements.estimatedTime * 60;
    console.log(`⏱️ Estimated time: ${workflow.roadmapRequirements.estimatedTime} minutes`);
    
    // In real implementation, this would execute actual business logic
    await new Promise(resolve => setTimeout(resolve, Math.min(estimatedSeconds, 5000) * 0.1)); // Simulate
  }
  
  private async executeTypeFixes(): Promise<void> {
    const errorCount = this.getErrorCount();
    
    if (errorCount === 0) {
      console.log('✅ No type errors to fix');
      return;
    }
    
    console.log(`🔧 Fixing ${errorCount} type errors...`);
    
    // Choose appropriate fixer based on error count
    let command = 'pnpm fix:types';
    if (errorCount <= 5) {
      command = 'pnpm fix:types:quick';
    } else if (errorCount <= 20) {
      command = 'pnpm fix:types:regular';
    }
    
    await this.executeScript(command);
    
    // Verify fixes
    const remainingErrors = this.getErrorCount();
    if (remainingErrors > 0) {
      console.log(`⚠️ ${remainingErrors} errors remain after automatic fix`);
      console.log('💡 Consider running specialized fixers:');
      console.log('   pnpm fix:types:namespace - for namespace imports');
      console.log('   pnpm fix:types:mixed - for mixed imports');
    } else {
      console.log('✅ All type errors fixed!');
    }
  }
  
  private async validateDeliverables(deliverables: Deliverable[]): Promise<DeliverableValidation[]> {
    const results: DeliverableValidation[] = [];
    
    for (const deliverable of deliverables) {
      const validation: DeliverableValidation = {
        name: deliverable.name,
        type: deliverable.type,
        status: 'pending',
        validatedAt: new Date()
      };
      
      try {
        if (deliverable.validationScript) {
          await this.executeScript(deliverable.validationScript);
          validation.status = 'passed';
          console.log(`✅ ${deliverable.name}: Passed validation`);
        } else {
          validation.status = 'manual-review';
          console.log(`📝 ${deliverable.name}: Requires manual review`);
        }
      } catch (error) {
        validation.status = 'failed';
        validation.error = error instanceof Error ? error.message : 'Validation failed';
        console.log(`❌ ${deliverable.name}: Failed validation`);
      }
      
      results.push(validation);
    }
    
    return results;
  }
  
  private determineNextPhase(currentPhase: string): string | null {
    const phases = Object.keys(projectWorkflows);
    const currentIndex = phases.indexOf(currentPhase);
    
    if (currentIndex < phases.length - 1) {
      return phases[currentIndex + 1];
    }
    
    return null;
  }
  
  private getErrorCount(): number {
    try {
      const output = execSync('pnpm check:types:count', { encoding: 'utf8' });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      console.warn('⚠️ Failed to get error count:', error);
      return 0;
    }
  }
  
  private async executeScript(command: string): Promise<void> {
    console.log(`💻 Executing: ${command}`);
    
    try {
      const output = execSync(command, { encoding: 'utf8' });
      console.log(output);
    } catch (error) {
      console.error(`❌ Script execution failed:`, error);
      throw error;
    }
  }
  
  private assessRisk(): RiskAssessment {
    const factors: string[] = [];
    
    if (!this.roadmapData) {
      return { level: 'unknown', factors };
    }
    
    let level: 'low' | 'medium' | 'high' = 'low';
    
    if (this.roadmapData.components.length > 100) {
      factors.push('Large component library increases maintenance');
      level = 'medium';
    }
    
    if (this.roadmapData.interfaces.length > 200) {
      factors.push('Complex type system increases development time');
      level = 'high';
    }
    
    if (this.getErrorCount() > 50) {
      factors.push('Many type errors indicate technical debt');
      level = 'high';
    }
    
    return { level, factors };
  }
  
  generatePhaseMetricsReport(): PhaseMetricsReport {
    const totalTime = this.workflowHistory.reduce((sum, phaseId) => {
      const workflow = projectWorkflows[phaseId];
      return sum + (workflow?.roadmapRequirements.estimatedTime || 0);
    }, 0);
    
    const deliverablesCompleted = this.metrics.deliverablesCompleted || 0;
    const successRate = this.workflowHistory.length > 0 ? 
      (this.workflowHistory.length / Object.keys(projectWorkflows).length) * 100 : 0;
    
    return {
      projectId: this.context.projectId,
      startTime: this.metrics.startTime,
      endTime: new Date(),
      phasesCompleted: this.workflowHistory.length,
      totalPhases: Object.keys(projectWorkflows).length,
      successRate,
      totalTime,
      deliverablesCompleted,
      roadmapGenerated: this.metrics.roadmapGenerated,
      cryptoImpact: this.context.cryptoMetrics ? 
        `Portfolio: $${this.context.cryptoMetrics.currentValue?.toLocaleString()}` : 'None',
      recommendations: this.generatePhaseRecommendations()
    };
  }
  
  private generatePhaseRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!this.workflowHistory.includes('phase-0-roadmap')) {
      recommendations.push('Start with roadmap generation (phase-0-roadmap)');
    }
    
    const errorCount = this.getErrorCount();
    if (errorCount > 0 && !this.workflowHistory.includes('phase-3-execution')) {
      recommendations.push(`Fix ${errorCount} type errors (phase-3-execution)`);
    }
    
    if (this.workflowHistory.length === Object.keys(projectWorkflows).length) {
      recommendations.push('All phases complete! Consider project retrospective.');
    }
    
    return recommendations;
  }
}

// ========== SUPPORTING TYPES ==========
interface ProjectAnalysis {
  errorCount: number;
  categories: ErrorCategories;
  complexity: ProjectComplexity;
  roadmapStats: RoadmapStats;
  domainStructure?: DomainStructure | null;
  estimatedTime: TimeEstimate;
  teamRequirements: TeamRequirement[];
  riskAssessment: RiskAssessment;
  cryptoReady: boolean;
  recommendations?: PhaseRecommendation[];
}

interface ErrorCategories {
  namespace: number;
  typeOnly: number;
  mixed: number;
  complex: number;
}

interface ProjectComplexity {
  level: 'simple' | 'moderate' | 'complex';
  factors: string[];
  score: number;
}

interface RoadmapStats {
  totalComponents: number;
  totalInterfaces: number;
  totalApis: number;
}

interface TimeEstimate {
  optimistic: number;
  realistic: number;
  pessimistic: number;
}

interface TeamRequirement {
  role: string;
  count: number;
  duration: number; // hours
}

interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'unknown';
  factors: string[];
}

interface PhaseRecommendation {
  phaseId: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface PhaseExecutionResult {
  success: boolean;
  phaseId: string;
  duration: number;
  deliverables?: DeliverableValidation[];
  nextPhase?: string | null;
  error?: string;
}

interface DeliverableValidation {
  name: string;
  type: string;
  status: 'pending' | 'passed' | 'failed' | 'manual-review';
  validatedAt: Date;
  error?: string;
}

interface PhaseMetricsReport {
  projectId: string;
  startTime: Date;
  endTime: Date;
  phasesCompleted: number;
  totalPhases: number;
  successRate: number;
  totalTime: number;
  deliverablesCompleted: number;
  roadmapGenerated: boolean;
  cryptoImpact: string;
  recommendations: string[];
}

// ========== MAIN EXECUTION ==========
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const phaseId = args[1];
  
  // Create context
  const context: WorkflowContext = {
    projectId: 'project-' + Date.now(),
    phase: {
      id: 'initial',
      name: 'Project Initialization',
      status: 'pending',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    team: [
      { id: 'dev1', role: 'fullstack-developer', skills: ['typescript', 'react', 'node'] },
      { id: 'pm1', role: 'project-manager', skills: ['planning', 'coordination'] }
    ],
    timeline: {
      start: new Date(),
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  };
  
  const manager = new ProjectPhaseWorkflowManager(context);
  
  switch (command) {
    case 'analyze':
      console.log('🔍 Starting Integrated Project Analysis...\n');
      await manager.analyzeAndPlan();
      break;
      
    case 'execute':
      if (!phaseId) {
        console.error('❌ Please specify a phase ID');
        console.log('Available phases:');
        Object.keys(projectWorkflows).forEach(key => {
          const workflow = projectWorkflows[key];
          console.log(`  ${key}: ${workflow.name} (${workflow.roadmapRequirements.estimatedTime} min)`);
        });
        process.exit(1);
      }
      
      console.log(`🚀 Executing Phase: ${phaseId}\n`);
      const result = await manager.executePhase(phaseId);
      
      if (result.success) {
        console.log('\n✅ Phase completed successfully!');
        console.log(`   Duration: ${result.duration} minutes`);
        console.log(`   Deliverables: ${result.deliverables?.filter(d => d.status === 'passed').length || 0} passed`);
        if (result.nextPhase) {
          console.log(`   Next Phase: ${result.nextPhase}`);
          console.log(`   Run: pnpm workflow:execute ${result.nextPhase}`);
        }
      } else {
        console.log('\n❌ Phase failed!');
        console.log(`   Error: ${result.error}`);
      }
      break;
      
    case 'metrics':
      console.log('📊 Generating Phase Metrics Report...\n');
      const report = manager.generatePhaseMetricsReport();
      console.log(JSON.stringify(report, null, 2));
      break;
      
    case 'list':
      console.log('📋 Available Project Phases:\n');
      Object.entries(projectWorkflows).forEach(([id, workflow]) => {
        console.log(`${id}:`);
        console.log(`  Name: ${workflow.name}`);
        console.log(`  Description: ${workflow.description}`);
        console.log(`  Category: ${workflow.phaseCategory}`);
        console.log(`  Estimated Time: ${workflow.roadmapRequirements.estimatedTime} minutes`);
        console.log(`  Dependencies: ${workflow.dependencies.length > 0 ? workflow.dependencies.join(', ') : 'None'}`);
        console.log(`  Team Skills: ${workflow.roadmapRequirements.teamSkills.join(', ')}`);
        console.log();
      });
      break;
      
    default:
      console.log(`
Project Phase Workflow Manager
==============================

Usage:
  pnpm tsx ProjectPhaseWorkflowManager.ts [command] [phaseId]

Commands:
  analyze      - Analyze project and generate roadmap
  execute      - Execute a specific phase
  metrics      - Generate metrics report
  list         - List available phases

Examples:
  pnpm tsx ProjectPhaseWorkflowManager.ts analyze
  pnpm tsx ProjectPhaseWorkflowManager.ts execute phase-0-roadmap
  pnpm tsx ProjectPhaseWorkflowManager.ts list

Phase Flow:
  1. phase-0-roadmap     → Generate roadmap
  2. phase-1-discovery   → Project analysis
  3. phase-2-planning    → Detailed planning
  4. phase-3-execution   → Development & type fixes
  5. phase-4-qa          → Quality assurance
  6. phase-5-deployment  → Production deployment
      `);
  }
}

// ES Module entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ProjectPhaseWorkflowManager, projectWorkflows };