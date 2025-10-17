// ExampleEntity.ts
// --- Core entity definition ---

interface ExampleEntity extends BaseDataEntity {
  name: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
}

// --- 6-type alias pattern ---
type ExampleK = ExampleEntity;
type ExampleMeta = DefaultMeta<ExampleEntity, ExampleK>;
type ExampleAttachment = Attachment;
type ExampleExcludedFields = DefaultExcludedFields<ExampleEntity>;
type ExampleIncludedFields = keyof ExampleEntity;
