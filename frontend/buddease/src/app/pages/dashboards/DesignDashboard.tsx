import ProtectedRoute from "@/app/components/routing/ProtectedRoute";
import ColorPalette from "@/app/components/styling/ColorPalette";
import DynamicSpacingAndLayout from "@/app/components/styling/DynamicSpacingAndLayout";
import DynamicTypography, {
  BodyTextProps,
  DynamicTypographyProps,
  HeadingProps,
} from "@/app/components/styling/DynamicTypography";

import React, { useEffect, useState } from "react"; // import {
//   DocumentBuilderConfig,
//   FrontendDocumentConfig,
//   GenerateUserPreferences,
//   LazyLoadScriptConfig,
//   StructuredMetadata,
//   UpdatePreferences,
// } from "@/app/components/configs";
// import {
//   GenerateCache,
//   GenerateComponent
// } from "@/app/components/generators";
// import { NotificationStore, NotificationTypes } from "@/app/components/support";
// import { TaskService } from "@/app/components/tasks";
// import {
//   FetchTodos,
// } from "@/app/components/todos";

// import {
//   AppCacheManager,
//   CacheManager,
//   CacheUtils,
//   CleanupUtil,
//   FrontendCacheManager,
//   ReadAndWriteCache,
// } from "@/app/components/utils";
// import { Web3Provider } from "@/app/components/web3";
// // import AppCacheManager

// // import ConfirmationModal from "@/app/components/communications/ConfirmationModal";

import { UserData } from "@/app/components/users/User";

import FrontendStructureViewer from "@/app/components/development/FrontendStructureViewer";
import { LogData } from "@/app/components/models/LogData";
import ProjectPhaseComponent from "@/app/components/projects/projectManagement/ProjectPhaseComponent";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructureComponent";
import {
  NotificationType
} from "@/app/context/NotificationContext";
import YourParentComponent from "../../components/prompts/YourParentComponent";
import DataPreview, {
  DataPreviewProps,
} from "../../components/users/DataPreview";

interface DynamicComponentWrapperProps<T> {
  component: T;
  dynamicProps: {
    condition?: () => boolean;
    asyncEffect?: () => Promise<void>;
    cleanup?: () => void;
    resetIdleTimeout?: () => void;
    isActive?: (selector: string) => void;
  };
  children: (props: T) => React.ReactNode;
}

// Define the shape of the Notification context value
export interface NotificationContextValue {
  notifications: NotificationData[];
  addNotification: (notification: NotificationData) => void;
  removeNotification: (id: string) => void;
  notify: (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;
}

const DynamicComponentWrapper = <T extends {}>({
  component,
  dynamicProps,
  children,
}: DynamicComponentWrapperProps<T>): React.ReactElement => {
  useEffect(() => {
    const { condition, asyncEffect, cleanup, resetIdleTimeout, isActive } =
      dynamicProps;

    // Your common logic for useEffect
    useEffect(() => {
      if (condition) condition();
      if (asyncEffect) asyncEffect();

      return () => {
        if (cleanup) cleanup();
        if (resetIdleTimeout) resetIdleTimeout();
      };
    }, [condition, asyncEffect, cleanup, resetIdleTimeout]);

    // Your common logic for other properties
    if (isActive) isActive("selector");
  }, [dynamicProps]);

  return <>{children(component)}</>;
};



interface DesignDashboardBaseProps {
  // Shared props between client and server
  colors: string[];
  onColorChange?: (newColors: string[]) => void;
  frontendStructure?: FrontendStructure;
  backendStructure?: BackendStructure;
}

const DesignDashboard: React.FC<DesignDashboardBaseProps> = ({
  colors,
  onColorChange,
  frontendStructure,
  backendStructure
}) => {
  // Shared state
  const [completionMessageLog] = useState<LogData>({
    message: "Design Completed",
    content: "Design Completed",
    date: new Date(),
    timestamp: new Date(),
    level: "info",
    type: "DesignCompleted" as NotificationType,
  });

  // Shared handlers
  const handleColorChange = (colorIndex: number, newColor: string): string[] => {
    const updatedColors = [...colors];
    updatedColors.splice(colorIndex, 1, newColor);
    onColorChange?.(updatedColors);
    return updatedColors;
  };

  // Shared utilities
  const handleNewTitleChange = (newTitle: string) => newTitle;

  return (
    <>
      {/* Shared components only */}
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

      <ProtectedRoute component={YourParentComponent} />
    </>
  );
};

export default DesignDashboard;
