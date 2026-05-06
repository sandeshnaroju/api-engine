import { Endpoint } from '../schemas/manifest';
import { RequestOptions } from '../core/types';
export declare const createRestAdapter: (baseUrl: string) => <T>(endpoint: Endpoint, options?: RequestOptions) => Promise<T>;
