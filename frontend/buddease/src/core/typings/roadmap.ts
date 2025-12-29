// roadmap.ts
// types/roadmap.ts

import { BaseDataEntity } from '@/core/config/BaseConfig';
import { Version } from '@/core/versions/Version';
import { VersionData } from '@/core/versions/VersionData';

// Simplified roadmap item
export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  children?: RoadmapItem[];
  tags?: string[];
}


export interface RoadmapNode<T extends BaseDataEntity = BaseDataEntity> {
    id: string | number;
    name: string;
    description?: string;
    phase?: string;
    versions?: VersionData<T>[] | Version<T>[];
    tags?: string[];
    author?: string;
    timestamp?: Date | string;
    children?: RoadmapNode<T>[];
    audience?: RoadmapAudience;  // optional to indicate intended audience
    status?: 'active' | 'completed' | 'archived';
}


// Define audience types
export type RoadmapAudience =   
    | 'stakeholder'
  | 'developer'
  | 'community'
  | 'investor'
  | 'team'
  | 'endUser'
  | 'custom';