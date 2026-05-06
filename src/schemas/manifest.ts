import * as v from 'valibot';

export const EndpointSchema = v.variant('protocol', [
  v.object({
    protocol: v.literal('REST'),
    path: v.string(),
    method: v.picklist(['GET', 'POST', 'PUT', 'DELETE']),
    // Default headers defined in the YAML
    headers: v.optional(v.record(v.string(), v.string()), {}),
    // Allow standard fetch options (timeout, cache, etc.)
    options: v.optional(v.object({
      cache: v.optional(v.picklist(['default', 'no-store', 'reload', 'force-cache'])),
      credentials: v.optional(v.picklist(['include', 'same-origin', 'omit'])),
    }), {}),
    timeout: v.optional(v.number(), 5000),
  }),

  v.object({
    protocol: v.literal('WS'),
    path: v.string(),
    autoReconnect: v.optional(v.boolean(), true),
    maxRetries: v.optional(v.number(), 5),
    pingInterval: v.optional(v.number(), 30000), // Heartbeat
  }),

  v.object({
    protocol: v.literal('SSE'),
    path: v.string(),
    method: v.optional(v.picklist(['GET', 'POST']), 'GET'),
    headers: v.optional(v.record(v.string(), v.string()), {}),
    eventType: v.optional(v.string(), 'message'),
  }),
    // Sockets/SSE variants go here...
]);
// Define the full manifest
export const ManifestSchema = v.object({
  version: v.string(),
  baseUrl: v.string(),
  endpoints: v.record(v.string(), EndpointSchema),
});

export type Manifest = v.InferOutput<typeof ManifestSchema>;
export type Endpoint = v.InferOutput<typeof EndpointSchema>;