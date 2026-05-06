import { RequestOptions } from './core/types';
export declare class APIEngine {
    private manifest;
    private socketManagers;
    private baseUrl;
    constructor(rawManifest: unknown);
    /**
     * For Standard Request-Response (REST)
     */
    call<T>(key: string, options?: any): Promise<T>;
    /**
     * For Persistent Streams (WebSockets / SSE)
     */
    watch(key: string, options?: RequestOptions): import("./protocols/sse").SSEConnection;
}
