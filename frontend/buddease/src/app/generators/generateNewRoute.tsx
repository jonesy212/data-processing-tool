import { FileLogger } from '@/app/components/logging/Logger';
import ErrorHandler from '@/app/shared/ErrorHandler';
import { ParsedData } from '../components/documents/DocType';
import safeParseData from '../components/crypto/SafeParseData';
import DynamicErrorBoundary from '../shared/DynamicErrorBoundary';
import { Data } from '../components/models/data/Data';
import { YourResponseType } from '../components/typings/types';
import ConditionalRouteComponent from '../components/libraries/ui/components/ConditionalRouteComponent';
import DynamicRouteComponent from '../components/libraries/ui/components/DynamicRouteComponent';
import React from 'react';

// Define a mapping between JSX elements and route strings
const routeMappings: Record<string, JSX.Element> = {
  "/conditional-route": <ConditionalRouteComponent />,
  "/dynamic-route": <DynamicRouteComponent
      dynamicData={null} />
};

const generateNewRoute = (
  condition: boolean,
  dynamicData: YourResponseType,
  threshold?: number
): string | JSX.Element => {
  try {
    // Validate dynamicData if necessary
    if (dynamicData && typeof dynamicData !== "string") {
      throw new Error("Dynamic data must be a string.");
    }

    if (condition) {
      // Generate route based on specific condition
      return "/conditional-route";
    } else {
      // Generate route based on dynamic data
      const parsedDynamicData: ParsedData<Data>[] | null = safeParseData(
        dynamicData,
        threshold !== undefined ? threshold : 0
      );
      const routeSuffix =
        parsedDynamicData && parsedDynamicData.length > 0
          ? `/${parsedDynamicData[0].data}`
          : "";

      // Update the routeMappings with the DynamicRouteComponent including dynamicData
      routeMappings["/dynamic-route"] = <DynamicRouteComponent dynamicData={dynamicData} />;

      return `/dynamic-route${routeSuffix}`;
    }
  } catch (error: any) {
    // Handle error gracefully
    const errorMessage = "Error generating route: " + error.message;
    // Log the error using the FileLogger and ErrorHandler
    FileLogger.logFileError(errorMessage);
    ErrorHandler.logError(error, { componentStack: error.stack });
    // Render the error boundary to catch the error
    return (
      <DynamicErrorBoundary>
        {/* Render a message or fallback UI instead of ErrorHandler */}
        <p>An error occurred: {errorMessage}</p>
      </DynamicErrorBoundary>
    );
  }
};
  
export default generateNewRoute;
