"use client"; // Add this to ensure it's a client component

import YourParentComponent from "@/app/components/prompts/YourParentComponent";
import ColorPalette from "@/app/components/styling/ColorPalette";
import DynamicSpacingAndLayout from "@/app/components/styling/DynamicSpacingAndLayout";
import DynamicTypography, {
    BodyTextProps,
    DynamicTypographyProps,
    HeadingProps,
} from "@/app/components/styling/DynamicTypography";
import FrontendStructure from "@/configs/appStructure/FrontendStructureComponent";
import { NotificationType } from '@/app/state/context/NotificationContext';
import DataPreview, {
    DataPreviewProps,
} from "@/app/users/DataPreview";
import { UserData } from "@/app/users/User";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

// Dynamically import components that might have server-side dependencies
const RouteGuard = dynamic(
  () => import("@/app/components/routing/RouteGuard"),
  { ssr: false, loading: () => <div>Loading...</div> }
);

const FrontendStructureViewer = dynamic(
  () => import("@/app/components/development/FrontendStructureViewer"),
  { ssr: false, loading: () => <div>Loading...</div> }
);

const ProjectPhaseComponent = dynamic(
  () =>
    import("@/app//projects/projectManagement/ProjectPhaseComponent"),
  { ssr: false, loading: () => <div>Loading...</div> }
);

interface DesignDashboardBaseProps {
  colors: string[];
  onColorChange?: (newColors: string[]) => void;
  frontendStructure?: FrontendStructure;
  backendStructure?: any; // Changed from BackendStructure to any
}

const DesignDashboard: React.FC<DesignDashboardBaseProps> = ({
  colors,
  onColorChange,
  frontendStructure,
  backendStructure,
}) => {
  const [completionMessageLog] = useState<LogData>({
    message: "Design Completed",
    content: "Design Completed",
    date: new Date(),
    timestamp: new Date(),
    level: "info",
    type: "DesignCompleted" as NotificationType,
  });

  const [backendData, setBackendData] = useState<any>(null);

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const response = await fetch("/api/backend-structure");
        const data = await response.json();
        setBackendData(data);
      } catch (error) {
        console.error("Failed to fetch backend structure:", error);
      }
    };

    fetchBackendData();
  }, []);

  const handleColorChange = (
    colorIndex: number,
    newColor: string
  ): string[] => {
    const updatedColors = [...colors];
    updatedColors.splice(colorIndex, 1, newColor);
    onColorChange?.(updatedColors);
    return updatedColors;
  };

  const handleNewTitleChange = (newTitle: string) => newTitle;

  return (
    <>
      <DynamicTypography
        {...({} as DynamicTypographyProps & (BodyTextProps | HeadingProps))}
      />

      <DynamicSpacingAndLayout />

      {frontendStructure && (
        <FrontendStructureViewer frontendStructure={frontendStructure} />
      )}

      <ColorPalette
        colors={colors}
        onChange={handleColorChange}
        colorCodingEnabled={false}
      />

      <DataPreview data={{} as DataPreviewProps & UserData} />

      <ProjectPhaseComponent />

      <RouteGuard component={YourParentComponent} />
    </>
  );
};

export default DesignDashboard;
