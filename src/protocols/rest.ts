import axios, { AxiosRequestConfig } from 'axios';
import { Endpoint } from '../schemas/manifest';
import { RequestOptions } from '../core/types';
import { buildUrl } from '../core/utils';

export const createRestAdapter = (baseUrl: string) => {
    return async <T>(endpoint: Endpoint, options: RequestOptions = {}): Promise<T> => {
        
        if (endpoint.protocol !== 'REST') {
            throw new Error(`REST adapter cannot handle ${endpoint.protocol} protocol`);
        }

        // 1. Construct the final URL using your custom buildUrl logic
        // This handles :id replacement and Query Strings
        const url = buildUrl(baseUrl, endpoint.path, options.params);

        // 2. Prepare Axios Configuration
        const config: AxiosRequestConfig = {
            url: url,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
                ...endpoint.headers,
                ...options.headers,
            },
            // Axios handles the body via 'data'. 
            // For GET/DELETE, we usually don't send a body.
            data: !['GET', 'DELETE'].includes(endpoint.method) ? options.body : undefined,
            
            // Axios uses 'timeout' directly (ms)
            timeout: endpoint.timeout || 5000,
            
            // Allow overriding with raw axios/fetch options
            ...endpoint.options,
            ...options.fetchOptions, 
        };

        try {
            const response = await axios.request<T>(config);
            
            // Axios automatically throws if status is not 2xx
            // and automatically parses JSON into response.data
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status || 'Network Error';
                const message = error.response?.data?.message || error.message;
                throw new Error(`[REST ${status}]: ${message}`);
            }
            throw error;
        }
    };
};