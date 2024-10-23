// SearchComponent.tsx
import { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import { DocumentOptions, getDefaultDocumentOptions } from "@/app/components/documents/DocumentOptions";
import React, { useEffect, useState } from "react";
import { useSearch } from "./SearchContext";
import { Data } from "@/app/components/models/data/Data";
import { ModifiedDate } from "@/app/components/documents/DocType";

type DocumentDataPartial = Partial<DocumentData<Data>>;

// Simulated data for global search results (replace with actual data)
const globalSearchData = [
  {
    id: 1,
    title: "local result 1",
    description: "Description for local result 1",
    source: "local",
    highlights: ["highlighted phrases"],
  },
  {
    id: 2,
    title: "global result 2",
    description: "Description for global result 2",
    source: "global",
    highlights: ["highlighted phrases"],
  },
  // Add more data as needed
];

const globalDocumentData: DocumentData<Data>[] = [
  {
    ...getDefaultDocumentOptions(),
    id: 1,
    title: "Document 1",
    content: "Content for Document 1",
    highlights: ["highlighted phrase 1", "tagged item 2"],
    topics: ["topic 1", "topic 2"],
    folderPath: "/documents/folder1",
    folders: [],
    previousMetadata: {
      tags: {
        originalPath: "/path/to/file.txt",
        alternatePaths: ["/alternate/path1.txt", "/alternate/path2.txt"],
        fileType: "txt",
        title: "",
        description: "",
        keywords: [],
        authors: [],
        contributors: [],
        publisher: "",
        copyright: "",
        license: "",
        links: [],
        tags: []
      },
    },
    currentMetadata: {
      tags: {
        originalPath: "/path/to/file.txt",
        alternatePaths: ["/alternate/path1.txt", "/alternate/path2.txt"],
        fileType: "txt",
        title: "",
        description: "",
        keywords: [],
        authors: [],
        contributors: [],
        publisher: "",
        copyright: "",
        license: "",
        links: [],
        tags: []
      },
    },
    accessHistory: [],
    files: [],
    keywords: ["keyword 1", "keyword 2"],
    options: {} as DocumentOptions,
    documentType: DocumentTypeEnum.Draft,
    load: function (content: any): void {
      // load document content
      this.content = content;
    },
    lastModifiedDate: {
      value: new Date(),
      isModified: false,
      
    } as ModifiedDate,
    version: {
      name: "",
      url: "",
      versionNumber: "",
      appVersion: "",
      buildNumber: "",
      buildDate: "",
      commitHash: "",
      commitDate: "",
      commitMessage: "",
      commitAuthor: "",
      commitAuthorEmail: "",
      commitCommitter: "",
      commitCommitterEmail: "",
      branch: "",
      tag: "",
      remoteOrigin: "",
      remoteOriginURL: "",
      isRelease: false,
      isBeta: false,
      isAlpha: false,
      isCandidate: false,
      isSnapshot: false,
      isPullRequest: false,
      pullRequestNumber: "",
      pullRequestUrl: "",
      pullRequestAuthor: "",
      pullRequestAuthorEmail: "",
      pullRequestCommit: "",
      pullRequestCommitUrl: "",
      pullRequestCommitMessage: "",
      pullRequestCommitDate: "",
      pullRequestCommitAuthor: "",
      pullRequestCommitAuthorEmail: "",
      pullRequestCommitCommitter: "",
      pullRequestCommitCommitterEmail: "",
      pullRequestBranch: "",
      pullRequestBaseBranch: "",
      pullRequestMergeBranch: "",
      pullRequestMergeCommit: "",
      pullRequestMergeCommitUrl: "",
      pullRequestMergeCommitMessage: "",
      pullRequestMergeCommitDate: "",
      pullRequestMergeCommitAuthor: "",
      pullRequestMergeCommitAuthorEmail: "",
      pullRequestMergeCommitCommitter: "",
      pullRequestMergeCommitCommitterEmail: ""
    }
  },
  
  // Add more document data as needed
];

export interface SearchComponentProps {
  searchQuery: string;
  documentData: DocumentData<Data>[];
  componentSpecificData: {
    id: string | number;
    title: string;
    description: string;
    source: string; // a 'source' property to indicate the origin
  }[];
  // result: any; // search results
}

// Add this function at an appropriate location in your codebase
export const performSearch = (content: string, query: string): boolean => {
  // Normalize the query and content for case-insensitive search
  const normalizedQuery = query.toLowerCase();
  const normalizedContent = content.toLowerCase();

  // Split the query into individual keywords for more flexible matching
  const keywords = normalizedQuery.split(/\s+/);

  // Define a function to check if the content contains all keywords
  const containsAllKeywords = (text: string): boolean => {
    return keywords.every(keyword => text.includes(keyword));
  };

  // Define a function to calculate relevance score based on keyword matches
  const calculateRelevanceScore = (text: string): number => {
    let score = 0;
    for (const keyword of keywords) {
      // Increase score based on the number of keyword matches
      score += (text.match(new RegExp(keyword, 'g')) || []).length;
    }
    return score;
  };

  // Perform search based on enhanced logic
  return containsAllKeywords(normalizedContent) || calculateRelevanceScore(normalizedContent) > keywords.length / 2;
};






const SearchComponent: React.FC<SearchComponentProps> = ({
  componentSpecificData,
  documentData
}) => {
  const [searchInput, setSearchInput] = useState("");
  const { searchQuery, updateSearchQuery } = useSearch();
  const [componentSearchResults, setComponentSearchResults] = useState<
    {
      id: number;
      title: string;
      description: string;
      source: string;
    }[]
  >([]);
  const [globalSearchResults, setGlobalSearchResults] = useState<
    {
      id: number;
      title: string;
      description: string;
      source: string;
      highlights: string[];
    }[]>([]);
    const [documentSearchResults, setDocumentSearchResults] = useState<DocumentData<Data>[]>([]); // Add state for document search results


  useEffect(() => {
    // Perform component-specific search when searchQuery changes
    const query = searchQuery.toLowerCase();
    const results = componentSpecificData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
    setComponentSearchResults(results);

    
    // Perform global search
    const globalResults = globalSearchData.filter(
      item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
    setGlobalSearchResults(globalResults);

    const documentResults = globalDocumentData.filter(doc =>
      performSearch(doc.content ?? "", query)
      );
    setDocumentSearchResults(documentResults);
  }, [searchQuery, componentSpecificData, documentData]);





  const clearSearchResults = () => {
    setComponentSearchResults([]);
    setGlobalSearchResults([]);
    setDocumentSearchResults([]); // Clear document search results
  };

  const handleSearchClick = () => {
    updateSearchQuery(searchInput);
  };




  return (
    <div>
      <input
        type="text"
        id="searchInput"
        placeholder="Search..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <button
        onClick={() => {
          handleSearchClick();
          clearSearchResults();
        }}
      >
        Search
      </button>

      <div className="search-results">
        <h2>Component-Specific Results</h2>
        {componentSearchResults.length === 0 ? (
          <p>No component-specific results found.</p>
        ) : (
          componentSearchResults.map((result) => (
            <div
              key={result.id.toString()}
              className={`search-result ${
                result.source === "component" ? "component-result" : ""
              }`}
            >
              <h3>{result.title}</h3>
              <p>{result.description}</p>
            </div>
          ))
        )}

        {/* Document Search Results */}
        <h2>Document Results</h2>
        {documentSearchResults.length === 0 ? (
          <p>No document results found.</p>
        ) : (
          documentSearchResults.map((result) => (
            <div key={result.id.toString()} className="search-result">
              <h3>{result.title}</h3>
              <p>{result.content}</p>
            </div>
          ))
        )}

        <h2>Global Results</h2>
        {globalSearchResults.length === 0 ? (
          <p>No global results found.</p>
        ) : (
          globalSearchResults.map((result) => (
            <div
              key={result.id.toString()}
              className={`search-result ${
                result.source === "component" ? "component-result" : ""
              }`}
            >
              <h3>{result.title}</h3>
              <p>{result.description}</p>
              <div>
                {result.highlights.map((highlight, index) => (
                  <span key={index} className="highlight">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
