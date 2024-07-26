
// documentService.ts
import { DocumentData } from "../components/documents/DocumentBuilder";
import { DocumentTypeEnum } from "../components/documents/DocumentGenerator";
import { DocumentObject } from "../components/state/redux/slices/DocumentSlice";
import { saveDocumentToDatabase } from "./../configs/database/updateDocumentInDatabase";


export async function buildDocument(
  documentData: DocumentData,
  document: DocumentObject,
  documentType: DocumentTypeEnum
): Promise<void> {
  try {
    console.log("Building document with data:", documentData);

    // Add or modify documentData with additional data from DocumentObject and DocumentTypeEnum if necessary
    const enhancedDocumentData = {
      ...documentData,
      title: document.title, // Assuming DocumentObject has a title
      content: document.content, // Assuming DocumentObject has content
      type: documentType, // Add the documentType to the data
    };

    // Save the document data to the database
    await saveDocumentToDatabase(
      {
        id: enhancedDocumentData.id,
        name: enhancedDocumentData.name,
        description: enhancedDocumentData.description,
        filePathOrUrl: enhancedDocumentData.filePathOrUrl,
        uploadedBy: enhancedDocumentData.uploadedBy,
        uploadedAt: enhancedDocumentData.uploadedAt,
        createdAt: enhancedDocumentData.createdAt,
        updatedBy: enhancedDocumentData.updatedBy,
        createdBy: enhancedDocumentData.createdBy,
        documents: enhancedDocumentData.documents,
        selectedDocument: enhancedDocumentData.selectedDocument,
        tagsOrCategories: enhancedDocumentData.tagsOrCategories,
        format: enhancedDocumentData.format,
        visibility: enhancedDocumentData.visibility,
        type: enhancedDocumentData.type,
        uploadedByTeamId: enhancedDocumentData.uploadedByTeamId,
        uploadedByTeam: enhancedDocumentData.uploadedByTeam,
        lastModifiedDate: enhancedDocumentData.lastModifiedDate,
        lastModifiedBy: enhancedDocumentData.lastModifiedBy,
        lastModifiedByTeamId: enhancedDocumentData.lastModifiedByTeamId,
        lastModifiedByTeam: enhancedDocumentData.lastModifiedByTeam,
        url: enhancedDocumentData.url,
        all: enhancedDocumentData.all,
        title: enhancedDocumentData.title,
        content: enhancedDocumentData.content,
      },
      enhancedDocumentData.content
    );
  } catch (error) {
    console.error("Error building document:", error);
  }
}
