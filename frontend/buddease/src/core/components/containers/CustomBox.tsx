CustomBox.tsx
import DynamicComponent from "@/core/components/styling/DynamicComponents";
import DynamicSpacingAndLayout from "@/core/components/styling/DynamicSpacingAndLayout";
import DynamicTypography from "@/core/components/styling/DynamicTypography";
import {
    ButtonGenerator,
    useButtonGeneratorProps, // Import the hook
} from "@/core/generators/GenerateButtons";
import { usePanelContents } from "@/core/generators/usePanelContents";
import { Input } from '@/core/hooks/userInterface/InputFields';
import ResizablePanels, {
    ResizablePanelsProps,
} from "@/core/hooks/userInterface/ResizablePanels";
import { brandingSettings } from "@/core/libraries/theme/BrandingService";
import CustomSlider from "@/core/libraries/ui/buttons/CustomSlider";
import ReusableButton from "@/core/libraries/ui/buttons/ReusableButton";
import { ExtendedRouter } from "@/core/pages/MyAppWrapper";
import FormControl from "@/core/pages/forms/FormControl";
import DynamicNamingConventions from "@/utils/DynamicNamingConventions";
import { Router, useRouter } from "next/router";
import React, { ReactNode, useRef } from "react";

interface CustomBoxProps extends ResizablePanelsProps {
  children: ReactNode[];
  selectedFile?: File | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUpload: () => void;
  mt: number;
}

const CustomBox: React.FC<CustomBoxProps> = ({
  children,
  selectedFile,
  handleFileSelect,
  handleFileUpload,
}) => {
  const panelSizes = () => [300, 300];
  const router = useRouter();
  const formID = useRef<HTMLFormElement>(null);
  
  // Define state to hold the number of panels
  const { numPanels, handleNumPanelsChange, panelContents } = usePanelContents();
  
  // Use the new hook to get button props
  const { buttonProps, currentPhase, lifecycleManager } = useButtonGeneratorProps();

  const onResize = (newSizes: number[]) => {
    console.log("New sizes:", newSizes);
  };

  return (
    <ResizablePanels
      sizes={panelSizes()}
      onResizeStop={(newSizes) => {
        onResize(newSizes);
      }}
      onResize={onResize}
    >
      {panelContents.map((content, index) => (
        <div key={index}>{content}</div>
      ))}
      <div>
        <DynamicTypography
          variant="h5"
          dynamicFont="Aria, sans-serif"
          dynamicColor="#000000"
          fontSize=""
          fontFamily=""
        >
          File Sharing and Collaboration
        </DynamicTypography>
        <div>
          <h5>File Sharing and Collaboration</h5>
          <InternalDivider />

          <div style={{ marginTop: "16px" }}>
            <FormControl formID={formID} fullWidth>
              <InputLabel htmlFor="file-upload">Select File</InputLabel>
              <Input
                id="file-upload"
                type="file"
                placeholder="Select File"
                onChange={handleFileSelect}
              />
            </FormControl>

            <div style={{ marginTop: "16px" }}>
              {selectedFile && <p>Selected File: {selectedFile.name}</p>}
              <ReusableButton
                variant="contained"
                label="Upload File"
                color="primary"
                onClick={handleFileUpload}
                disabled={!selectedFile}
                style={{ marginLeft: "16px" }}
                router={router as ExtendedRouter & Router}
                brandingSettings={brandingSettings}
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
        <ButtonGenerator {...buttonProps} />
      </div>
      <div>{children}</div>
      <CustomSlider
        min={1}
        max={10}
        value={numPanels}
        onChange={handleNumPanelsChange}
      />
    </ResizablePanels>
  );
};

const InternalDivider: React.FC = () => {
  return (
    <div style={{ borderBottom: "1px solid #e0e0e0", margin: "16px 0" }} />
  );
};

export default CustomBox;