import fs from "fs";

async function loadMarkdownDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
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