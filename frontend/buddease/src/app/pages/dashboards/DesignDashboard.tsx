// DesignDashboard.tsx
"use client";

import YourParentComponent from "@/app/components/prompts/YourParentComponent";
import ColorPalette from "@/app/components/styling/ColorPalette";
import DynamicSpacingAndLayout from "@/app/components/styling/DynamicSpacingAndLayout";
import DynamicTypography, {
  BodyTextProps,
  DynamicTypographyProps,
  HeadingProps,
} from "@/app/components/styling/DynamicTypography";
import FrontendStructure from "@/app/config/appStructure/FrontendStructureComponent";
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import DataPreview, {
  DataPreviewProps,
} from "@/app/users/DataPreview";
import { UserData } from "@/app/users/User";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { LogData } from '@/app/models/LogData';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

// Dynamically import components with proper typing
const RouteGuard = dynamic(
  () => import("@/app/components/routing/RouteGuard")
    .then((mod) => mod.default || mod),
  { ssr: false, loading: () => <div>Loading...</div> }
) as React.FC<{
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallbackPath?: string;
  enableFuzzyAuth?: boolean;
}>;

const FrontendStructureViewer = dynamic(
  () => import("@/app/components/development/FrontendStructureViewer")
    .then((mod) => mod.default || mod),
  { ssr: false, loading: () => <div>Loading...</div> }
) as React.FC<{
  frontendStructure?: any;
}>;

const ProjectPhaseComponent = dynamic(
  () => import("@/app/projects/projectManagement/ProjectPhaseComponent")
    .then((mod) => mod.default || mod),
  { ssr: false, loading: () => <div>Loading...</div> }
) as React.FC<any>;

interface DesignDashboardBaseProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  colors: string[];
  onColorChange?: (newColors: string[]) => void;
  frontendStructure?: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  backendStructure?: any;
}

const DesignDashboard = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>({
  colors,
  onColorChange,
  frontendStructure,
  backendStructure,
}: DesignDashboardBaseProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
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

      <RouteGuard>
        <YourParentComponent />
      </RouteGuard>
    </>
  );
};

export default DesignDashboard;
export type { DesignDashboardBaseProps };