// FormBuilder.tsx

import DocumentBuilder from "@/app/components/documents/DocumentBuilder";
import { DocumentOptions } from "@/app/components/documents/DocumentOptions";
import { DocumentBuilderProps } from "@/app/components/documents/SharedDocumentProps";
import React, { useState } from "react";
import DynamicForm from "./DynamicForm";

const FormBuilder: React.FC = () => {
  const [documentBuilderProps, setDocumentBuilderProps] =
    useState<DocumentBuilderProps>({
      isDynamic: true,
      documentPhase: "",
      version: "",
      options: {
        documentType: "",
        userIdea: "",
        additionalOptions: undefined,
        isDynamic: false,
        size: "custom",
        visibility: "public",
        fontSize: 0,
        textColor: "",
        backgroundColor: "",
        fontFamily: "",
        lineSpacing: 0,
        alignment: "left",
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
        documents: [],
      },
      onOptionsChange: (newOptions: DocumentOptions) => {
        // Handle options change
      },
    });

  
    const [showDocumentBuilder, setShowDocumentBuilder] = useState<boolean>(false);

  
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
          <button onClick={hideDocumentBuilderComponent}>Hide Document Builder</button>
        </>
      ) : (
        <>
          <DynamicForm {...documentBuilderProps} />
          <button onClick={showDocumentBuilderComponent}>Show Document Builder</button>
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
