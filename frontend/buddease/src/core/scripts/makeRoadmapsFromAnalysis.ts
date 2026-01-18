// makeRoadmapsFromAnalysis.ts
scripts/makeRoadmapsFromAnalysis.ts

import { RoadmapAudience } from '@/core/server/repository/roadmapMapper';
import fs from 'fs';
import path from 'path';

const analysis = JSON.parse(fs.readFileSync('./analysis.json', 'utf-8'));
const audienceConfig: Record<RoadmapAudience, { 
  focus: string[];
  outputName: string;
}> = {
  'developer': {
    focus: ['technical-debt', 'refactoring', 'performance', 'architecture'],
    outputName: 'technical-roadmap'
  },
  'stakeholder': {
    focus: ['business-value', 'roi', 'timeline', 'budget'],
    outputName: 'business-roadmap'
  },
  'product-manager': {
    focus: ['features', 'user-stories', 'prioritization', 'releases'],
    outputName: 'product-roadmap'
  },
  'designer': {
    focus: ['ui-ux', 'user-flows', 'design-system', 'prototypes'],
    outputName: 'design-roadmap'
  },
  'qa': {
    focus: ['testing', 'quality-gates', 'automation', 'bug-fixes'],
    outputName: 'quality-roadmap'
  },
  'devops': {
    focus: ['infrastructure', 'deployment', 'monitoring', 'scaling'],
    outputName: 'infrastructure-roadmap'
  },
  'executive': {
    focus: ['strategy', 'competitive-advantage', 'market-position', 'growth'],
    outputName: 'executive-roadmap'
  },
  'end-user': {
    focus: ['new-features', 'improvements', 'bug-fixes', 'user-benefits'],
    outputName: 'user-roadmap'
  },
  'team': {
    focus: ['sprint-planning', 'capacity', 'collaboration', 'skills'],
    outputName: 'team-roadmap'
  },
  'community': {
    focus: ['contributions', 'documentation', 'community-features', 'outreach'],
    outputName: 'community-roadmap'
  }
};

// Generate roadmaps for all audiences
for (const [audience, config] of Object.entries(audienceConfig)) {
  const { jsonPath, mdPath } = roadmapMapper.buildAndWriteRoadmap(
    analysis, 
    audience as RoadmapAudience, 
    {
      outputDir: './analysis_outputs',
      name: config.outputName,
      filters: config.focus
    }
  );
  console.log(`📊 Generated ${audience} roadmap:`, path.basename(mdPath));
}
