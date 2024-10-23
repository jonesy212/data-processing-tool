import React, { useState, useEffect } from "react";
import { Snapshot, Snapshots } from "../snapshots/LocalStorageSnapshotStore";
import useDocumentStore, { Document } from "../state/stores/DocumentStore";
import { BaseData } from "../models/data/Data";
import { SnapshotItem } from "../snapshots";

interface DocumentSnapshotStoreProps {
  initialState?: Snapshot<Document, any> | null;
  initialStates?: Snapshots<Document>;
}

type DocumentSnapshots = Array<Snapshot<Document, any>>;


// DocumentSnapshotStore.tsx
const DocumentSnapshotStore: React.FC<DocumentSnapshotStoreProps> = ({
  initialState = null,
  initialStates = [],
}) => {
  const {
    documents,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    updateDocumentTags,
    selectedDocument,
    selectedDocuments,
  } = useDocumentStore();
  
  const [state, setState] = useState<Snapshot<Document, any> | null>(initialState);
  
  // Spread initialStates to correctly initialize the array
  const [states, setStates] = useState<DocumentSnapshots>(initialStates);

  const [currentDocumentId, setCurrentDocumentId] = useState<number>(0);
  
  const handleSelectSnapshot = (snapshot: Snapshot<Document, BaseData>) => {
    setState(snapshot);
    setCurrentDocumentId(snapshot.id as unknown as number);
  };


  const handleAddSnapshot = (snapshot: Snapshot<Document, BaseData>) => {
    setStates((prevStates) => [...prevStates, snapshot]);
  };
  
  const handleDeleteSnapshot = (snapshotId: string) => {
    setStates((prevStates) =>
      prevStates.filter((s) => s.id !== snapshotId)
    );
  };

  const restoreSnapshot = (snapshotId: string) => {
    const snapshot = states.find((s: Snapshot<Document, any>) => s.id === snapshotId);
    if (snapshot && snapshot.data) { // Ensure snapshot.data is not null or undefined
      setState(snapshot);
      updateDocument(currentDocumentId, snapshot.data as Document); // Explicitly assert the type
    }
  };

  const clearSnapshots = () => {
    setStates([]);
    setState(null);
  };

  const getSnapshotById = (snapshotId: string) => {
    return (
      states.find((s: Snapshot<Document, any>) => s.id === snapshotId) || null
    );
  };

  const getCurrentSnapshot = () => {
    return state;
  };

  const listSnapshots = () => {
    return states;
  };

  const compareSnapshots = (snapshotId1: string, snapshotId2: string) => {
    const snapshot1 = states.find(
      (s: Snapshot<Document, any>) => s.id === snapshotId1
    );
    const snapshot2 = states.find(
      (s: Snapshot<Document, any>) => s.id === snapshotId2
    );
    if (snapshot1 && snapshot2 && snapshot1.data && snapshot2.data) {
      return {
        snapshot1,
        snapshot2,
        differences: Object.keys(snapshot1.data as Record<string, any>).reduce((diffs, key) => {
          const data1 = snapshot1.data as Record<string, any>;
          const data2 = snapshot2.data as Record<string, any>;
          if (data1[key] !== data2[key]) {
            diffs[key] = {
              snapshot1: data1[key],
              snapshot2: data2[key],
            };
          }
          return diffs;
        }, {} as Record<string, any>),
      };
    }
    return null;
  };

  const compareSnapshotItems = (
    snapshotId1: string,
    snapshotId2: string,
    keys: string[]
  ) => {
    const snapshot1 = states.find((s: SnapshotItem<Document, any>) => s.id === snapshotId1);
    const snapshot2 = states.find((s: SnapshotItem<Document, any>) => s.id === snapshotId2);
  
    if (snapshot1 && snapshot2 && snapshot1.data && snapshot2.data) {
      const itemDifferences: Record<
        string,
        {
          snapshot1: any;
          snapshot2: any;
          differences: {
            [key: string]: { value1: any; value2: any };
          };
        }
      > = {};
  
      keys.forEach((key) => {
        // Assuming that snapshot1.data and snapshot2.data are Document types
        const value1 = (snapshot1.data as Record<string, any>)[key];
        const value2 = (snapshot2.data as Record<string, any>)[key];
  
        if (value1 !== value2) {
          itemDifferences[key] = {
            snapshot1: value1,
            snapshot2: value2,
            differences: {
              [key]: { value1, value2 },
            },
          };
        }
      });
  
      return {
        itemDifferences,
      };
    }
  
    return null;
  };  

  const exportSnapshot = (snapshotId: string) => {
    const snapshot = states.find(
      (s: SnapshotItem<Document, any>) => s.id === snapshotId
    );
    if (snapshot) {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(snapshot));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `snapshot_${snapshotId}.json`
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  const importSnapshot = (importedSnapshot: Snapshot<Document>) => {
    setStates((prevStates) => ({
      ...prevStates,
      [String(importedSnapshot.id) ?? importedSnapshot.id]: importedSnapshot,
    }));
  };

  

const revertToSnapshot = (snapshotId: string) => {
  const snapshot = states.find((s: Snapshot<Document, any>) => s.id === snapshotId);
  if (snapshot && snapshot.data) { // Ensure snapshot.data is not null or undefined
    setState(snapshot);
    updateDocument(currentDocumentId, snapshot.data as Document); // Explicitly assert the type
  }
};

  const duplicateSnapshot = (snapshotId: string) => {
    const snapshot = states.find(
      (s: Snapshot<Document, any>) => s.id === snapshotId
    );
    if (snapshot) {
      const newSnapshot: Snapshot<Document> = {
        ...snapshot,
        id: `${snapshot.id}_copy`,
        timestamp: new Date(),
      };
      setStates((prevStates) => ({
        ...prevStates,
        [String(newSnapshot.id) ?? newSnapshot.id]: newSnapshot,
      }));
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div>
      <h1>Document Snapshot Store</h1>
      <div>
        <button
          onClick={() =>
            addDocument({
              id: "1",
              title: "New Doc",
              content: "Content",

              createdBy: "Author",
              createdAt: new Date().toISOString(),
              visibility: "public",
              bgColor: "",
              documentURI: "",
              currentScript: null,
              defaultView: null,
              doctype: null,
              ownerDocument: null,
              scrollingElement: null,
              timeline: undefined,
              _rev: undefined,
              updatedBy: "",
              selectedDocument: null,
              characterSet: "",
              charset: "",
              compatMode: "",
              contentType: "",
              cookie: "",
              designMode: "",
              dir: "",
              domain: "",
              inputEncoding: "",
              lastModified: "",
              linkColor: "",
              referrer: "",
              vlinkColor: "",
              fullscreen: false,
              fullscreenEnabled: false,
              hidden: false,
              readyState: "",
              URL: "",
              rootElement: null,
            })
          }
        >
          Add Document
        </button>
        <button
          onClick={() =>
            updateDocument(currentDocumentId, {
              id: "1",
              title: "Updated Doc",
              content: "Updated Content",
              createdBy: "Author",
              createdAt: new Date().toISOString(),
              visibility: "public",
              bgColor: "",
              documentURI: "",
              currentScript: null,
              defaultView: null,
              doctype: null,
              ownerDocument: null,
              scrollingElement: null,
              timeline: undefined,
              _rev: undefined,
              updatedBy: "",
              selectedDocument: null,
              characterSet: "",
              charset: "",
              compatMode: "",
              contentType: "",
              cookie: "",
              designMode: "",
              dir: "",
              domain: "",
              inputEncoding: "",
              lastModified: "",
              linkColor: "",
              referrer: "",
              vlinkColor: "",
              fullscreen: false,
              fullscreenEnabled: false,
              hidden: false,
              readyState: "",
              URL: "",
              rootElement: null,
            })
          }
        >
          Update Document
        </button>
        <button onClick={() => deleteDocument("1")}>Delete Document</button>
        <button onClick={() => restoreSnapshot("1")}>Restore Snapshot</button>
        <button onClick={clearSnapshots}>Clear Snapshots</button>
      </div>
      <div>
        {(states as Snapshot<Document, any>[]).map((snapshot: Snapshot<Document, any>) => (
          <div key={snapshot.id}>
            {
              // Check if data is a Document
              snapshot.data && !(snapshot.data instanceof Map) ? (
                <>
                  <h2>{snapshot.data.title}</h2>
                  <p>{snapshot.data.content}</p>
                </>
              ) : (
                <>
                  <h2>Untitled Document</h2>
                  <p>No content available</p>
                </>
              )
            }
            <button onClick={() => handleSelectSnapshot(snapshot)}>
              Select
            </button>
            <button onClick={() => handleDeleteSnapshot(String(snapshot.id))}>
              Delete
            </button>
          </div>
        ))}
      </div>
      {state && state.data && !(state.data instanceof Map) && (
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
