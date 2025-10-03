import { useState } from "react";
import { getDefaultDocumentOptions } from "@/app/components/documents/DocumentOptions";
import { DocumentBuilderProps } from "@/app/documents/SharedDocumentProps";
import { Phase } from "@/app/phases/Phase";
import PhaseManager from "@/app/phases/PhaseManager";
import useDocumentManagerSlice from "@/app/state/redux/slices/DocumentSlice";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from "@/app/models/BaseTypes";
import PersonaTypeEnum, { PersonaBuilder } from "@/app/pages/personas/PersonaBuilder";

// ---------------------------
// Helper types for DocumentData
// ---------------------------
type DocEntity = BaseDataEntity;
type DocK = DocEntity;
type DocMeta = DefaultMeta<DocEntity, DocK>;
type DocExcludedFields = DefaultExcludedFields<DocEntity>;

// ---------------------------
// DocumentData with generics
// ---------------------------
export interface DocumentData<
  T extends BaseDataEntity = DocEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DocMeta,
  ExcludedFields extends keyof T = DocExcludedFields
> {
  id: number | string;
  title: string;
  content: string;
  topics: string[];
  highlights: string[];
  files: string[];
  documentType?: string;
  documentOptions?: DocumentWithBuilderProps<T, K, Meta, ExcludedFields>;
}

// ---------------------------
// DocumentWithBuilderProps interface
// ---------------------------
export interface DocumentWithBuilderProps<
  T extends BaseDataEntity = DocEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DocMeta,
  ExcludedFields extends keyof T = DocExcludedFields
> extends DocumentData<T, K, Meta, ExcludedFields>,
        DocumentBuilderProps<T, K, Meta, ExcludedFields> {}

// ---------------------------
// Module-level document options
// ---------------------------
const documentOptions: DocumentWithBuilderProps = {
  isDynamic: true,
  options: getDefaultDocumentOptions(),
  documentPhase: "YourDocumentPhase",
  version: "YourDocumentVersion",
  onOptionsChange: (
    newOptions: DocumentData<DocEntity, DocK, DocMeta, DocExcludedFields>,
    id: number,
    topics: string[],
    highlights: string[],
    files: string[]
  ) => {
    console.log("Options changed:", newOptions);
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
  let phases: Phase[] = [];
  if (phaseManager && typeof phaseManager.createPhases === "function") {
    phases = phaseManager.createPhases();
  }

  // Define documents array
  const documentsData: DocumentData<DocEntity, DocK, DocMeta, DocExcludedFields>[] = [
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

export { documentOptions };
