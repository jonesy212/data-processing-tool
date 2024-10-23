import { saveDrawingToDatabase } from "@/app/api/ApiDrawing";
import React, { useState } from "react";
import "./PreviewForm.css"; // Import CSS for styling

interface ValidationRule {
  rule: string;
  message: string;
}

interface FormData {
  [key: string]: {
    value: string;
    validationRules?: ValidationRule[];
  };
}

interface PreviewFormProps {
  initialContent: string; // Initial content of the document
  formData: FormData;
}

const PreviewForm: React.FC<PreviewFormProps> = ({
  initialContent,
  formData,
}) => {
  const [editedFormData, setEditedFormData] = useState<FormData>(formData);
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(true);
  const [previewMode, setPreviewMode] = useState<"full" | "split" | "preview">(
    "split"
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const toggleEditingMode = () => {
    setIsEditing(!isEditing);
  };

  const togglePreviewMode = (mode: "full" | "split" | "preview") => {
    setPreviewMode(mode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedFormData({
      ...editedFormData,
      [name]: {
        ...editedFormData[name],
        value,
      },
    });
  };

  const handleSaveClick = async () => {
    try {
      // Save the edited form data to the database
      await saveDrawingToDatabase(editedFormData);

      // Log the edited form data
      console.log("Edited form data saved:", editedFormData);

      // Update the state to indicate that editing mode is finished
      setIsEditing(false);
    } catch (error) {
      // Handle any errors that occur during the save process
      console.error("Error saving edited form data:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <div className="preview-form-container">
      <div className={`editor ${isEditing ? "" : "hidden"}`}>
        <textarea value={content} onChange={handleContentChange} />
        <button onClick={toggleEditingMode}>Toggle Editing Mode</button>
      </div>
      <div className={`preview ${!isEditing ? "" : "hidden"} ${previewMode}`}>
        <div className="preview-options">
          <button onClick={() => togglePreviewMode("full")}>
            Full Preview
          </button>
          <button onClick={() => togglePreviewMode("split")}>
            Split Screen
          </button>
          <button onClick={() => togglePreviewMode("preview")}>
            Preview Only
          </button>
        </div>
        <div className="preview-content">{content}</div>
      </div>
      {isEditing ? (
        <>
          {Object.entries(editedFormData).map(
            ([key, { value, validationRules }]) => (
              <div key={key} className="form-field">
                <label htmlFor={key}>{key}</label>
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleInputChange}
                />
                {validationRules && (
                  <ul>
                    {validationRules.map((rule, index) => (
                      <li key={index}>{rule.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          )}
          <button onClick={handleSaveClick}>Save</button>
        </>
      ) : (
        <>
          {Object.entries(formData).map(([key, { value, validationRules }]) => (
            <div key={key} className="form-field">
              <label htmlFor={key}>{key}</label>
              <span>{value}</span>
              {validationRules && (
                <ul>
                  {validationRules.map((rule, index) => (
                    <li key={index}>{rule.message}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <button onClick={handleEditClick}>Edit</button>
        </>
      )}
    </div>
  );
};

export default PreviewForm;
export type { FormData };
