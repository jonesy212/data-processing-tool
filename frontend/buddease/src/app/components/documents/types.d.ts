// types.d.ts

import { DocumentData } from "@/app/components/documents/DocumentBuilder";

type DocumentStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published' | 'restored' | string;

/**
 * Represents the ID of a document.
 */
export type DocumentId = DocumentData;
