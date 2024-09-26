// DocumentBuilderComponent.tsx

import { DocumentObject } from "../state/redux/slices/DocumentSlice";
import { DocumentFormattingOptions } from "./ DocumentFormattingOptionsComponent";
import DocumentBuilder from "./DocumentBuilder";
import { getDefaultDocumentOptions } from "./DocumentOptions";

function formatDocument(
  documentObject: DocumentObject,
  options: DocumentFormattingOptions
): DocumentObject {
  // Apply formatting options to the document (e.g., page size, margins, styles)
  documentObject.size = options.pageSize;
  documentObject.margins = options.margins;
  // Apply additional formatting as needed
  return documentObject;
}

function validateDocumentType(documentType: string): string | null {
  const validTypes = ["report", "invoice", "memo", "contract"];
  return validTypes.includes(documentType) ? documentType : null;
}

// Define the buildDocument function
const buildDocument = async (
  options: DocumentFormattingOptions,
  documentObject: DocumentObject,
  documentType: string
): Promise<void> => {
  try {
    // Step 1: Validate inputs
    if (!documentObject || !documentType) {
      throw new Error("Document object or type is missing.");
    }

    if (!options) {
      throw new Error("Document formatting options are missing.");
    }

    console.log("Building document with the following options:", options);

    // Step 2: Apply document formatting based on the options
    const formattedDocument = formatDocument(documentObject, options);

    // Step 3: Set or validate the document type
    const validDocumentType = validateDocumentType(documentType);
    if (!validDocumentType) {
      throw new Error("Invalid document type.");
    }

    // Apply the document type to the formatted document
    formattedDocument.type = validDocumentType;
    console.log("Document type applied:", validDocumentType);

    // Step 4: Save the document (or trigger any external processing)
    const saveResult = await saveDocument(formattedDocument);
    if (!saveResult.success) {
      throw new Error("Document saving failed.");
    }

    console.log("Document built and saved successfully.");
  } catch (error) {
    console.error("Error building document:", error);
  }
};

// Usage of DocumentBuilder
const DocumentBuilderComponent = () => {
  return (
    <DocumentBuilder
      isDynamic={true}
      options={getDefaultDocumentOptions()}
      onOptionsChange={(newOptions) => {
        /* Handle options change */
      }}
      setOptions={(newOptions) => {
        /* Handle setting options */
      }}
      documents={[]}
      buildDocument={buildDocument} // Pass the buildDocument function as a prop
    />
  );
};

export { formatDocument, validateDocumentType, buildDocument };