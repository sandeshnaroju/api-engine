import { RequestOptions } from './core/types';
export declare class APIEngine {
    private manifest;
    private socketManagers;
    private baseUrl;
    /**
     * Synchronous Constructor
     * Handles Objects or Raw Strings (YAML/JSON text).
     */
    constructor(input: unknown);
    /**
     * Smart Initializer (Static Factory)
     * Detects if the input is a URL/Path (from an import) and fetches it.
     */
    static init(input?: any): Promise<APIEngine>;
    /**
     * For Standard Request-Response (REST)
     */
    call<T>(key: string, options?: RequestOptions): Promise<T>;
    /**
     * For Persistent Streams (WebSockets / SSE)
     */
    watch(key: string, options?: RequestOptions): import("./protocols/sse").SSEConnection;
}
