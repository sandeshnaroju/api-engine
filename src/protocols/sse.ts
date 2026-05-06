import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Endpoint } from '../schemas/manifest';

// Define the shape of options for the call-site
export interface WatchOptions {
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>; // For URL placeholders like :id
}

export interface SSEConnection {
  subscribe: (callback: (data: any) => void) => () => void;
  close: () => void;
}

export const createSSEAdapter = (baseUrl: string) => {
  return (endpoint: Endpoint, options: WatchOptions = {}): SSEConnection => {
    if (endpoint.protocol !== 'SSE') throw new Error('Invalid Protocol');

    // 1. Build the dynamic URL (handling any :id placeholders)
    // Assuming buildUrl is your utility helper
    const pathWithParams = endpoint.path.replace(/:(\w+)/g, (_, key) => options.params?.[key] || `:${key}`);
    const url = pathWithParams.startsWith('http') ? pathWithParams : `${baseUrl}${pathWithParams}`;

    const subscribers = new Set<(data: any) => void>();
    const controller = new AbortController();

    const startListening = async () => {
      await fetchEventSource(url, {
        // Use method from manifest, or default to GET
        method: endpoint.method || 'GET',

        // Merge headers: Default < Manifest < Call-site Options
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...endpoint.headers,
          ...options.headers,
        },

        // Body is only sent if provided and method isn't GET
        body: options.body ? JSON.stringify(options.body) : undefined,

        signal: controller.signal,
        openWhenHidden: true,

        onmessage(msg) {
          console.log("Raw SSE Message arrived:", msg);
          subscribers.forEach(cb => cb({
            id: msg.id,
            event: msg.event,
            data: msg.data
          }));
        },
        onopen: async (res) => {
          if (!res.ok) throw new Error(`SSE Open Error: ${res.status}`);
        },

        onerror: (err) => {
          console.error("SSE stream error, attempting retry...", err);
          // Return nothing/undefined to allow automatic retry
        }
      });
    };

    // Initialize connection
    startListening();

    return {
      subscribe: (callback) => {
        subscribers.add(callback);
        return () => {
          subscribers.delete(callback);
          if (subscribers.size === 0) {
            controller.abort();
          }
        };
      },
      close: () => {
        controller.abort();
      }
    };
  };
};