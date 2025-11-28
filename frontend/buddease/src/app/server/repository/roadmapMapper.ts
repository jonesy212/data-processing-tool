// roadmapMapper.ts
// /app/server/repository/roadmapMapper.ts
import fs from 'fs';
import path from 'path';

//
// Types (adapt or import your real types if you already have them)
//

export type RoadmapAudience = 'stakeholder' | 'developer' | 'community';

export interface TagSemantic {
  label?: string;
  color?: string;
  phase?: string; // canonical phase string
  domain?: 'project' | 'crypto' | 'community' | 'global';
  description?: string;
  includes?: string[]; // other tag names included
  excludes?: string[]; // tag names to exclude
  synonyms?: string[];
  audiences?: RoadmapAudience[]; // explicitly allowed audiences
  hiddenFor?: RoadmapAudience[]; // hidden for certain audiences
  priority?: number; // numeric priority, higher => more important
}

// Roadmap node that we will return
export interface RoadmapNode<T = any> {
  id: string;
  name: string;
  title?: string;
  description?: string;
  phase?: string;
  priority?: number;
  audienceVisibility?: RoadmapAudience[]; // audiences allowed
  tags?: string[]; // tag names/colors
  content?: string; // aggregated content/version notes
  children?: RoadmapNode<T>[];
  estimatedEffort?: string | number; // optional effort estimate
  recommendedSprint?: string | number;
  sensitive?: boolean; // whether sanitized out for some audiences
  source?: {
    analysisNodeId?: string;
    file?: string;
  };
}

//
// Config: canonical phases + sanitization rules
//

export const DEFAULT_PHASES = [
  'ideation',
  'planning',
  'design',
  'implementation',
  'qa',
  'deployment',
  'monitoring',
  'analysis',
  'crypto:portfolio',
  'crypto:trading',
  'community:discussion',
  'community:collaboration',
];

const SENSITIVE_KEYS = ['password', 'secret', 'privateKey', 'apiKey', 'token', 'ssn', 'email'];

/**
 * Remove obviously sensitive fields from arbitrary objects.
 * This is conservative: it deletes properties whose key matches SENSITIVE_KEYS (case-insensitive),
 * or values that look like secrets (very short heuristic).
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj || typeof obj !== 'object') return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (SENSITIVE_KEYS.some(s => lower.includes(s))) {
      out[k] = '[REDACTED]';
      continue;
    }
    // If value is string and looks like a token (long base64-like), redact
    if (typeof v === 'string' && v.length > 80 && /[A-Za-z0-9+/=]{40,}/.test(v)) {
      out[k] = '[REDACTED]';
      continue;
    }
    if (v && typeof v === 'object') out[k] = sanitizeObject(v);
    else out[k] = v;
  }
  return out;
}

/**
 * Determine node phase via (in order):
 *  - Tag semantic (first match)
 *  - VersionData.metadata.phase
 *  - analysis.metadata.phase
 *  - fallback to 'unassigned'
 */
function determinePhase(node: AnalysisNode, canonicalPhases: string[] = DEFAULT_PHASES): string {
  // tags can be objects or strings
  const tags = node.tags ?? [];
  const tagObjs: Tag[] = tags.map(t => (typeof t === 'string' ? { name: t } : t as Tag));

  // Check tag semantics
  for (const t of tagObjs) {
    const sem = t.metadata?.semantic;
    if (sem?.phase && canonicalPhases.includes(sem.phase)) return sem.phase;
  }

  // Check versionData or metadata
  if (node.versionData?.metadata?.phase) return node.versionData.metadata.phase;
  if (node.metadata?.phase) return node.metadata.phase;

  return 'unassigned';
}

/**
 * Compute priority:
 * - Tag semantic priority if present
 * - Node.score if present
 * - Heuristic based on presence of dependencies, tags, versionData
 */
function computePriority(node: AnalysisNode): number {
  // tag priorities
  const tags = node.tags ?? [];
  const tagObjs: Tag[] = tags.map(t => (typeof t === 'string' ? { name: t } : t as Tag));

  let maxTagPriority = 0;
  for (const t of tagObjs) {
    const p = t.metadata?.semantic?.priority ?? 0;
    if (p > maxTagPriority) maxTagPriority = p;
  }

  const score = node.score ?? 0;
  const wDeps = (node.dependencies?.length ?? 0) > 0 ? 10 : 0;
  const wVersion = node.versionData ? 5 : 0;
  const wTags = tagObjs.length * 2;

  // Normalize to 0-100-ish
  const base = maxTagPriority * 10 + score + wDeps + wVersion + wTags;
  return Math.min(Math.round(base), 100);
}

/**
 * Determine audience visibility for node:
 * - If tag.semantic.audiences specified -> use that
 * - Else if tag.semantic.hiddenFor includes audience -> hide
 * - Fallback:
 *    developer: show everything
 *    stakeholder: hide sensitive, show high level only
 *    community: public only (tags with domain === 'community' or global)
 */
function determineAudienceVisibility(node: AnalysisNode): RoadmapAudience[] {
  const tags = node.tags ?? [];
  const tagObjs: Tag[] = tags.map(t => (typeof t === 'string' ? { name: t } : t as Tag));

  const audiencesSet = new Set<RoadmapAudience>();

  // Collect explicit audiences
  for (const t of tagObjs) {
    const sem = t.metadata?.semantic;
    if (sem?.audiences && sem.audiences.length > 0) {
      sem.audiences.forEach(a => audiencesSet.add(a));
    }
  }

  // If explicit found, return it (developer always included)
  if (audiencesSet.size > 0) {
    audiencesSet.add('developer');
    return Array.from(audiencesSet);
  }

  // Otherwise determine based on domain
  for (const t of tagObjs) {
    const dom = t.metadata?.semantic?.domain;
    if (dom === 'community') {
      audiencesSet.add('community');
    }
    if (dom === 'crypto' || dom === 'project' || dom === 'global') {
      audiencesSet.add('stakeholder');
      audiencesSet.add('developer');
    }
  }

  // default
  if (audiencesSet.size === 0) {
    return ['developer', 'stakeholder'];
  }

  return Array.from(audiencesSet);
}

/**
 * Map a single AnalysisNode -> RoadmapNode with audience-based sanitation
 */
export function mapNodeToRoadmapNode(node: AnalysisNode, audience: RoadmapAudience): RoadmapNode {
  const phase = determinePhase(node);
  const priority = computePriority(node);
  const audiences = determineAudienceVisibility(node);

  // If audience is not allowed, mark as sensitive (will be removed for some exports)
  const allowedForAudience = audiences.includes(audience) || audience === 'developer';

  // Build tags: use names and colors if available
  const tags = (node.tags ?? []).map(t => (typeof t === 'string' ? t : (t as Tag).name));

  const contentCandidate = node.versionData?.content ?? node.description ?? node.metadata?.summary ?? '';

  const roadmapNode: RoadmapNode = {
    id: node.id,
    name: node.name,
    title: node.name,
    description: allowedForAudience ? (sanitizeObject(node.description ? { text: node.description } : {}) as any).text : '[REDACTED]',
    phase,
    priority,
    audienceVisibility: audiences,
    tags,
    content: allowedForAudience ? (typeof contentCandidate === 'string' ? contentCandidate : JSON.stringify(sanitizeObject(contentCandidate))) : undefined,
    children: undefined,
    estimatedEffort: node.metadata?.effort ?? undefined,
    recommendedSprint: node.metadata?.recommendedSprint ?? undefined,
    sensitive: !allowedForAudience,
    source: {
      analysisNodeId: node.id,
      file: node.metadata?.sourceFile ?? node.metadata?.file ?? undefined,
    }
  };

  if (node.children && node.children.length > 0) {
    roadmapNode.children = node.children.map(c => mapNodeToRoadmapNode(c, audience));
  }

  return roadmapNode;
}

/**
 * Convert full analysis tree -> audience-specific roadmap tree.
 * Applies sanitization and optionally removes sensitive nodes for stakeholders/community.
 */
export function mapAnalysisToRoadmap(analysis: AnalysisNode[], audience: RoadmapAudience): RoadmapNode[] {
  const mapped = analysis.map(n => mapNodeToRoadmapNode(n, audience));

  // For non-dev audiences, prune sensitive nodes entirely (instead of keeping flagged nodes)
  if (audience !== 'developer') {
    const prune = (nodes: RoadmapNode[]): RoadmapNode[] => {
      return nodes
        .filter(n => !n.sensitive) // remove sensitive
        .map(n => ({ ...n, children: n.children ? prune(n.children) : undefined }));
    };
    return prune(mapped);
  }

  return mapped;
}

/**
 * Produce textual roadmap outputs:
 * - JSON file
 * - Markdown summary (human-friendly)
 * - Optional detailed developer markdown
 */
export function generateRoadmapDocuments(
  roadmap: RoadmapNode[],
  options: { outputDir?: string; name?: string; audience?: RoadmapAudience } = {}
) {
  const outDir = options.outputDir ?? path.resolve(process.cwd(), 'analysis_outputs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const baseName = options.name ?? `roadmap-${options.audience ?? 'aud' }-${new Date().toISOString().replace(/[:.]/g, '-')}`;

  const jsonPath = path.join(outDir, `${baseName}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(roadmap, null, 2), 'utf-8');

  // Markdown generator
  function nodeToMarkdown(nodes: RoadmapNode[], depth = 2): string {
    return nodes
      .map(n => {
        const header = `${'#'.repeat(Math.min(depth, 6))} ${n.title || n.name}\n`;
        const meta = [
          n.phase ? `**Phase:** ${n.phase}` : null,
          n.priority ? `**Priority:** ${n.priority}` : null,
          n.tags && n.tags.length ? `**Tags:** ${n.tags.join(', ')}` : null,
          n.recommendedSprint ? `**Sprint:** ${n.recommendedSprint}` : null,
          n.estimatedEffort ? `**Effort:** ${n.estimatedEffort}` : null,
        ].filter(Boolean).join(' • ') + '\n\n';

        const desc = n.description ? `${n.description}\n\n` : '';
        const content = n.content ? `**Notes:**\n\n${n.content}\n\n` : '';
        const children = n.children && n.children.length ? nodeToMarkdown(n.children, depth + 1) : '';
        return header + meta + desc + content + children;
      })
      .join('\n');
  }

  const md = `# Roadmap (${options.audience ?? 'audience'})\n\nGenerated: ${new Date().toISOString()}\n\n` + nodeToMarkdown(roadmap);

  const mdPath = path.join(outDir, `${baseName}.md`);
  fs.writeFileSync(mdPath, md, 'utf-8');

  return { jsonPath, mdPath };
}

/**
 * Convenience: full pipeline
 *  - accept analysis result (AnalysisNode[])
 *  - produce roadmap by audience
 *  - write JSON + MD
 */
export function buildAndWriteRoadmap(
  analysis: AnalysisNode[],
  audience: RoadmapAudience,
  opts?: { outputDir?: string; name?: string }
) {
  const roadmap = mapAnalysisToRoadmap(analysis, audience);
  const docs = generateRoadmapDocuments(roadmap, { outputDir: opts?.outputDir, name: opts?.name, audience });
  return { roadmap, ...docs };
}

export default {
  mapAnalysisToRoadmap,
  buildAndWriteRoadmap,
  generateRoadmapDocuments,
  mapNodeToRoadmapNode,
};
