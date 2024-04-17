import React, { useState } from "react";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";
import { NoteAttachment, NoteData, NoteStatus, Change, NoteOptions } from "./NoteData"; // Assuming you have a NoteData interface
import { addNoteAPI, updateNoteAPI } from "@/app/api/ApiNote";
import { Attachment } from "./Attachment/attachment";
import Version from "../versions/Version";
import { NoteVersion } from './NoteData'
import { Collaborator } from "../models/teams/TeamMembers";

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
    previousMetadata: {},
    currentMetadata: {},
    accessHistory: [],
    lastModifiedDate: new Date(),
      version: {} as Version,
      tags: [] as string[],
      category: "",
      status: {} as NoteStatus,
      locked: false,
      changes: {} as Change[],
      options: {} as NoteOptions,
      versionHistory: {} as NoteVersion[] | Version[], // Use a union type to allow either NoteVersion or Version
      collaborators: {} as Collaborator[],
      attachments: {} as NoteAttachment[],
    
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
