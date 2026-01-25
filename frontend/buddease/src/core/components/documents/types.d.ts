// types.d.ts

import type { DocumentData } from "@/core/documents/editing/DocumentBuilder";

type DocumentStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published' | 'restored' | string;

/**
 * Represents the ID of a document.
 */
export type DocumentId = DocumentData;
