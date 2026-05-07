import * as v from 'valibot';
import * as yaml from 'js-yaml';
import { createRestAdapter } from './protocols/rest';
import { SocketManager } from './protocols/socket';
import { ManifestSchema, Manifest } from './schemas/manifest';
import { RequestOptions } from './core/types';
import { buildUrl } from './core/utils';
import { createSSEAdapter } from './protocols/sse';

export class APIEngine {
    private manifest: Manifest;
    private socketManagers = new Map<string, SocketManager>();
    private baseUrl: string;

    /**
     * Synchronous Constructor
     * Handles Objects or Raw Strings (YAML/JSON text).
     */
    constructor(input: unknown) {
        let parsedData: any = input;

        // 1. If input is a string, attempt to parse it as YAML/JSON content
        if (typeof input === 'string') {
            try {
                parsedData = yaml.load(input);
            } catch (e) {
                throw new Error("APIEngine: Failed to parse string as YAML/JSON content.");
            }
        }

        // 2. Validate the resulting object against the Schema
        // This will throw a ValiError if the input is a file path string instead of data.
        this.manifest = v.parse(ManifestSchema, parsedData);
        this.baseUrl = this.manifest.baseUrl;
    }

    /**
     * Smart Initializer (Static Factory)
     * Detects if the input is a URL/Path (from an import) and fetches it.
     */
    static async init(input: any = '/api.yml'): Promise<APIEngine> {
        // Detect if the string is a file path/URL (from an import or the default path)
        const isFilePath = typeof input === 'string' && (
            input.startsWith('/') ||
            input.startsWith('http') ||
            input.includes('.yml') ||
            input.includes('.json')
        );

        if (isFilePath) {
            try {
                const response = await fetch(input);
                if (!response.ok) {
                    // If the default /api.yml is missing, give a clear error
                    if (input === '/api.yml') {
                        throw new Error("Default manifest '/api.yml' not found in public root.");
                    }
                    throw new Error(`HTTP ${response.status}: Failed to fetch manifest.`);
                }
                const text = await response.text();
                return new APIEngine(text);
            } catch (err: any) {
                throw new Error(`APIEngine Initialization Failed: ${err.message}`);
            }
        }

        // Otherwise, treat as raw data/object and pass to constructor
        return new APIEngine(input);
    }
    /**
     * For Standard Request-Response (REST)
     */
    public async call<T>(key: string, options: RequestOptions = {}): Promise<T> {
        const endpoint = this.manifest.endpoints[key];
        if (!endpoint) throw new Error(`Endpoint "${key}" not found.`);
        if (endpoint.protocol !== 'REST') throw new Error("Use .watch() for streams/sockets.");

        const adapter = createRestAdapter(this.baseUrl);
        return adapter(endpoint, options);
    }

    /**
     * For Persistent Streams (WebSockets / SSE)
     */
    public watch(key: string, options: RequestOptions = {}) {
        const endpoint = this.manifest.endpoints[key];
        if (!endpoint) throw new Error(`Endpoint "${key}" not found.`);

        switch (endpoint.protocol) {
            case 'WS': {
                const isAbsolute = endpoint.path.startsWith('ws') || endpoint.path.startsWith('http');
                const base = isAbsolute ? "" : this.baseUrl.replace(/^http/, 'ws');
                const wsUrl = buildUrl(base, endpoint.path, options.params);

                if (!this.socketManagers.has(key)) {
                    this.socketManagers.set(key, new SocketManager(endpoint as any, wsUrl));
                }
                return this.socketManagers.get(key)!;
            }

            case 'SSE': {
                const sseUrl = buildUrl(this.baseUrl, endpoint.path, options.params);
                const sseAdapter = createSSEAdapter(sseUrl);
                return sseAdapter(endpoint, options);
            }

            default:
                throw new Error(`Protocol ${endpoint.protocol} is not streamable.`);
        }
    }
}