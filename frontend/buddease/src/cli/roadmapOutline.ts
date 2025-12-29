// roadmapOutline.ts
import { RoadmapAudience } from '@/core/server/repository/roadmapMapper';


export function generateOutline<T>(nodes: RoadmapNode<T>[], audience: RoadmapAudience): string {
  switch (audience) {
    case 'stakeholder':
      return generateStakeholderOutline(nodes);
    case 'developer':
      return generateDeveloperOutline(nodes);
    case 'community':
      return generateCommunityOutline(nodes);
    default:
      return '';
  }
}

// Simplified, human-readable outline for non-technical stakeholders
function generateStakeholderOutline<T>(nodes: RoadmapNode<T>[], level = 0): string {
  return nodes
    .map(node => `${'  '.repeat(level)}- ${node.name}${node.phase ? ` [${node.phase}]` : ''}`)
    .map(line => {
      const children = nodes.find(n => n.name === line.trim().slice(2))?.children;
      return children ? line + '\n' + generateStakeholderOutline(children, level + 1) : line;
    })
    .join('\n');
}

// Detailed outline for developers
function generateDeveloperOutline<T>(nodes: RoadmapNode<T>[], level = 0): string {
  return nodes
    .map(node => {
      const info = `[Phase: ${node.phase || 'unassigned'}, ID: ${node.id}]`;
      return `${'  '.repeat(level)}- ${node.name} ${info}`;
    })
    .map(line => {
      const children = nodes.find(n => n.name === line.trim().slice(2))?.children;
      return children ? line + '\n' + generateDeveloperOutline(children, level + 1) : line;
    })
    .join('\n');
}

// High-level outline for community/public audience
function generateCommunityOutline<T>(nodes: RoadmapNode<T>[], level = 0): string {
  return nodes
    .map(node => `${'  '.repeat(level)}- ${node.name}`)
    .map(line => {
      const children = nodes.find(n => n.name === line.trim().slice(2))?.children;
      return children ? line + '\n' + generateCommunityOutline(children, level + 1) : line;
    })
    .join('\n');
}
