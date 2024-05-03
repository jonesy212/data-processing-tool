import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
 import { Editor, EditorState } from 'draft-js';
import DocumentBuilder, { DocumentData } from './DocumentBuilder'; // Import the DocumentBuilder component
import useEditorState from '../state/useEditorState';
import useErrorHandling from '../hooks/useErrorHandling';
import { ComponentActions } from '../libraries/ui/components/ComponentActions';
import  userSettings, { UserSettings } from '@/app/configs/UserSettings';
import { options } from 'sanitize-html';
import { selectAppVersion, selectDatabaseVersion } from '../versions/AppVersion';
import { setCurrentPhase } from '../hooks/phaseHooks/EnhancePhase';
import { ProjectPhaseTypeEnum } from '@/app/components/models/data/StatusType';
import { getDocumentPhase } from './DocumentOptions';
    
const DocumentEditor = ({ documentId }: { documentId: DocumentData["id"] }) => {
  const dispatch = useDispatch();
  const [componentName, setComponentName] = useState("");
  const { editorState, handleEditorStateChange } = useEditorState(); // Use the useEditorState hook
  const { handleError } = useErrorHandling(); // Access handleError function from useErrorHandling
  const appVersion = useSelector(selectAppVersion);
  const databaseVersion = useSelector(selectDatabaseVersion);

  const handleUpdateComponent = () => {
    try {
      // Dispatch an action to update the component
      dispatch(
        ComponentActions.updateComponent({
          id: 1,
          updatedComponent: { name: componentName },
        })
      );
      // Reset the form after updating the component
      setComponentName("");
    } catch (error: any) {
      // Handle the error using the useErrorHandling hook
      handleError("Error updating component", { componentStack: error.stack });
    }
  };

  // Function to handle input change in the editor
  const handleInputChange = (newEditorState: EditorState) => {
    // Update editor state using the hook
    handleEditorStateChange(newEditorState);
  };

  // Function to handle editor state change
  const handleEditorChange = (newEditorState: EditorState) => {
    // Update editor state using the hook
    handleEditorStateChange(newEditorState);
  };

 
  return (
    <div>
      <h3>Document Editor</h3>
      <label>
        New Component Name:
        <input
          type="text"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
        />
      </label>
      <button onClick={handleUpdateComponent}>Update Component</button>

      {/* Integrate DocumentBuilder component */}
      <DocumentBuilder
        isDynamic={true}
        options={{
          uniqueIdentifier: "",
          documentType: {} as DocumentData,
          additionalOptions: [],
            documentPhase: "Draft",
            version: `${appVersion} (${databaseVersion})`, // Combine app and database versions

            userIdea: "",
            isDynamic: true,
            size: 'letter', 
            animations: { type: 'slide', duration: 500 },
            margin: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
            visibility: "private",
            fontSize: 14,
            textColor: "#000000",
            backgroundColor: "#ffffff",
            fontFamily: "Arial, sans-serif",
            font: "normal",
            lineSpacing: 1.5,
            alignment: "left",
            indentSize: 20,
            bulletList: true,
            numberedList: true,
            headingLevel: 1,
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            subscript: false,
            superscript: false,
            hyperlink: "",
            image: "",
            table: false,
            tableRows: 3,
            tableColumns: 3,
            codeBlock: false,
            blockquote: false,
            codeInline: false,
            quote: "",
            todoList: false,
            orderedTodoList: false,
            unorderedTodoList: false,
            content: "content",
            css: "css",
            html: "html",
            colorCoding: false,
            customSettings: {},
            documents: [],
            includeType: "all",
            includeTitle: true,
            includeContent: true,
            includeStatus: true,
            includeAdditionalInfo: true,
            title: "",
            userSettings: {} as UserSettings,
            dataVersions: { backend: 0, frontend: 0 },
          // Add other required properties here
        }}
        onOptionsChange={(newOptions) =>
          console.log("New options:", newOptions)
        }
              documentPhase={getDocumentPhase(options.documentPhase)}
              version={options.version}
              userIdea={options.userIdea}
        setOptions={(newOptions) => console.log("Set options:", newOptions)}
        documents={[]} // Pass documents array if needed
      />

      {/* Render the editor */}
      <textarea
        value={editorState.getCurrentContent().getPlainText()}
        onChange={handleInputChange}
        placeholder="Start typing..."
      />

      {/* Render the editor using Draft.js */}
      <Editor editorState={editorState} onChange={handleEditorChange} />
    </div>
  );
};

export default DocumentEditor;
