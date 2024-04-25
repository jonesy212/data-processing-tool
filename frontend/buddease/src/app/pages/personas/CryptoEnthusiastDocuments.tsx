import { DocumentStatusEnum } from "@/app/components/documents/DocumentGenerator";
import { DocumentOptions, getDefaultDocumentOptions } from "@/app/components/documents/DocumentOptions";
import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import {updateDocumentInDatabase} from "@/app/configs/database/updateDocumentInDatabase";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import React, { useState } from "react";



const documentName = "crypto_document";
const cryptoDocumentID = UniqueIDGenerator.generateDocumentID(documentName, NotificationTypeEnum.GeneratedID);

interface CryptoEnthusiastDocumentsProps {
  // Function to allow sharing documents
  shareDocument: (document: DocumentOptions) => void;
  // Array of documents for collaboration
  collaborationDocuments: DocumentOptions[];
}

const CryptoEnthusiastDocuments: React.FC<CryptoEnthusiastDocumentsProps> = (
  props
) => {
  // State to manage document options
  const [documentOptions, setDocumentOptions] = useState<DocumentOptions>(
    getDefaultDocumentOptions()
  );

  // Function to update document status in the database
  const updateDocumentStatus = async () => {
    try {
      await updateDocumentInDatabase(
        documentOptions.documentType,
        DocumentStatusEnum.Finalized
      );
      console.log("Document status updated successfully.");
    } catch (error) {
      console.error("Error updating document status:", error);
    }
  };

  // Function to handle changes in document options
  const handleDocumentOptionsChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setDocumentOptions((prevOptions) => ({
      ...prevOptions,
      [name]: value,
    }));
  };

  // Function to handle sharing of documents
  const handleShareDocument = () => {
    props.shareDocument(documentOptions);
  };

  return (
    <div>
      <h1>Crypto Enthusiast Documents</h1>
      <form>
        <label>
          Document Type:
          <input
            type="text"
            name="documentType"
            value={documentOptions.documentType.toString()} 
            onChange={handleDocumentOptionsChange}
          />
        </label>
        <label>
          User Idea:
          <input
            type="text"
            name="userIdea"
            value={documentOptions.userIdea}
            onChange={handleDocumentOptionsChange}
          />
        </label>
        {/* Add more input fields for other document options */}
        <button type="button" onClick={updateDocumentStatus}>
          Finalize Document
        </button>
        <button type="button" onClick={handleShareDocument}>
          Share Document
        </button>
      </form>
      {/* Display collaboration documents */}
      <div>
        <h2>Collaboration Documents</h2>
        <ul>
          {props.collaborationDocuments.map((doc, index) => (
          <li key={doc.uniqueIdentifier}>{doc.documentType.toString()}</li>
      ))}
        </ul>
      </div>
            {/* Display crypto document ID */}
            <div>
        <h2>Crypto Document ID</h2>
        <p>{cryptoDocumentID}</p>
      </div>
    </div>
  );
};

export default CryptoEnthusiastDocuments;
