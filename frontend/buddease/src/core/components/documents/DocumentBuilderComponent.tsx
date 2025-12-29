// DocumentBuilderComponent.tsx
import { DocumentFormattingOptions } from "@/core/components/documents/DocumentFormattingOptionsComponent";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { getDefaultDocumentOptions } from "@/core/documents/DocumentOptions";
import DocumentBuilder, { saveDocument } from "@/core/documents/editing/DocumentBuilder";
import { DocumentBuilderProps } from '@/core/documents/SharedDocumentProps';
import { DocumentObject } from "@/core/state/redux/slices/DocumentSlice";
import AccessHistory from '@/core/versions/AccessHistory';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

const dispatch = useDispatch()

function formatDocument<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  documentObject: DocumentObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  options: DocumentFormattingOptions
): DocumentObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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
const buildDocument = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  options: DocumentFormattingOptions,
  documentObject: DocumentObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    const saveResult = await dispatch(
      saveDocument({ documentData: formattedDocument, content: JSON.stringify(formattedDocument) })
    ).unwrap() as { success: boolean }; // Explicitly specify the type here


    if (!saveResult.success) {
      throw new Error("Document saving failed.");
    }

    console.log("Document built and saved successfully.");
  } catch (error) {
    console.error("Error building document:", error);
  }
};

// Usage of DocumentBuilder
const DocumentBuilderComponent = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  getDefaultMetadata,
}: DocumentBuilderProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {

  // Initialize metadata state
  const [currentMetadata, setCurrentMetadata] = useState<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
    getDefaultMetadata()
  );

  const [previousMetadata, setPreviousMetadata] = useState<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
    getDefaultMetadata()
  );


  // Initialize access history
  const [accessHistory, setAccessHistory] = useState<AccessHistory[]>([]);
  
  // Get last modified date
  const [lastModifiedDate, setLastModifiedDate] = useState<Date>(new Date());

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
      currentMetadata={currentMetadata}
      previousMetadata={previousMetadata}
      accessHistory={accessHistory}
      lastModifiedDate={lastModifiedDate}
     
    />
  );
};

export { buildDocument, formatDocument, validateDocumentType };

