// CommunityData.tsx
import { Project } from "@/app/models/projects/Project";
import { Data } from "@/app/models/data/Data";
import { Team } from "@/app/components/teams/Team";
import { TeamMember } from "@/app/models/teams/TeamMembers";
import {
  BaseDataEntity,
  BaseDataRoot,
  DefaultExcludedFields,
  DefaultMeta
} from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';


export interface CommunityData<
  T extends BaseDataEntity = BaseDataRoot,
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
  