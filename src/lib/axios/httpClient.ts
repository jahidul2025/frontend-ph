import { ApiResponse } from "@/types/api.type";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const axiosInstance = () => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            "Content-Type": "application/json",
        }
    });

    return instance;
}

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>
}

const httpGet = async <TData>(endPoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = axiosInstance();
        const response = await instance.get<ApiResponse<TData>>(endPoint, {
            params: options?.params,
            headers: options?.headers
        })
        return response.data;
    } catch (error) {
        console.error(`get request to endpoint ${endPoint} is failed`, error);
        throw error;
    }
}

const httpPost = async <TData>(endPoint: string, body: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = axiosInstance();
        const response = await instance.post<ApiResponse<TData>>(endPoint, body, {
            params: options?.params,
            headers: options?.headers
        })
        return response.data;
    } catch (error) {
        console.error(`post request to endpoint ${endPoint} is failed`, error);
        throw error;
    }
}

const httpPut = async <TData>(endpoint: string, body: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = axiosInstance();
        const response = await instance.put<ApiResponse<TData>>(endpoint, body, {
            params: options?.params,
            headers: options?.headers
        })
        return response.data;
    } catch (error) {
        console.error(`put request to endpoint ${endpoint} is failed`, error);
        throw error;
    }
}

const httpPatch = async <TData>(endpoint: string, body: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = axiosInstance();
        const response = await instance.patch<ApiResponse<TData>>(endpoint, body, {
            params: options?.params,
            headers: options?.headers
        })
        return response.data;
    } catch (error) {
        console.error(`patch request to endpoint ${endpoint} is failed`, error);
        throw error;
    }
}

const httpDelete = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = axiosInstance();
        const response = await instance.delete<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers
        })
        return response.data;
    } catch (error) {
        console.error(`delete request to endpoint ${endpoint} is failed`, error);
        throw error;
    }
}

export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    delete: httpDelete,
    patch: httpPatch
}