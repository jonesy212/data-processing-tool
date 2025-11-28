// contentTypes..ts
// contentTypes.ts
export interface ContentResponseType {
  id: string;
  title: string;
  description?: string;
  body: string;
  contentType: string;
  status: string;
  authorId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  version?: number;
}

export interface ContentListResponseType {
  contents: ContentResponseType[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface ContentCreateRequest {
  title: string;
  description?: string;
  body: string;
  contentType: string;
  status?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ContentUpdateRequest {
  title?: string;
  description?: string;
  body?: string;
  contentType?: string;
  status?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ContentSearchParams {
  query?: string;
  contentType?: string;
  status?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContentBulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  results?: Array<{
    contentId: string;
    success: boolean;
    error?: string;
  }>;
}