// DocumentBuilderComponent.tsx
import { BaseData } from '@/app/models/data/Data';
import { K, Meta, T } from '@/app/components/models/data/dataStoreMethods';
import { ExcludedFields } from '@/app/components/routing/Fields';
import DocumentBuilder, { saveDocument } from "@/app/documents/editing/DocumentBuilder";
import { DocumentObject } from "@/app/state/redux/slices/DocumentSlice";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { getDefaultDocumentOptions } from "@/documents/DocumentOptions";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { useDispatch } from 'react-redux';
import { DocumentFormattingOptions } from "./ DocumentFormattingOptionsComponent";
import AccessHistory from '@/app/versions/AccessHistory';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/config/BaseConfig';
import { useState } from 'react';
import { Attachment } from '@/app/documents/attachment/Attachment';

const dispatch = useDispatch()

function formatDocument<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  documentObject: DocumentObject<T, K>,
  options: DocumentFormattingOptions
): DocumentObject<T, K> {
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
  IncludedFields extends keyof T = DefaultIncludedFields<T>
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

