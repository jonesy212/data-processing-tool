// DesignDashboard.tsx
"use client";

import YourParentComponent from "@/core/components/prompts/YourParentComponent";
import ColorPalette from "@/core/components/styling/ColorPalette";
import DynamicSpacingAndLayout from "@/core/components/styling/DynamicSpacingAndLayout";
import DynamicTypography, {
    BodyTextProps,
    DynamicTypographyProps,
    HeadingProps,
} from "@/core/components/styling/DynamicTypography";
import FrontendStructure from "@/core/config/appStructure/FrontendStructureComponent";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { LogData } from '@/core/models/LogData';
import DataPreview, {
    DataPreviewProps,
} from "@/core/users/DataPreview";
import { UserData } from "@/core/users/User";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

// Dynamically import components with proper typing
const RouteGuard = dynamic(
  () => import("@/core/components/routing/RouteGuard")
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
  () => import("@/core/components/development/FrontendStructureViewer")
    .then((mod) => mod.default || mod),
  { ssr: false, loading: () => <div>Loading...</div> }
) as React.FC<{
  frontendStructure?: any;
}>;

const ProjectPhaseComponent = dynamic(
  () => import("@/core/projects/projectManagement/ProjectPhaseComponent")
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
