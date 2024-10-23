import { } from './../../models/data/dataContracts';
// dataProviderInstance.ts
import {
    BaseRecord,
    DataProvider,
} from "@refinedev/core";
import axiosInstance from "../../../api/axiosInstance";
import {
    CustomCreateManyParams,
    CustomCreateParams,
    CreateResponse,
    CustomBaseRecord,
    DeleteManyParams,
    DeleteOneParams,
    DeleteOneResponse,
    CustomGetListParams,
    CustomGetListResponse,
    GetManyParams,
    InternalCustomParams,
    CustomResponse,
    GetOneParams,
    GetOneResponse,
    CustomUpdateManyParams,
    CustomUpdateParams,
    CreateManyResponse, DeleteManyResponse, GetManyResponse, UpdateManyResponse, UpdateResponse
} from "../../models/data/dataContracts";

const API_URL = 'https://your-api-url.com'; // Replace with your API base URL

const dataProvider: DataProvider = {
    getList: async <TData extends CustomBaseRecord = CustomBaseRecord>(
        params: CustomGetListParams
    ): Promise<CustomGetListResponse<TData>> => {
        try {
            const { resource, pagination, sort, filters } = params;
            const { data } = await axiosInstance.get(`${API_URL}/${resource}`, {
                params: pagination
                    ? {
                        _page: pagination.current,
                        _limit: pagination.pageSize,
                        _sort: sort && sort.length > 0 ? sort[0].field : undefined,
                        _order: sort && sort.length > 0 ? sort[0].order : undefined,
                        ...filters,
                    }
                    : { ...filters },
            });
            return {
                data: data.items as TData[],
                total: data.totalCount,
            };
        } catch (error: any) {
            if (error instanceof Error) {
                throw new Error(`Error fetching list for ${params.resource}: ${error.message}`);
            }
            throw new Error(`Error fetching list for ${params.resource}: Unknown error`);
        }
    },

    getMany: async <TData extends BaseRecord = BaseRecord>(params: GetManyParams): Promise<GetManyResponse<TData>> => {
        try {
            const { resource, ids } = params;

            // Filter or cast ids to be of type number[]
            const numericIds = ids.filter((id): id is number => typeof id === 'number');

            if (numericIds.length !== ids.length) {
                throw new Error(`All IDs must be numbers for ${resource}`);
            }

            const { data } = await axiosInstance.get(`${API_URL}/${resource}`, {
                params: { ids: numericIds.join(',') },
            });

            return {
                data: data.items as TData[],
            };
        } catch (error: any) {
            throw new Error(`Error fetching many ${params.resource}: ${error.message}`);
        }
    },

    getOne: async <TData extends CustomBaseRecord = CustomBaseRecord>(params: GetOneParams): Promise<GetOneResponse<TData>> => {
        try {
            const { resource, id } = params;
            const { data } = await axiosInstance.get(`${API_URL}/${resource}/${id}`);
            return {
                data: data as TData, // Cast to TData
                resource: resource,
            };
        } catch (error: any) {
            throw new Error(`Error fetching ${params.resource} with ID ${params.id}: ${error.message}`);
        }
    },

    create: async <TData extends CustomBaseRecord = CustomBaseRecord, TVariables = {}>(
        params: CustomCreateParams<TVariables extends {} ? any : any>
    ): Promise<CreateResponse<TData>> => {
        
        try {
            const { resource, data } = params;
            const response = await axiosInstance.post(`${API_URL}/${resource}`, data);
            return {
                data: response.data as TData, // Ensure data is cast to TData
            };
        } catch (error: any) {
            throw new Error(`Error creating ${params.resource}: ${error.message}`);
        }
    },

    createMany: async <TData extends CustomBaseRecord = CustomBaseRecord, TVariables extends {}[] = {}[]>(
        params: CustomCreateManyParams<TVariables extends {} ? any : any>
    ): Promise<CreateManyResponse<TData>> => {
        try {
            const { resource, data } = params;
            const response = await axiosInstance.post(`${API_URL}/${resource}/bulk`, data);
            return {
                data: response.data as TData[], // Cast to TData[]
            };
        } catch (error: any) {
            throw new Error(`Error creating many ${params.resource}: ${error.message}`);
        }
    },

    update: async <TData extends CustomBaseRecord = CustomBaseRecord, TVariables = {}>(
        params: CustomUpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
        try {
            const { resource, id, data } = params;
            const response = await axiosInstance.put(`${API_URL}/${resource}/${id}`, data);
            return {
                data: response.data as TData, // Cast to TData
            };
        } catch (error: any) {
            throw new Error(`Error updating ${params.resource} with ID ${params.id}: ${error.message}`);
        }
    },

    updateMany: async <TData extends CustomBaseRecord = CustomBaseRecord, TVariables = {}>(
        params: CustomUpdateManyParams<TVariables>
    ): Promise<UpdateManyResponse<TData>> => {
        try {
            const { resource, data } = params;
            const response = await axiosInstance.put(`${API_URL}/${resource}/bulk`, data);
            return {
                data: response.data as TData[], // Cast to TData[]
            };
        } catch (error: any) {
            throw new Error(`Error updating many ${params.resource}: ${error.message}`);
        }
    },

    deleteOne: async <TData extends CustomBaseRecord = CustomBaseRecord, TVariables = {}>(
        params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
        try {
            const { resource, id } = params;
    
            await axiosInstance.delete(`${API_URL}/${resource}/${id}`);
    
            return new Promise<DeleteOneResponse<TData>>((resolve) => {
                resolve({
                    data: params.previousData as TData, // Cast previousData to TData
                });
            });
        } catch (error: any) {
            return new Promise<DeleteOneResponse<TData>>((_, reject) => {
                reject(new Error(`Error deleting ${params.resource} with ID ${params.id}: ${error.message}`));
            });
        }
    },
    
    deleteMany: async <TData extends CustomBaseRecord = CustomBaseRecord, TVariables = {}>(
        params: DeleteManyParams<TVariables>
    ): Promise<DeleteManyResponse<TData>> => {
        try {
            const { resource, ids } = params;
            await axiosInstance.delete(`${API_URL}/${resource}/bulk`, { data: { ids } });
            return {
                data: params.previousData as TData[], // Cast to TData[]
            };
        } catch (error: any) {
            throw new Error(`Error deleting many ${params.resource}: ${error.message}`);
        }
    },

    getApiUrl: () => API_URL,

    custom: async <TData extends CustomBaseRecord = CustomBaseRecord, TQuery = unknown, TPayload = unknown>(params: InternalCustomParams<TQuery, TPayload>): Promise<CustomResponse<TData>> => {
        try {
            const { url, method, query, payload } = params;
            const { data } = await axiosInstance.request({
                url,
                method,
                params: query,
                data: payload,
            });
            return {
                data: data as TData,
            };
        } catch (error: any) {
            throw new Error(`Error in custom request: ${(error as Error).message}`);
        }
    },
}

export default dataProvider;