// DataSetModel.ts
import { ProgressPhase } from '@/app/components/models/tracker/ProgressBar';
import { Team } from "@/app/components/teams/Team";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ModifiedDate } from "@/app/documents/DocType";
import { DocumentPath } from "@/app/documents/DocumentPath";
import { DocumentData } from "@/app/documents/editing/DocumentBuilder";
import { Content } from "@/app/models/content/AddContent";
import { BaseData, Data } from '@/app/models/data/Data';
import { TagsRecord } from '@/app/models/tracker/Tag';
import { BaseEntity } from "@/app/routing/FuzzyMatch";
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";
import { DocumentObject } from "@/app/state/redux/slices/DocumentSlice";
import { DocumentBase, PhaseTypeEnums } from "@/app/state/stores/DocumentStore";
import { AllTypes } from "@/app/typings/PropTypes";


interface DatasetModel<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntity, DocumentBase<T, K> {
  filePathOrUrl?: string;
  uploadedBy: string; // Assuming this is the user ID
  uploadedAt?: string; // Assuming the date is sent as a string
  tagsOrCategories: string; // Comma-separated list or JSON array
  format: string;
  visibility: AllTypes;
  url?: string |undefined;
  // Add other fields as needed
  type?: AllTypes;

  // Relationships
  uploadedByTeamId: number | null; // Assuming this is the team ID
  uploadedByTeam: Team | null; // Assuming you have a Team interface
  all?: string | null;
  lastModifiedDate: ModifiedDate | undefined;
  lastModifiedBy: string; // Assuming this is the user ID
  lastModifiedByTeamId?: number | null; // Assuming this is the team ID
  lastModifiedByTeam?: Team | null;
  filePath?: DocumentPath<T, K, Meta>;
  tags?: string[] | TagsRecord<T> | undefined; 
  createdBy: string | undefined;
  updatedBy: string;
  documents: WritableDraft<DocumentObject<T, K, Meta>>[];
  createdAt: string | Date | undefined;
  updatedAt?: string | Date; 
  selectedDocument: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null; // Specify type arguments for DocumentData
  selectedDocuments?: DocumentData<T, K>[];
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  phaseType: PhaseTypeEnums
  // Optional: Add other relationships as needed
}

// Example usage:
const dataset: DatasetModel<Data<BaseData>> = {
  id: 1,
  name: "Example Dataset",
  title: "Example Dataset",
  description: "An example dataset",
  filePathOrUrl: "/datasets/example.csv",
  uploadedBy: '1',
  uploadedAt: "2023-01-01T12:00:00Z",
  tagsOrCategories: "tag1, tag2",
  format: "csv",
  visibility: "private",
  uploadedByTeamId: 1,
  uploadedByTeam: null,
  type: "url",

  phaseType: ProgressPhase.Draft,
  url: "https://example.com/datasets/example.csv",
  lastModifiedDate: {
    value: new Date("2023-01-01T12:00:00Z"),
    isModified: false,
  } as ModifiedDate,
  lastModifiedBy: "user1",
  tags: {},
  createdBy: "",
  updatedBy: "",
  selectedDocument: null,
  all: null,
  documents: [],
  createdAt: undefined,
  content: {
    id: undefined,
    title: "",
    description: "",
    subscriberId: "",
    category: undefined,
    categoryProperties: undefined,
    timestamp: "",
    length: 0,
    items: [],
    data: undefined,
    contentItems: [],
    schema: {}
  }

};export { dataset };
export type { DatasetModel };

