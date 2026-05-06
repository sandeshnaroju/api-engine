/**
 * Generic URL builder that handles:
 * 1. Absolute vs Relative paths
 * 2. Path parameter injection (:id)
 * 3. Automatic Query String generation
 */
export declare const buildUrl: (baseUrl: string, path: string, params?: Record<string, any>) => string;
