import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { UserData } from "@/app/components/users/User";
import { createMetaState } from '@/app/configs/metadata/createMetadataState';
import React, { useState } from "react";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";
import { NoteAttachment, NoteData, NoteStatus, Change, NoteOptions } from "./NoteData"; // Assuming you have a NoteData interface
import { addNoteAPI, updateNoteAPI } from "@/app/api/ApiNote";
import { Attachment } from '@/app/components/documents/Attachment/attachment'
import Version from "../versions/Version";
import { NoteVersion } from './NoteData'
import { Collaborator } from "../models/teams/TeamMembers";
import { VersionHistory } from "@/app/components/versions/VersionData";

const NoteBuilder: React.FC = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [noteData, setNoteData] = useState<NoteData>({
    id: 0,
    title: "",
    content: "",
    topics: [],
    highlights: [],
    keywords: [],
    folderPath: "",
    previousContent: "",
    currentContent: "",
    previousMetadata: createMetaState(
      "", // id: unique identifier for the metadata
      "", // apiEndpoint: endpoint for the API to fetch metadata
      "", // apiKey: authentication key for API requests
      0, // timeout: request timeout in milliseconds
      0, // retryAttempts: number of retry attempts in case of failure
      "", // name: name of the metadata entity
      "", // category: category for metadata
      "", // timestamp: timestamp when the metadata was last modified
      "", // createdBy: user who created the metadata
      [], // tags: tags associated with the metadata
      undefined, // metadata: metadata object, can be undefined initially
      undefined, // initialState: initial state of the metadata, can be undefined
      {} as Map<string, Snapshot<UserData<BaseData<any, any, StructuredMetadata<any, any>>, never>, never, StructuredMetadata<UserData<BaseData<any, any, StructuredMetadata<any, any>>, never>, never>, never>>, // meta: additional metadata, can be an empty array if not needed
      { eventRecords: {} }, // events: event manager data, initializing with an empty event record
      [], // relatedData: related data associated with metadata, empty array for now
      {} as Version<T, K>, // version: version information, can be undefined if not applicable
      {} as VersionHistory, // lastUpdated: last updated version history, it should be provided
      true, // isActive: boolean flag indicating whether metadata is active or not
      {}, // config: configuration settings for the metadata, using an empty object
      [], // permissions: permissions associated with the metadata, empty for now
      {}, // customFields: any custom fields you might have for metadata, empty object
      "" // baseUrl: the base URL for API requests, can be an empty string if not used
    ),
    
    currentMetadata: createMetaState(
      "", // id: unique identifier for the metadata
      "", // apiEndpoint: endpoint for the API to fetch metadata
      "", // apiKey: authentication key for API requests
      0, // timeout: request timeout in milliseconds
      0, // retryAttempts: number of retry attempts in case of failure
      "", // name: name of the metadata entity
      "", // category: category for metadata
      "", // timestamp: timestamp when the metadata was last modified
      "", // createdBy: user who created the metadata
      [], // tags: tags associated with the metadata
      undefined, // metadata: metadata object, can be undefined initially
      undefined, // initialState: initial state of the metadata, can be undefined
      {} as Map<string, Snapshot<UserData<BaseData<any, any, StructuredMetadata<any, any>>, never>, never, StructuredMetadata<UserData<BaseData<any, any, StructuredMetadata<any, any>>, never>, never>, never>>, // meta: additional metadata, can be an empty array if not needed
      { eventRecords: {} }, // events: event manager data, initializing with an empty event record
      {} as Version, // version: version information, can be undefined if not applicable
      {} as VersionHistory, // lastUpdated: last updated version history, it should be provided
      true, // isActive: boolean flag indicating whether metadata is active or not
      {}, // config: configuration settings for the metadata, using an empty object
      [], // permissions: permissions associated with the metadata, empty for now
      {}, // customFields: any custom fields you might have for metadata, empty object
      "", // baseUrl: the base URL for API requests, can be an empty string if not used
      [], // relatedData: related data associated with metadata, empty array for now
      [], 
    ),
    accessHistory: [],
    lastModifiedDate: new Date(),
    version: {} as Version,
    tags: [] as string[],
    category: "",
    status: {} as NoteStatus,
    locked: false,
    changes: [] as Change[],
    options: {} as NoteOptions,
    versionHistory: [] as NoteVersion[] | Version[],
    collaborators: [] as Collaborator[],
    attachments: [] as NoteAttachment[],
    
    // Add more properties as needed
  });

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNoteData({ ...noteData, title: event.target.value });
  };

  const handleSaveNote = async () => {
    try {
      if (noteData.id === 0) {
        // If note id is 0, it's a new note, so add it
        const addedNote = await addNoteAPI(noteData);
        console.log("Note added successfully:", addedNote);
      } else {
        // If note id is not 0, update the existing note
        const updatedNote = await updateNoteAPI(noteData.id, noteData);
        console.log("Note updated successfully:", updatedNote);
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter note title"
        value={noteData.title}
        onChange={handleTitleChange}
      />
      <div style={{ border: "1px solid #ccc", padding: "10px" }}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
      <button onClick={handleSaveNote}>
        {noteData.id === 0 ? "Save Note" : "Update Note"}
      </button>
    </div>
  );
};

export default NoteBuilder;
