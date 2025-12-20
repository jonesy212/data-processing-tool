// stakeholderRoadmap.ts
// services/stakeholderRoadmap.ts
import { RoadmapNode } from '@/app/typings/roadmap';
import { BaseDataEntity } from '@/app/config/BaseConfig';
import { AnalysisNode } from '@/app/typings/AnalysisNode'

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
