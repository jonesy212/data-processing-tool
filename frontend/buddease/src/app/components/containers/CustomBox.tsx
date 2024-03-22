import React, { ReactNode } from "react";

import DynamicNamingConventions from "../DynamicNamingConventions";
import DynamicSpacingAndLayout from "../styling/DynamicSpacingAndLayout";
import DynamicComponent from "../styling/DynamicComponents";
import {
  ButtonGenerator,
  buttonGeneratorProps,
} from "@/app/generators/GenerateButtons";
import ResizablePanels from "@/app/components/hooks/userInterface/ResizablePanels";
import InputLabel from "../hooks/userInterface/InputFields";
import { Input } from "antd";
import ReusableButton from "../libraries/ui/buttons/ReusableButton";
import { brandingSettings } from "../projects/branding/BrandingSettings";
import router from "../projects/projectManagement/ProjectManagementSimulator";

interface CustomBoxProps {
  children: ReactNode;
  selectedFile?: File | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUpload: () => void;
}

const CustomBox: React.FC<CustomBoxProps> = ({
  children,
  selectedFile,
  handleFileSelect,
  handleFileUpload,
}) => {
  const sizes = () => [300, 300];

  const onResize = (newSizes: number[]) => {
    console.log("New sizes:", newSizes);
  };

  return (
    <ResizablePanels sizes={sizes} onResize={onResize}>
      <div>
        <div>
          <h5>File Sharing and Collaboration</h5>
          <InternalDivider />
          <div style={{ marginTop: "16px" }}>
            <InputLabel htmlFor="file-upload">Select File</InputLabel>
            <Input
              id="file-upload"
              type="file"
              placeholder="Select File"
              onChange={handleFileSelect}
            />
            <div style={{ marginTop: "16px" }}>
              {selectedFile && <p>Selected File: {selectedFile.name}</p>}
              {/* Update the Button component here */}
              <ReusableButton
                variant="contained"
                label="Upload File"
                color="primary"
                onClick={handleFileUpload}
                disabled={!selectedFile}
                style={{ marginLeft: "16px" }}
                router={router} 
                brandingSettings={brandingSettings} // Pass brandingSettings prop
              >
                Upload File
              </ReusableButton>
            </div>
          </div>
        </div>
        {/* Dynamic content */}
        <DynamicNamingConventions dynamicContent />
        <DynamicSpacingAndLayout
          dynamicContent
          margin="10px"
          padding="20px"
          border="1px solid #ccc"
        />
        <DynamicComponent
          dynamicContent
          title="Dynamic Card"
          content="Dynamic Card Content"
        />
        {/* Generated buttons from ButtonGenerator */}
        <ButtonGenerator {...buttonGeneratorProps} />
      </div>
      <div>{children}</div>
    </ResizablePanels>
  );
};

const InternalDivider: React.FC = () => {
  return (
    <div style={{ borderBottom: "1px solid #e0e0e0", margin: "16px 0" }} />
  );
};

export default CustomBox;
