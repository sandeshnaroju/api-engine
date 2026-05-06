import * as v from 'valibot';
export declare const EndpointSchema: v.VariantSchema<"protocol", [v.ObjectSchema<{
    readonly protocol: v.LiteralSchema<"REST", undefined>;
    readonly path: v.StringSchema<undefined>;
    readonly method: v.PicklistSchema<["GET", "POST", "PUT", "DELETE"], undefined>;
    readonly headers: v.OptionalSchema<v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>, {}>;
    readonly options: v.OptionalSchema<v.ObjectSchema<{
        readonly cache: v.OptionalSchema<v.PicklistSchema<["default", "no-store", "reload", "force-cache"], undefined>, undefined>;
        readonly credentials: v.OptionalSchema<v.PicklistSchema<["include", "same-origin", "omit"], undefined>, undefined>;
    }, undefined>, {}>;
    readonly timeout: v.OptionalSchema<v.NumberSchema<undefined>, 5000>;
}, undefined>, v.ObjectSchema<{
    readonly protocol: v.LiteralSchema<"WS", undefined>;
    readonly path: v.StringSchema<undefined>;
    readonly autoReconnect: v.OptionalSchema<v.BooleanSchema<undefined>, true>;
    readonly maxRetries: v.OptionalSchema<v.NumberSchema<undefined>, 5>;
    readonly pingInterval: v.OptionalSchema<v.NumberSchema<undefined>, 30000>;
}, undefined>, v.ObjectSchema<{
    readonly protocol: v.LiteralSchema<"SSE", undefined>;
    readonly path: v.StringSchema<undefined>;
    readonly method: v.OptionalSchema<v.PicklistSchema<["GET", "POST"], undefined>, "GET">;
    readonly headers: v.OptionalSchema<v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>, {}>;
    readonly eventType: v.OptionalSchema<v.StringSchema<undefined>, "message">;
}, undefined>], undefined>;
export declare const ManifestSchema: v.ObjectSchema<{
    readonly version: v.StringSchema<undefined>;
    readonly baseUrl: v.StringSchema<undefined>;
    readonly endpoints: v.RecordSchema<v.StringSchema<undefined>, v.VariantSchema<"protocol", [v.ObjectSchema<{
        readonly protocol: v.LiteralSchema<"REST", undefined>;
        readonly path: v.StringSchema<undefined>;
        readonly method: v.PicklistSchema<["GET", "POST", "PUT", "DELETE"], undefined>;
        readonly headers: v.OptionalSchema<v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>, {}>;
        readonly options: v.OptionalSchema<v.ObjectSchema<{
            readonly cache: v.OptionalSchema<v.PicklistSchema<["default", "no-store", "reload", "force-cache"], undefined>, undefined>;
            readonly credentials: v.OptionalSchema<v.PicklistSchema<["include", "same-origin", "omit"], undefined>, undefined>;
        }, undefined>, {}>;
        readonly timeout: v.OptionalSchema<v.NumberSchema<undefined>, 5000>;
    }, undefined>, v.ObjectSchema<{
        readonly protocol: v.LiteralSchema<"WS", undefined>;
        readonly path: v.StringSchema<undefined>;
        readonly autoReconnect: v.OptionalSchema<v.BooleanSchema<undefined>, true>;
        readonly maxRetries: v.OptionalSchema<v.NumberSchema<undefined>, 5>;
        readonly pingInterval: v.OptionalSchema<v.NumberSchema<undefined>, 30000>;
    }, undefined>, v.ObjectSchema<{
        readonly protocol: v.LiteralSchema<"SSE", undefined>;
        readonly path: v.StringSchema<undefined>;
        readonly method: v.OptionalSchema<v.PicklistSchema<["GET", "POST"], undefined>, "GET">;
        readonly headers: v.OptionalSchema<v.RecordSchema<v.StringSchema<undefined>, v.StringSchema<undefined>, undefined>, {}>;
        readonly eventType: v.OptionalSchema<v.StringSchema<undefined>, "message">;
    }, undefined>], undefined>, undefined>;
}, undefined>;
export type Manifest = v.InferOutput<typeof ManifestSchema>;
export type Endpoint = v.InferOutput<typeof EndpointSchema>;
