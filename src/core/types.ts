
// src/core/types.ts (or inside index.ts)
export interface RequestOptions {
  /** Dynamic headers (e.g., Auth tokens, Tenant IDs) */
  headers?: Record<string, string>;
  
  /** URL path parameters (e.g., replaces ":id" in "/sensors/:id") */
  params?: Record<string, string | number>;
  
  /** Query string parameters (e.g., ?limit=10) */
  query?: Record<string, string | number | boolean>;
  
  /** The request payload for POST/PUT/PATCH */
  body?: any;
  
  /** Request timeout in milliseconds */
  timeout?: number;
  
  /** AbortSignal to cancel the request/stream from the UI */
  signal?: AbortSignal;

  fetchOptions?: Record<string, any>; // For passing raw options to fetch/axios
}