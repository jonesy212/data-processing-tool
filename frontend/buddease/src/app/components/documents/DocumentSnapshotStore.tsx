import React, { useState, useEffect } from "react";
import { Snapshot, Snapshots } from "../snapshots/LocalStorageSnapshotStore";
import useDocumentStore, { Document } from "../state/stores/DocumentStore";
import { BaseData } from "../models/data/Data";

interface DocumentSnapshotStoreProps {
  initialState?: Snapshot<Document, any> | null;
  initialStates?: Snapshots<Document>;
}
// DocumentSnapshotStore.tsx
const DocumentSnapshotStore: React.FC<DocumentSnapshotStoreProps> = ({
    initialState = null,
    initialStates = []
  }) => {
    const { documents, fetchDocuments, addDocument, updateDocument, deleteDocument, updateDocumentTags, selectedDocument, selectedDocuments } = useDocumentStore();
    const [state, setState] = useState<Snapshot<Document, any> | null>(initialState);
    const [states, setStates] = useState<Snapshots<Document>>(initialStates);
    const [currentDocumentId, setCurrentDocumentId] = useState<number>(0);
  
    const handleAddSnapshot = (snapshot: Snapshot<BaseData, Document>) => {
      setStates((prevStates) => [...prevStates, snapshot]);
    };
  
    const handleSelectSnapshot = (snapshot: Snapshot<BaseData, Document>) => {
      setState(snapshot);
      setCurrentDocumentId(snapshot.id as unknown as number);
    };
  
    const handleDeleteSnapshot = (snapshotId: string) => {
      setStates((prevStates) => prevStates.filter((s) => s.id !== snapshotId));
    };
  
    const restoreSnapshot = (snapshotId: string) => {
      const snapshot = states.find((s) => s.id === snapshotId);
      if (snapshot) {
        setState(snapshot);
        updateDocument(currentDocumentId, snapshot.data);
      }
    };
  
    const clearSnapshots = () => {
      setStates([]);
      setState(null);
    };
  
    const getSnapshotById = (snapshotId: string) => {
      return states.find((s) => s.id === snapshotId) || null;
    };
  
    const getCurrentSnapshot = () => {
      return state;
    };
  
    const listSnapshots = () => {
      return states;
    };
  
    const compareSnapshots = (snapshotId1: string, snapshotId2: string) => {
      const snapshot1 = states.find((s) => s.id === snapshotId1);
      const snapshot2 = states.find((s) => s.id === snapshotId2);
      if (snapshot1 && snapshot2) {
        return {
          snapshot1,
          snapshot2,
          differences: Object.keys(snapshot1.data).reduce((diffs, key) => {
            if (snapshot1.data[key] !== snapshot2.data[key]) {
              diffs[key] = { snapshot1: snapshot1.data[key], snapshot2: snapshot2.data[key] };
            }
            return diffs;
          }, {} as Record<string, any>)
        };
      }
      return null;
    };
  
    const exportSnapshot = (snapshotId: string) => {
      const snapshot = states.find((s) => s.id === snapshotId);
      if (snapshot) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `snapshot_${snapshotId}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    };
  
    const importSnapshot = (importedSnapshot: Snapshot<Document>) => {
      setStates((prevStates) => [...prevStates, importedSnapshot]);
    };
  
    const revertToSnapshot = (snapshotId: string) => {
      const snapshot = states.find((s) => s.id === snapshotId);
      if (snapshot) {
        setState(snapshot);
        updateDocument(currentDocumentId, snapshot.data);
      }
    };
  
    const duplicateSnapshot = (snapshotId: string) => {
      const snapshot = states.find((s) => s.id === snapshotId);
      if (snapshot) {
        const newSnapshot: Snapshot<Document> = {
          ...snapshot,
          id: `${snapshot.id}_copy`,
          timestamp: new Date(),
        };
        setStates((prevStates) => [...prevStates, newSnapshot]);
      }
    };
  
    useEffect(() => {
      fetchDocuments();
    }, []);
  
    return (
      <div>
        <h1>Document Snapshot Store</h1>
        <div>
          <button onClick={() => addDocument({ id: "1", title: "New Doc", content: "Content", createdBy: "Author", createdAt: new Date().toISOString(), visibility: "public" })}>Add Document</button>
          <button onClick={() => updateDocument(currentDocumentId, { id: "1", title: "Updated Doc", content: "Updated Content", createdBy: "Author", createdAt: new Date().toISOString(), visibility: "public" })}>Update Document</button>
          <button onClick={() => deleteDocument("1")}>Delete Document</button>
          <button onClick={() => restoreSnapshot("1")}>Restore Snapshot</button>
          <button onClick={clearSnapshots}>Clear Snapshots</button>
        </div>
        <div>
          {states.map((snapshot) => (
            <div key={snapshot.id}>
              <h2>{snapshot.data.title}</h2>
              <p>{snapshot.data.content}</p>
              <button onClick={() => handleSelectSnapshot(snapshot)}>Select</button>
              <button onClick={() => handleDeleteSnapshot(snapshot.id)}>Delete</button>
            </div>
          ))}
        </div>
        {state && (
          <div>
            <h2>Selected Snapshot</h2>
            <p>Title: {state.data.title}</p>
            <p>Content: {state.data.content}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default DocumentSnapshotStore;