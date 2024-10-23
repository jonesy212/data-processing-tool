// RealtimeTranscriptionComponent.tsx
import React from "react";
import { useCallback, useEffect } from "react";
import useRealtimeData from "./hooks/commHooks/useRealtimeData";
import useRealtimeEditing from "./hooks/useRealtimeEditing";
import useDocumentStore, { Document } from "./state/stores/DocumentStore";
import calculateKPMBasedOnEditorChanges from "./strategy/calculateKPMBasedOnEditorChanges";
import * as apiDocument from './../../app/api/ApiDocument'
const RealtimeTranscriptionComponent = () => {
  const { documents, fetchDocuments, updateDocument } = useDocumentStore();
  const documentIds = Object.keys(documents);
  const documentId: number = documentIds.length > 0 ? parseInt(documentIds[0]) : 0;
  const { editorState, sendChange } = useRealtimeEditing(documentId);

  const updateCallback = useCallback((
    data: any,
    events: any
  ) => {
    const kpm = data.kpm;
    realTimeTranscription(kpm);
  }, []);

  useRealtimeData([], updateCallback);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDocumentDelete = (documentId: string) => {
    apiDocument.deleteDocumentAPI(documentId);
  };

  const handleDocumentUpdate = async (documentId: number) => {
    try {
      const updatedData = {
        // Assuming 'content' is the key for the content in your DocumentData interface
        content: editorState.getCurrentContent().getPlainText(), 
        // Add other properties as needed
      };
            const updatedDocumentData = await apiDocument.updateDocumentAPI(documentId, updatedData);
      updateDocument(documentId, updatedDocumentData);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  useEffect(() => {
    const kpm = calculateKPMBasedOnEditorChanges(editorState) as number;
    realTimeTranscription(kpm);
  }, [editorState]);

  useEffect(() => {
    handleDocumentDelete(documentId.toString());
    handleDocumentUpdate(documentId);
  }, [documentId]);

  return <div>Realtime Transcription Component</div>;
};

export default RealtimeTranscriptionComponent;
