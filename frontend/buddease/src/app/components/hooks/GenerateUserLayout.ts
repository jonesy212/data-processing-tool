// useLayoutGenerator.tsx
import { DocxGenerator, DocxGeneratorOptions } from '@/app/generators/docxGenerator';
import { useEffect, useState } from 'react';
import responsiveDesignStore from '../styling/ResponsiveDesign';

// Define DocumentGenerationResult type (replace with your actual type)
type DocumentGenerationResult = {
  // Define the properties of your DocumentGenerationResult
  // For example:
  success: boolean;
  message: string;
  // Add more properties as needed
};

type LayoutGeneratorProps = {
  condition: () => boolean;
  layoutEffect: () => void;
  cleanup?: () => void;
  generateDocument: (options: DocxGeneratorOptions) => Promise<DocumentGenerationResult>; // Pass options to generateDocument
  documentGeneratorOptions: DocxGeneratorOptions;
  layoutConfigGetter: () => Promise<{
    documentGeneration: string;
    designDashboard: JSX.Element;
    responsiveDesignStore: typeof responsiveDesignStore
  }>;
};

export const useLayoutGenerator = ({
  condition,
  layoutEffect,
  cleanup,
  generateDocument,
  documentGeneratorOptions,
  layoutConfigGetter,
}: LayoutGeneratorProps) => {
  const [isActive, setIsActive] = useState(true);
  const documentGenerator = new DocxGenerator(documentGeneratorOptions);

  useEffect(() => {
    const generateLayout = async () => {
      const layoutConfig = await layoutConfigGetter();

      if (isActive && condition()) {
        layoutEffect();

        // Generate the document and handle the result
        const documentResult = await generateDocument(documentGeneratorOptions);

        if (documentResult.success) {
          // Access layoutConfig properties as needed
          console.log(layoutConfig.documentGeneration);
          console.log(layoutConfig.designDashboard);
          console.log(layoutConfig.responsiveDesignStore);
        } else {
          console.error('Document generation failed:', documentResult.message);
        }
      }
    };

    generateLayout();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [condition, layoutEffect, cleanup, isActive, documentGeneratorOptions, layoutConfigGetter, generateDocument]);

  return {
    toggleActivation: () => setIsActive((prev) => !prev),
  };
};

export default useLayoutGenerator;
export type { DocumentGenerationResult, LayoutGeneratorProps };
