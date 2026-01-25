// CommunityData.tsx
import { Team } from "@/core/components/teams/Team";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta
} from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Data } from "@/core/models/data/Data";
import { Project } from "@/core/models/projects/Project";
import { TeamMember } from "@/core/models/teams/TeamMembers";


export interface CommunityData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string | number;
  name: string;
  description: string;
  projects: Project[];
  teams: Team[];
  teamMembers: TeamMember[];
  type?: string;
  // Add other properties as needed
}
  