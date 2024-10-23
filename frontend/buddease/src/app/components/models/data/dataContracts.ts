// dataContracts.ts
import { BaseRecord, CreateParams, UpdateParams, CustomParams, CreateManyParams, UpdateManyParams, GetListParams,
  GetListResponse,
  CrudOperators,
  BaseKey, } from "@refinedev/core";
import { PaginationOptions, SortingOption } from "../../../pages/searchs/SearchOptions";



export interface ResourceBase {
  resource: string; // Common resource property
  previousData?: any;
}


export interface CustomBaseRecord extends BaseRecord {
  id?: any; // Unique identifier for the record
  [key: string]: any; // Additional fields for the record
}


export interface InternalCustomParams<TQuery = unknown, TPayload = unknown> extends CustomParams {
  query?: TQuery; // Query parameters for the custom request
  payload?: TPayload; // Payload for the custom request
}


export interface GetOneParams extends ResourceBase {
  id: string | number; // ID of the record to fetch
}


export interface GetOneResponse<TData> extends ResourceBase {
  data: TData; // The fetched record
}

export interface CustomResponse<TData> {
  data: TData; // Response data for the custom request
}


export interface CustomGetListResponse<TData extends BaseRecord>  extends GetListResponse{
  data: TData[];
  total: number; // Total count of items matching the query
}

export interface GetManyParams extends ResourceBase {
  ids: BaseKey[]
}

export interface GetManyResponse<TData> {
  data: TData[]; // Array of fetched records
}



interface CustomFilterBase {
  field?: string;
  operator: string; // You can specify a union type for specific operators
  value: any;       // The value type can be flexible depending on your use case
}

// Extend the CustomFilterBase to include specific filters if needed
interface CustomLogicalFilter extends CustomFilterBase {
  field: string;
  operator: Exclude<CrudOperators, "or" | "and">;
}

interface CustomConditionalFilter extends CustomFilterBase {
  operator: Extract<CrudOperators, "or" | "and">;
  value: (CustomLogicalFilter | CustomConditionalFilter)[];
}

// Define the final CustomFilter type that could be either conditional or logical
type CustomFilter = CustomLogicalFilter | CustomConditionalFilter;


// Extend the existing GetListParams with custom filters and sorting
export interface CustomGetListParams extends GetListParams {
  pagination?: PaginationOptions; // Use your Pagination type if it's different
  sort?: SortingOption[];  // Use SortingOption if you want a custom structure
  filters?: CustomFilter[];  // Custom filters structure
}

export interface CustomCreateParams<TVariables extends {} = {}> extends ResourceBase, CreateParams {
  data?: Record<string, any>; // The data to create the new record
  variables: TVariables; // Optional variables for additional context or parameters
}

export interface CreateResponse<TData> {
  data: TData; // The created record data
}

export interface CustomCreateManyParams<TVariables extends {}[] = {}[]> extends ResourceBase, CreateManyParams {
  data?: Record<string, any>[]; // Array of data to create multiple new records
  variables: TVariables; // Optional variables for additional context or parameters
}

export interface CreateManyResponse<TData> {
  data: TData[]; // Array of created records data
}

export interface CustomUpdateParams<TVariables = {}> extends ResourceBase, UpdateParams<TVariables> {
  id: BaseKey; // ID of the record to update
  data?: Record<string, any>; // Updated data for the record
  variables: TVariables; // Variables for additional context or parameters
}

export interface UpdateResponse<TData> {
  data: TData; // The updated record data
}

export interface CustomUpdateManyParams<TVariables = {}> extends ResourceBase, UpdateManyParams<TVariables> {
  ids: BaseKey[]; // List of IDs to update
  data?: Record<string, any>[]; // Array of updated data for multiple records
  variables: TVariables; // Variables for additional context or parameters
}

export interface UpdateManyResponse<TData> {
  data: TData[]; // Array of updated records data
}

export interface DeleteOneParams<TVariables = {}> extends ResourceBase {
  id: BaseKey; // ID of the record to delete
  variables?: TVariables; // Optional variables for additional context or parameters
}

export interface DeleteOneResponse<TData> {
  data: TData; // The deleted record data
}

export interface DeleteManyParams<TVariables = {}> extends ResourceBase {
  ids: BaseKey[]; // List of IDs to delete
  variables?: TVariables; // Optional variables for additional context or parameters
}

export interface DeleteManyResponse<TData> {
  data: TData[]; // Array of deleted records data
}
