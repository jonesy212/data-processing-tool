import { UnifiedMetaDataOptions } from '../../configs/database/MetaDataOptions';
import  { useState, useEffect } from 'react';
 import * as  React from 'react'
// Assume selectedmetadata is derived based on your logic (e.g., API call, user action, etc.)
// Usage Example



const selectedmetadata: UnifiedMetaDataOptions = {
  id: "123",
  title: "Sample Metadata",
  description: "Some description",
  createdBy: "UserA",
  createdAt: new Date(),
  structuredMetadata: {
    metadataEntries: {
      "123": {
        originalPath: "/path/to/file",
        alternatePaths: ["/alternate/path"],
        author: "AuthorName",
        timestamp: new Date(),
        fileType: "text",
        title: "Document Title",
        description: "A detailed description of the document.",
        keywords: ["doc", "metadata"],
        authors: ["AuthorName"],
        contributors: ["Contributor1"],
        publisher: "PublisherName",
        copyright: "2023",
        license: "CC-BY",
        links: ["http://link.com"],
        tags: ["tag1", "tag2"]
      }
    }
  },
  simulatedDataSource: { key: "value" },
  videos: [],
  metadataEntries: {},
  startDate: undefined,
  endDate: undefined,
  budget: 0,
  status: '',
  teamMembers: [],
  tasks: [],
  milestones: []
};


const MetadataComponent: React.FC = () => {
  // Initialize state with selectedmetadata
  const [currentMetadata, setCurrentMetadata] = useState<UnifiedMetaDataOptions>(selectedmetadata);
  const [previousMetadata, setPreviousMetadata] = useState<UnifiedMetaDataOptions>(selectedmetadata);

  // If you need to update the metadata, for example on a user action or API call
  const updateMetadata = (newMetadata: UnifiedMetaDataOptions) => {
    // Save current metadata as previous before updating
    setPreviousMetadata(currentMetadata);
    // Update the current metadata
    setCurrentMetadata(newMetadata);
  };

  useEffect(() => {
    // Example logic if metadata changes come from external sources like API
    // Call to fetch metadata, then set the metadata state
    const fetchMetadata = async () => {
      const fetchedMetadata: UnifiedMetaDataOptions = await getMetadataFromAPI(); // Replace with real API call
      updateMetadata(fetchedMetadata);
    };
    fetchMetadata();
  }, []);

  return (
    <div>
      <h3>Current Metadata</h3>
      <pre>{JSON.stringify(currentMetadata, null, 2)}</pre>

      <h3>Previous Metadata</h3>
      <pre>{JSON.stringify(previousMetadata, null, 2)}</pre>
    </div>
  );
};

export default MetadataComponent;












// Sample API function
const getMetadataFromAPI = async (): Promise<UnifiedMetaDataOptions> => {
  // Simulate an API call or metadata fetching
  return {
    createdBy: "UserB",
    createdAt: new Date(),
    structuredMetadata: {
      metadataEntries: {
        "456": {
          originalPath: "/updated/path",
          alternatePaths: ["/alt/updated/path"],
          author: "UserB",
          timestamp: new Date(),
          fileType: "text",
          title: "Updated Metadata",
          description: "Updated description",
          keywords: ["keyword1", "keyword2"],
          authors: ["UserB"],
          contributors: ["UserC"],
          publisher: "PublisherName",
          copyright: "2024",
          license: "MIT",
          links: ["http://link.com"],
          tags: ["tag1", "tag2"]
        }
      }
    },
    simulatedDataSource: { key: "updatedValue" },
    metadataEntries: {},
    videos: [],
    description: "",
    startDate: undefined,
    endDate: undefined,
    budget: 0,
    status: '',
    teamMembers: [],
    tasks: [],
    milestones: []
  };
};

export {selectedmetadata}