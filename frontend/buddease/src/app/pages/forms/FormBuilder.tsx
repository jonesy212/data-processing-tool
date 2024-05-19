// FormBuilder.tsx

import DocumentBuilder from "@/app/components/documents/DocumentBuilder";
import { DocumentOptions } from "@/app/components/documents/DocumentOptions";
import { DocumentBuilderProps } from "@/app/components/documents/SharedDocumentProps";
import React, { useState } from "react";
import DynamicForm from "./DynamicForm";
import { DocumentSize, ProjectPhaseTypeEnum } from "@/app/components/models/data/StatusType";
import { DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import { AlignmentOptions } from "@/app/components/state/redux/slices/toolbarSlice";
import AppVersionImpl from "@/app/components/versions/AppVersion";
import useFilePath from "@/app/components/hooks/useFilePath";

// Assuming AppVersionImpl has methods getAppName and getVersion
const versionInfo = useFilePath()
const appVersion = new AppVersionImpl(versionInfo);

const FormBuilder: React.FC = () => {
  const [documentBuilderProps, setDocumentBuilderProps] =
    useState<DocumentBuilderProps>({
      isDynamic: true,
      documentPhase: {
        phaseType: ProjectPhaseTypeEnum.Ideation,
        onChange: function (phase: ProjectPhaseTypeEnum): void {},
        customProp1: "",
        customProp2: 0,
      },
      version: {
        appName: "Your App Name",
        releaseDate: new Date().toISOString(),
        releaseNotes: ["Initial release"],
        minor: 0,
        major: 1,
        patch: 0,
        prerelease: false,
        metadata: {
          author: "",
          timestamp: new Date(),
        },
        build: 0,
        isDevBuild: false,
        getAppName: () => "Your App Name",
        updateAppName: (name: string) => {},
        // Add other missing properties from AppVersionImpl here
      } as AppVersionImpl,
      options: {
        documentType: DocumentTypeEnum.Default,
        userIdea: "",
        additionalOptions: undefined,
        isDynamic: false,
        size: DocumentSize.Custom,
        visibility: "public",
        fontSize: 0,
        textColor: "",
        backgroundColor: "",
        fontFamily: "",
        lineSpacing: 0,
        alignment: AlignmentOptions.LEFT,
        indentSize: 0,
        bulletList: false,
        numberedList: false,
        headingLevel: 0,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        subscript: false,
        superscript: false,
        hyperlink: "",
        image: "",
        table: false,
        tableRows: 0,
        tableColumns: 0,
        codeBlock: false,
        blockquote: false,
        codeInline: false,
        quote: "",
        todoList: false,
        orderedTodoList: false,
        unorderedTodoList: false,
        colorCoding: false,
        customSettings: {} as DocumentOptions["customSettings"],
        animations: {} as DocumentOptions["animations"],
       
        uniqueIdentifier: appVersion.getAppName(), // Example, replace with appropriate value
        documentSize: DocumentSize,
        documentPhase: "", // Example, replace with appropriate value
        version: appVersion, // Assuming appVersion is an instance of AppVersionImpl
        // Add other missing properties from DocumentOptions here
        documents: [],
  

      },
      onOptionsChange: (newOptions: DocumentOptions) => {
        // Handle options change
      },
    });

  const [showDocumentBuilder, setShowDocumentBuilder] =
    useState<boolean>(false);

  // Function to handle showing the DocumentBuilder component
  const showDocumentBuilderComponent = () => {
    setShowDocumentBuilder(true);
  };

  // Function to handle hiding the DocumentBuilder component
  const hideDocumentBuilderComponent = () => {
    setShowDocumentBuilder(false);
  };

  // Function to handle adding a new question
  const addQuestion = () => {
    // Logic to add a new question to the document builder props
    // Update documentBuilderProps with the new question
  };

  // Function to handle submitting the form
  const handleSubmit = () => {
    // Logic to submit the form data
  };

  return (
    <div id="formBuilder">
      <div id="formBuilder">
        {showDocumentBuilder ? (
          <>
            <DocumentBuilder {...documentBuilderProps} />
            <button onClick={hideDocumentBuilderComponent}>
              Hide Document Builder
            </button>
          </>
        ) : (
          <>
            <DynamicForm {...documentBuilderProps} />
            <button onClick={showDocumentBuilderComponent}>
              Show Document Builder
            </button>
          </>
        )}
      </div>
      <button id="addQuestionBtn" onClick={addQuestion}>
        Add Question
      </button>
      <div id="questionsContainer">{/* Render questions here */}</div>
      <DocumentBuilder {...documentBuilderProps} />
      <button id="submitBtn" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default FormBuilder;
