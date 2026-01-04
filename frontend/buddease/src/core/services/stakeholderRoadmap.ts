stakeholderRoadmap.ts
services/stakeholderRoadmap.ts
import type { BaseDataEntity } from '@/core/config/BaseConfig';
import { AnalysisNode } from '@/core/typings/AnalysisNode';
import { RoadmapNode } from '@/core/typings/roadmap';

export function buildStakeholderRoadmap<T extends BaseDataEntity>(
  analysis: AnalysisNode<T>[]
): RoadmapNode<T>[] {
  // High-level, non-technical roadmap nodes
  const roadmap: RoadmapNode<T>[] = analysis.map(node => ({
    id: node.id,
    name: node.name,
    phase: node.phase,
    description: node.summary || 'High-level description for stakeholders',
    children: node.children?.map(child => ({
      ...child,
      description: child.summary || 'Simplified explanation',
    })),
  }));

  return roadmap;
}
