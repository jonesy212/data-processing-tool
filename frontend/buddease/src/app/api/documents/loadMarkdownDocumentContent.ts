// loadMarkdownDocumentContent.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import fs from "fs";

import { Attachment } from '@/app/documents/attachment/Attachment';

async function loadMarkdownDocumentContent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  document: DocumentPath,
  dataCallback: (data: WritableDraft<DocumentObject<T, K>>) => void
): Promise<string> {
  try {
    // Assuming the Markdown file path is stored in the document's filePathOrUrl property
    const filePath = document.filePathOrUrl;

    // Read the Markdown file
    const markdownContent = await fs.promises.readFile(filePath, "utf-8");

    // Call dataCallback with the modified document
    const updatedDocument = { ...document, content: markdownContent };
    dataCallback(updatedDocument as WritableDraft<DocumentObject<T, K>>);

    // Return the Markdown content
    return markdownContent;
  } catch (error) {
    console.error("Error loading Markdown document content:", error);
    throw error;
  }
}