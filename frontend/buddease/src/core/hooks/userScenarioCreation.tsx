// userScenarioCreation.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { getDefaultDocumentOptions } from '@/core/documents/DocumentOptions';
import type { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import type { DocumentBuilderProps } from '@/core/documents/SharedDocumentProps';
import type { Phase } from '@/core/models/phases/Phase';
import PhaseManager from '@/core/models/phases/PhaseManager';
import type { PersonaBuilder } from '@/core/pages/personas/PersonaBuilder';
import PersonaTypeEnum from '@/core/pages/personas/PersonaBuilder';
import useDocumentManagerSlice from '@/core/state/redux/slices/DocumentSlice';
import type { DocumentAttachment, DocumentEntity, DocumentExcludedFields, DocumentIncludedFields, DocumentK, DocumentMeta } from '@/core/typings/entities/DocumentEntity';
import { Version } from '@/core/versions/Version';
import { useState } from 'react';

// ---------------------------
// DocumentWithBuilderProps interface
// ---------------------------
export interface DocumentWithBuilderProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        DocumentBuilderProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {}



// ---------------------------
// DocumentOptions for DAppAdapterConfig
// ---------------------------
const documentOptions: DocumentOptions<
  DocumentEntity,
  DocumentK,
  DocumentMeta,
  DocumentAttachment,
  DocumentExcludedFields,
  DocumentIncludedFields
> = getDefaultDocumentOptions<
  DocumentEntity,
  DocumentK,
  DocumentMeta,
  DocumentAttachment,
  DocumentExcludedFields,
  DocumentIncludedFields
>();


documentOptions.documentId = "default-document-id";
documentOptions.uniqueIdentifier = "default-unique-id";
documentOptions.additionalOptionsLabel = "Additional Options";

// ---------------------------
// DocumentWithBuilderProps for builder functionality
// ---------------------------
const documentWithBuilderProps: DocumentWithBuilderProps<
  DocumentEntity,
  DocumentK,
  DocumentMeta,
  DocumentAttachment,
  DocumentExcludedFields,
  DocumentIncludedFields
  > = {
  
  id, title, content, documents,
    
  isDynamic: true,
  options: documentOptions, // Reference the documentOptions above

  documentPhase: "YourDocumentPhase",

  version: {} as Version<
    DocumentEntity,
    DocumentK,
    DocumentMeta,
    DocumentAttachment,
    DocumentExcludedFields,
    DocumentIncludedFields
  >,

  onOptionsChange: (newOptions) => {
    // Access extra info from additionalOptions/customProperties
    const extra = newOptions.customProperties as {
      id?: number;
      topics?: string[];
      highlights?: string[];
      files?: string[];
    } | undefined;

    console.log("Options changed:", newOptions);
    if (extra) {
      console.log("ID:", extra.id);
      console.log("Topics:", extra.topics);
      console.log("Highlights:", extra.highlights);
      console.log("Files:", extra.files);
    }
  },
};

// ---------------------------
// Function to create user scenarios
// ---------------------------
export function createUserScenarios() {
  const [options, setOptions] = useState(getDefaultDocumentOptions());

  // Create instances
  const userPersonaBuilder = new PersonaBuilder();
  const phaseManager = PhaseManager({ phases: [] }) as typeof PhaseManager | null;

  // Create a user persona
  const userPersona = PersonaBuilder.buildPersona(PersonaTypeEnum.CasualUser);

  // Create phases if PhaseManager exists
  let phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  if (phaseManager && typeof phaseManager.createPhases === "function") {
    phases = phaseManager.createPhases();
  }

  // Define documents array
  const documentsData: DocumentData<DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentIncludedFields, DocumentExcludedFields>[] = [
    {
      ...getDefaultDocumentOptions(),
      id: 1,
      title: "Document 1",
      content: "Content for Document 1",
      topics: [],
      highlights: [],
      files: [],
      documentType: "DocumentType",
      documentOptions: documentOptions,
    },
    {
      ...getDefaultDocumentOptions(),
      id: 2,
      title: "Document 2",
      content: "Content for Document 2",
      topics: [],
      highlights: [],
      files: [],
      documentType: "DocumentType",
      documentOptions: documentOptions,
    },
  ];

  // Initialize documents using the DocumentManagerSlice
  const documents = useDocumentManagerSlice().documentBuilder({
    documents: documentsData,
  });

  // Debug logs
  console.log("User Persona:", userPersona);
  console.log("Created Phases:", phases);
  console.log("Documents:", documents);
  console.log("User scenarios and user journey mapped successfully.");

  return { userPersona, phases, documents, documentOptions };
}

export { documentOptions, documentWithBuilderProps };
