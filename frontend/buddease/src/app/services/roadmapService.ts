// roadmapService.ts
// roadmapService
// services/roadmapService.ts

import { AnalysisNode, RoadmapItem, RoadmapAudience } from '@/types/roadmap';

/**
 * Main function to generate roadmap from analysis tree.
 */
export function generateRoadmap<T>(
  analysisTree: AnalysisNode<T>[],
  audience: RoadmapAudience
): RoadmapItem[] {
  switch (audience) {
    case 'stakeholder':
      return simplifyForStakeholder(analysisTree);
    case 'developer':
      return detailedForDeveloper(analysisTree);
    case 'community':
      return simplifyForCommunity(analysisTree);
    default:
      return [];
  }
}

/**
 * Simplified roadmap for non-technical stakeholders
 */
function simplifyForStakeholder<T>(nodes: AnalysisNode<T>[]): RoadmapItem[] {
  return nodes.map(node => ({
    id: node.id,
    title: node.name,
    children: node.children ? simplifyForStakeholder(node.children) : undefined,
    tags: node.tags?.map(tag => tag.color), // example: just show tag colors
  }));
}

/**
 * Detailed roadmap for developers
 */
function detailedForDeveloper<T>(nodes: AnalysisNode<T>[]): RoadmapItem[] {
  return nodes.map(node => ({
    id: node.id,
    title: node.name,
    description: node.metadata?.description,
    dueDate: node.metadata?.dueDate,
    children: node.children ? detailedForDeveloper(node.children) : undefined,
    tags: node.tags,
  }));
}

/**
 * Simplified public/community roadmap
 * Strips sensitive metadata, shows high-level milestones
 */
function simplifyForCommunity<T>(nodes: AnalysisNode<T>[]): RoadmapItem[] {
  return nodes.map(node => ({
    id: node.id,
    title: node.name,
    // Only show minimal info
    children: node.children ? simplifyForCommunity(node.children) : undefined,
    tags: node.tags?.map(tag => tag.color),
  }));
}


import { BaseDataEntity } from '@/app/config/BaseConfig';
import { AnalysisNode } from './analysisTypes';
import { RoadmapNode, RoadmapAudience } from './roadmapTypes';
import { generateRoadmap } from './roadmapGenerator';
import { VersionData } from '@/app/typings/entities/VersionEntity';

export class RoadmapService {
    /**
     * Builds audience-specific roadmap trees from analysis nodes
     */
    static buildRoadmap<T extends BaseDataEntity>(
        analysis: AnalysisNode<T>[],
        audience: RoadmapAudience,
        role: SystemRole,
        scoringPlugin?: RoadmapScoringPlugin<T>
    ): RoadmapNode<T>[] {
        if (!analysis || !Array.isArray(analysis)) return [];

        // Step 1: generate roadmap using general logic
        let roadmapTree = generateRoadmap(analysis, audience);

        // Step 2: enrich roadmap nodes with content, tags, phases
        roadmapTree = roadmapTree.map(node => this.enrichNode(node, audience));

        // Step 3: sanitize for non-dev audiences
        if (audience === 'stakeholder' || audience === 'community') {
            roadmapTree = roadmapTree.map(node => this.sanitizeNodeForAudience(node));
        }

        return roadmapTree;
    }

    private static enrichNode<T extends BaseDataEntity>(
        node: RoadmapNode<T>,
        audience: RoadmapAudience
    ): RoadmapNode<T> {
        // Add phase, tags, content (from VersionData or BaseDataEntity)
        const enrichedNode: RoadmapNode<T> = {
            ...node,
            phase: node.phase || 'unassigned',
            tags: node.tags || this.collectTags(node),
            content: node.content || this.collectContent(node),
            children: node.children?.map(child => this.enrichNode(child, audience)),
        };
        return enrichedNode;
    }

    private static collectTags<T extends BaseDataEntity>(node: RoadmapNode<T>): string[] {
        // Example: gather tags from node.entity or node.versionData
        const tags: string[] = [];
        if ((node.entity as any)?.tags) tags.push(...(node.entity as any).tags);
        if ((node.versionData as VersionData)?.tags) tags.push(...(node.versionData as VersionData).tags);
        return [...new Set(tags)]; // deduplicate
    }

    private static collectContent<T extends BaseDataEntity>(node: RoadmapNode<T>): string | undefined {
        if ((node.entity as any)?.content) return (node.entity as any).content;
        if ((node.versionData as VersionData)?.content) return (node.versionData as VersionData).content;
        return undefined;
    }

    private static sanitizeNodeForAudience<T extends BaseDataEntity>(node: RoadmapNode<T>): RoadmapNode<T> {
        const { id, name, phase, tags, content, children } = node;
        return {
            id,
            name,
            phase,
            tags,
            content,
            children: children?.map(child => this.sanitizeNodeForAudience(child)),
        };
    }
}

