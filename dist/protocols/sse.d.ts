import { Endpoint } from '../schemas/manifest';
export interface WatchOptions {
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, any>;
}
export interface SSEConnection {
    subscribe: (callback: (data: any) => void) => () => void;
    close: () => void;
}
export declare const createSSEAdapter: (baseUrl: string) => (endpoint: Endpoint, options?: WatchOptions) => SSEConnection;
