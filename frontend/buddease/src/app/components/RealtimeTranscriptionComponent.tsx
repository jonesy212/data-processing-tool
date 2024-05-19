// RealtimeTranscriptionComponent.tsx

import { useCallback, useEffect } from "react";
import { initializeUserData } from "../pages/onboarding/PersonaBuilderData";
import useRealtimeData from "./hooks/commHooks/useRealtimeData";
import useRealtimeEditing from "./hooks/useRealtimeEditing";
import calculateKPMBasedOnEditorChanges from "./strategy/calculateKPMBasedOnEditorChanges";
import useDocumentStore, { Document } from "./state/stores/DocumentStore";
import { DocumentSliceState } from "./state/redux/slices/DocumentSlice";
import { DocumentData } from "./documents/DocumentBuilder";

const RealtimeTranscriptionComponent = () => {
    const documentId = useDocumentStore()
    const { editorState, sendChange } = useRealtimeEditing(documentId);

    const updateCallback = useCallback((
        data: any,
        events: any
    ) => {
    // Extract KPM data from the received data object
    const kpm = data.kpm; // Assuming kpm is a property in the received data object

    // Call the real-time transcription function with the retrieved KPM
    realTimeTranscription(kpm);
  }, []);

  // Utilize the useRealtimeData hook with the appropriate initial data and the update callback
  useRealtimeData(initializeUserData, updateCallback);

    
    useEffect(() => {
      useDocumentStore().fetchDocuments()

        
        

        
  const handleDocumentDelete = (documentId: string) => {
    // Call deleteDocument method from DocumentStore
    useDocumentStore().deleteDocument(documentId);
  };

  const handleDocumentUpdate = (documentId: string, updatedDocument: Document) => {
    // Call updateDocument method from DocumentStore
    useDocumentStore().updateDocument(documentId, updatedDocument);
  };

    // Calculate KPM based on editor changes (e.g., keystrokes) and call real-time transcription function
    const kpm = calculateKPMBasedOnEditorChanges(editorState) as number; // Ensure kpm is a number
    realTimeTranscription(kpm);
  }, [editorState]);


  return <div>Realtime Transcription Component</div>;
};


export default RealtimeTranscriptionComponent;