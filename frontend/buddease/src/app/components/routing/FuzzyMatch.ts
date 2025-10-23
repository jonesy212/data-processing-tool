// FuzzyMatch.ts
import { BaseEntityProperties, SharedIdentifiers, SharedTimestamps } from "@/app/documents/RelatedProps";
import { Attachment } from '@/app/documents/attachment/Attachment';
import AppTreeService from "@/app/services/AppTreeService";
import { AppMetadata } from "@/config/MetaDataOptions";
import { useAuth } from "@/context/AuthContext";

import { processTextWithSpaCy } from "@/app/intelligence/AutoGPTSpaCyIntegration";
import { AllTypes } from "@/app/typings/PropTypes";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import fuzzysort from "fuzzysort";

interface BaseEntity<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          SharedTimestamps
{
  description?: string | null;
  appMetadata?: AppMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  filePathOrUrl?: string;
  source?: string;
}

// Define a type for your entities
interface Entity<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
          BaseEntityProperties 
{
  type?: string | AllTypes | null;
}

// Function to perform fuzzy matching with spaCy processing
export const fuzzyMatchEntities = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  query: string,
  entities: Entity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
): Promise<Entity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    const { user } = useAuth();
    if (!user || !user.isLoggedIn) return [];

    const appTree = await AppTreeService.getTree();
    if (!appTree) return [];

    const appTreeArray = Object.values(appTree);
    const processedQuery = await processTextWithSpaCy(query, appTreeArray);

    const results = fuzzysort.go(
      processedQuery,
      entities,
      { key: "name" }
    );

    return results.map((result) => result.obj);
  } catch (error) {
    console.error("Error performing fuzzy matching with spaCy processing:", error);
    return [];
  }
};


// Example concrete entity type using generics
type ConcreteEntity = Entity<
  BaseDataEntity,         // T
  BaseDataEntity,         // K
  DefaultMeta<BaseDataEntity, BaseDataEntity>, // Meta
  Attachment,             // AttachmentType
  keyof BaseDataEntity,   // ExcludedFields
  keyof BaseDataEntity    // IncludedFields
>;

// Define entities array with proper generic typing
const entities: ConcreteEntity[] = [
  {
    id: 1, name: "Apple Inc.", description: "Tech company", source: "local", type: "company",
    createdBy: undefined,
    createdAt: undefined
  },
  {
    id: 2, name: "Microsoft Corporation", description: "Tech company", source: "global", type: "company",
    createdBy: undefined,
    createdAt: undefined
  },
  {
    id: 3, name: "Project X", description: "Development project", source: "local", type: "project",
    createdBy: undefined,
    createdAt: undefined
  },
];

// Query for fuzzy matching with NLP processing
const query = "Microsft Corp"; // Intentional typo for demonstration

// Perform fuzzy matching with NLP processing
const matchedEntities = fuzzyMatchEntities(query, entities);
const filteredEntities = entities.filter((entity) => entity.type === "company");
console.log("Matched Entities:", matchedEntities, filteredEntities);
export type { BaseEntity, Entity };
