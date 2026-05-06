import { createRestAdapter } from './protocols/rest';
import { SocketManager } from './protocols/socket';
import { ManifestSchema, Manifest } from './schemas/manifest';
import { RequestOptions } from './core/types';
import { buildUrl } from './core/utils';

import * as v from 'valibot';


import { createSSEAdapter } from './protocols/sse';

export class APIEngine {
    private manifest: Manifest;
    private socketManagers = new Map<string, SocketManager>();
    private baseUrl: string;

    constructor(rawManifest: unknown) {
        this.manifest = v.parse(ManifestSchema, rawManifest);
        this.baseUrl = this.manifest.baseUrl;
    }

    /**
     * For Standard Request-Response (REST)
     */
    public async call<T>(key: string, options?: any): Promise<T> {
        const endpoint = this.manifest.endpoints[key];
        if (endpoint.protocol !== 'REST') throw new Error("Use .watch() for streams");

        const adapter = createRestAdapter(this.baseUrl);
        return adapter(endpoint, options);
    }

    /**
     * For Persistent Streams (WebSockets / SSE)
     */

    // Inside the APIEngine class...
    // Add RequestOptions to the signature
    public watch(key: string, options: RequestOptions = {}) {
        const endpoint = this.manifest.endpoints[key];
        if (!endpoint) throw new Error(`Endpoint ${key} not found.`);

        switch (endpoint.protocol) {
            case 'WS':
                // 1. WebSocket logic remains largely the same, 
                // but ensure your SocketManager handles URL params if needed.

                const wsUrl = buildUrl(this.baseUrl.replace('http', 'ws'), endpoint.path, options.params);

                console.log(`Connecting to WebSocket at ${wsUrl} with options:`, options);
                if (!this.socketManagers.has(key)) {
                    this.socketManagers.set(key, new SocketManager(endpoint, wsUrl));
                }
                return this.socketManagers.get(key)!;

            case 'SSE':
                // 2. Pass the options through to the SSE adapter.
                // We use a factory function so we don't recreate the base logic 
                // but we DO initiate a fresh connection with the provided options.
                const sseUrl = buildUrl(this.baseUrl, endpoint.path, options.params);
                const sseAdapter = createSSEAdapter(sseUrl);
                return sseAdapter(endpoint, options);

            default:
                throw new Error(`Protocol ${endpoint.protocol} is not streamable.`);
        }
    }
}