import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { Meta } from './../../models/data/dataStoreMethods';
// Assuming you have an interface for the User and Team models as well
import { ModifiedDate } from "../../documents/DocType";
import { DocumentData } from "../../documents/DocumentBuilder";
import { DocumentPath } from "../../documents/DocumentGenerator";
import { Content } from "../../models/content/AddContent";
import { BaseData, Data } from "../../models/data/Data";
import { Team } from "../../models/teams/Team";
import { BaseEntity } from "../../routing/FuzzyMatch";
import { TagsRecord } from "../../snapshots";
import { WritableDraft } from "../../state/redux/ReducerGenerator";
import { DocumentObject } from "../../state/redux/slices/DocumentSlice";
import { DocumentBase } from "../../state/stores/DocumentStore";
import { AllTypes } from "../../typings/PropTypes";

interface DatasetModel<T extends Data, K extends Data = T>
  extends BaseEntity, DocumentBase<T, Meta, K> {
  filePathOrUrl: string;
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
  filePath?: DocumentPath;
  tags?: TagsRecord | string[] | undefined; 
  createdBy: string | undefined;
  updatedBy: string;
  documents: WritableDraft<DocumentObject<T, Meta, K>>[];
  createdAt: string | Date | undefined;
  updatedAt?: string | Date; 
  selectedDocument: DocumentData<T, Meta, K> | null;
  selectedDocuments?: DocumentData<T, Meta, K>[];
  content: Content<T, Meta, BaseData>
  // Optional: Add other relationships as needed
}

// Example usage:
const dataset: DatasetModel<Data, UnifiedMetaDataOptions, Data> = {
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
    contentItems: []
  }
};
export { dataset };
export type { DatasetModel };

