// types.d.ts

import { DocumentData } from "@/app/components/documents/DocumentBuilder";

export type DocumentStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';

/**
 * Represents the ID of a document.
 */
export type DocumentId = DocumentData;
