// makeRoadmapsFromAnalysis.ts
// scripts/makeRoadmapsFromAnalysis.ts
import fs from 'fs';
import path from 'path';
import roadmapMapper from '@/app/server/repository/roadmapMapper';

const analysis = JSON.parse(fs.readFileSync('./analysis.json', 'utf-8'));
const audienceList: RoadmapAudience[] = ['developer','stakeholder','community'];

for (const audience of audienceList) {
  const { jsonPath, mdPath } = roadmapMapper.buildAndWriteRoadmap(analysis, audience, {
    outputDir: './analysis_outputs',
    name: `roadmap-${audience}`
  });
  console.log('Wrote', jsonPath, mdPath);
}
