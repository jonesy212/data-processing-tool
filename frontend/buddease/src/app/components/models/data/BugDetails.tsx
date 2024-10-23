// BugDetails.tsx
import { ButtonGenerator } from "@/app/generators/GenerateButtons";
import ListGenerator from "@/app/generators/ListGenerator";
import React, { useState } from "react";

interface BugDetailsProps {
  bugDetails: {
    bug: string;
    bug_type: string;
    bug_description: string;
    bug_severity: string;
    bug_impact: string;
    bug_status: string;
    type: {
      fields: {
        id: string;
        name: string;
        title: string;
        type: string;
        required: boolean;
        updatedAt: Date;
      }[];
    };
  };
}

const BugDetails: React.FC<BugDetailsProps> = ({ bugDetails }) => {
  const [bugData, setBugData] = useState<{
    bug: string;
    bug_type: string;
    bug_description: string;
    bug_severity: string;
    bug_impact: string;
    bug_status: string;
  }>({
    bug: "",
    bug_type: "",
    bug_description: "",
    bug_severity: "",
    bug_impact: "",
    bug_status: "",
  });

  const [errors, setErrors] = useState({
    bug: "",
    bug_type: "",
    bug_description: "",
    bug_severity: "",
    bug_impact: "",
    bug_status: "",
  });

  let newErrors: {
    bug: string;
    bug_type: string;
    bug_description: string;
    bug_severity: string;
    bug_impact: string;
    bug_status: string;
  } = { ...errors };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBugData({ ...bugData, [name]: value });

    // Clear error message when the field is being changed
    setErrors({ ...errors, [name]: "" });

  };

  const handleValidation = () => {
    let formIsValid = true;
    let newErrors = { ...errors };

    // Validate required fields
    Object.keys(bugData).forEach((key) => {
      if (!bugData[key as keyof typeof bugData]) {
        // Add type assertion
        newErrors[key as keyof typeof newErrors] = `${key.replace(
          "_",
          " "
        )} is required`; // Add type assertion
        formIsValid = false;
      } else {
        newErrors[key as keyof typeof newErrors] = "";
      }
    });

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleValidation()) {
      // Proceed with submitting bug data
      console.log("Bug data submitted:", bugData);
    } else {
      console.log("Form has errors, please fix them before submitting.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic
    const files = e.target.files;
    console.log("Uploaded files:", files);
  };

  return (
    <div>
      <h2>Bug Details</h2>
      <form onSubmit={handleSubmit}>
        <ListGenerator
          items={bugDetails.type.fields.map((field) => ({
            id: field.id,
            label: field.title,
            value: bugData[field.name as keyof typeof bugData], // Add type assertion
            updatedAt: field.updatedAt,
            onChange: handleChange, // Pass the handleChange function
          }))}
        />

        <div>
          <label htmlFor="fileUpload">Attach File or Screenshot</label>
          <input
            type="file"
            id="fileUpload"
            name="fileUpload"
            onChange={handleFileUpload}
          />
        </div>
        <ButtonGenerator onSubmit={()=>handleSubmit} />
      </form>
    </div>
  );
};

export default BugDetails;
