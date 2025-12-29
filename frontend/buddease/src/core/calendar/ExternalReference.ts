// ExternalReference.ts
//todo: move to the right foder

export interface ExternalReference {
  id: string;
  source: string;       // e.g., "Salesforce", "GitHub", "Notion"
  url?: string;
  metadata?: Record<string, any>;
}

// Example: Create a reference
const ref: ExternalReference = {
  id: "ext-123",
  source: "GitHub",
  url: "https://github.com/org/repo",
  metadata: { branch: "main", commit: "abc123" }
};
