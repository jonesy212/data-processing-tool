// MultimediaContentCustomization.ts
import { getDataFrameInfo } from "@/app/api/DataDashboardApi";
import React from "react";
import useDeviceDimensions, { DeviceDimensions } from "./DeviceDimensions";
import ReusableButton from "../../libraries/ui/buttons/ReusableButton";
import { brandingSettings } from "@/app/libraries/theme/BrandingService";
import { ChildComponentProps } from "../../hooks/ChildComponent";

interface MultimediaContent extends ChildComponentProps{

}
const MultimediaContentCustomization: React.FC<MultimediaContent> = ({router}) => {
  const deviceDimensions: DeviceDimensions = useDeviceDimensions();

  const handleFetchData = async () => {
    try {
      const dataFrameInfo = await getDataFrameInfo();
      console.log("DataFrame Info:", dataFrameInfo);
    } catch (error) {
      console.error("Error fetching DataFrame info:", error);
    }
  };

  return (
    <div
    style={{
      width: window.innerWidth < 768
        ? "100%"
        : window.innerWidth < 1024
        ? "80%"
        : "60%",
      margin: "auto",
    }}
  >
    <h1>Multimedia Content Customization</h1>
    <p>
      Device Dimensions: {window.innerWidth} x {window.innerHeight}
    </p>

    <ReusableButton
      router={router}
      brandingSettings={brandingSettings}
      onClick={handleFetchData} // Replace with ReusableButton
      label="Fetch DataFrame Info"
      variant="primary" // Optional: can be customized
    />

    {/* Adjust layout based on device type */}
    {window.innerWidth < 768 && <p>Rendering Mobile Layout</p>}
    {window.innerWidth >= 768 && window.innerWidth < 1024 && (
      <p>Rendering Tablet Layout</p>
    )}
    {window.innerWidth >= 1024 && <p>Rendering Desktop Layout</p>}
  </div>
  );
};

export default MultimediaContentCustomization;
