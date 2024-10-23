// userScenarioCreation.ts

import { Phase } from "../phases/Phase";
import PhaseManager from "../phases/PhaseManager";
import PersonaTypeEnum, { PersonaBuilder } from "@/app/pages/personas/PersonaBuilder";
import { PhaseActions } from "../phases/PhaseActions"; // Import PhaseActions from PhaseActions file
import DocumentBuilder, { DocumentData } from '@/app/components/documents/DocumentBuilder'; // Corrected import without using 'new'
import  useDocumentManagerSlice  from "../state/redux/slices/DocumentSlice";
import { useState } from "react";
import { DocumentOptions, getDefaultDocumentOptions } from "../documents/DocumentOptions";
import { DocumentBuilderProps } from "../documents/SharedDocumentProps";

// Define function to create user scenarios and map out user journey
export function createUserScenarios() {
  const [options, setOptions] = useState(getDefaultDocumentOptions());

  // Create instances of UserPersonaBuilder, PhaseManager, and DocumentBuilder
  const userPersonaBuilder = new PersonaBuilder();
  const phaseManager = PhaseManager({ phases: [], }) as typeof PhaseManager | null;

  // Use the modules to create detailed user scenarios and map out user journey
  // Example:
  const userPersona = PersonaBuilder.buildPersona(PersonaTypeEnum.CasualUser);
  // Check if phaseManager is not null or undefined before accessing its properties
  if (phaseManager) {
    // Call the createPhases method if it exists
    const phases = phaseManager.createPhases(/* parameters */);
  }


// Define a new interface that extends both DocumentData and DocumentBuilderProps
interface DocumentWithBuilderProps extends DocumentData, DocumentBuilderProps {}


// Define documentOptions according to DocumentBuilderProps
// Now you can use this new interface for documentOptions
const documentOptions: DocumentWithBuilderProps = {
  isDynamic: true,
  options: getDefaultDocumentOptions(),
  documentPhase: "YourDocumentPhase", // Add appropriate value
  version: "YourDocumentVersion", // Add appropriate value
  onOptionsChange: (
    newOptions: DocumentData,
    id: number,
    topics: string[],
    highlights: string[],
    files: string[],
  ) => {
    
      options
    // Implement the function as needed
    setOptions(newOptions);
     }, // Implement the function as needed
};
  
  
// Instead of using 'documentOptions' directly in the documents array,
// you can use it as a separate object and then include it in each document item
const documentsData: DocumentData[] = [
  {
    ...getDefaultDocumentOptions(),
    id: 1,
    title: "Document 1",
    content: "Content for Document 1",
    topics: [],
    highlights: [],
    files: [],
    documentType: "DocumentType",
    documentOptions: documentOptions as DocumentData, // Include documentOptions
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
    documentOptions: documentOptions, // Include documentOptions
  },
];

// Now you can pass documentsData to your hook
const documents = useDocumentManagerSlice().documentBuilder({
  documents: documentsData,
});;


  let phases: Phase[] = [];

  // Output or utilize the created user scenarios and mapped user journey
  console.log("User scenarios and user journey mapped successfully.");
    // Output or utilize the created user scenarios and mapped user journey
    console.log("User Persona:", userPersona);
    console.log("Created Phases:", phases); // Assuming 'phases' variable is defined somewhere
    console.log("Documents:", documents);
    console.log("User scenarios and user journey mapped successfully.");
  
}


export {documentOptions}