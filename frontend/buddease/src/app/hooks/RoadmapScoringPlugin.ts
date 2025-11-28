// RoadmapScoringPlugin.ts

// Purpose:
// Decouple roadmap priority logic from code → allow PM-driven weighting.
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

export type SystemRole = 'founder' | 'pm' | 'developer' | 'community' | 'investor';

export interface RoadmapScoringPlugin<T extends BaseDataEntity> {
  computeScore?: (item: T) => number;
  weightFactors?: {
    customerImpact?: number;
    engineeringEffort?: number;
    securityRisk?: number;
    adoptionValue?: number;
  };
}


export const RoleToAudience: Record<SystemRole, RoadmapAudience> = {
  founder: 'stakeholder',
  pm: 'stakeholder',
  developer: 'developer',
  community: 'community',
  investor: 'stakeholder'
};

const cryptoPriorityPlugin: RoadmapScoringPlugin<TaskEntity> = {
  weightFactors: {
    securityRisk: 3,
    adoptionValue: 2,
    customerImpact: 2,
    engineeringEffort: -1 // subtract effort
  },
  computeScore(task) {
    return (
      task.securityRisk * 3 +
      task.userImpact * 2 -
      task.complexity
    );
  }
};
