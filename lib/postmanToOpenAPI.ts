import {
    PostmanCollection,
    PostmanItem,
    PostmanUrl,
    PostmanBody,
    PostmanHeader,
    PostmanVariable,
    PostmanQueryParam,
    PostmanAuth,
} from "@/types/postman";

interface OpenAPIParameter {
    name: string;
    in: "query" | "header" | "path" | "cookie";
    description?: string;
    required?: boolean;
    schema: OpenAPISchema;
}

interface OpenAPIRequestBody {
    description?: string;
    content: Record<
        string,
        {
            schema: OpenAPISchema;
            example?: unknown;
        }
    >;
    required?: boolean;
}

interface OpenAPIResponse {
    description: string;
    headers?: Record<
        string,
        {
            description?: string;
            schema: OpenAPISchema;
        }
    >;
    content?: Record<
        string,
        {
            schema: OpenAPISchema;
            example?: unknown;
        }
    >;
}

interface OpenAPIOperation {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: OpenAPIParameter[];
    requestBody?: OpenAPIRequestBody;
    responses: Record<string, OpenAPIResponse>;
    security?: Array<Record<string, string[]>>;
}

interface OpenAPIPathItem {
    summary?: string;
    description?: string;
    get?: OpenAPIOperation;
    put?: OpenAPIOperation;
    post?: OpenAPIOperation;
    delete?: OpenAPIOperation;
    options?: OpenAPIOperation;
    head?: OpenAPIOperation;
    patch?: OpenAPIOperation;
    trace?: OpenAPIOperation;
}

interface OpenAPISecurityScheme {
    type: "apiKey" | "http" | "oauth2" | "openIdConnect";
    description?: string;
    name?: string;
    in?: "query" | "header" | "cookie";
    scheme?: string;
    bearerFormat?: string;
    flows?: Record<string, unknown>;
    openIdConnectUrl?: string;
}

interface OpenAPISchema {
    type?:
        | "null"
        | "boolean"
        | "object"
        | "array"
        | "number"
        | "string"
        | "integer";
    format?: string;
    title?: string;
    description?: string;
    default?: unknown;
    example?: unknown;
    enum?: unknown[];
    const?: unknown;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    properties?: Record<string, OpenAPISchema>;
    additionalProperties?: boolean | OpenAPISchema;
    items?: OpenAPISchema;
    allOf?: OpenAPISchema[];
    oneOf?: OpenAPISchema[];
    anyOf?: OpenAPISchema[];
    not?: OpenAPISchema;
}

interface OpenAPISpec {
    openapi: string;
    info: {
        title: string;
        version: string;
        description?: string;
    };
    servers?: Array<{
        url: string;
        description?: string;
    }>;
    paths: Record<string, OpenAPIPathItem>;
    components?: {
        schemas?: Record<string, OpenAPISchema>;
        responses?: Record<string, OpenAPIResponse>;
        parameters?: Record<string, OpenAPIParameter>;
        examples?: Record<string, unknown>;
        requestBodies?: Record<string, OpenAPIRequestBody>;
        headers?: Record<string, unknown>;
        securitySchemes?: Record<string, OpenAPISecurityScheme>;
        links?: Record<string, unknown>;
        callbacks?: Record<string, unknown>;
    };
    security?: Array<Record<string, string[]>>;
    tags?: Array<{
        name: string;
        description?: string;
    }>;
    externalDocs?: {
        description?: string;
        url: string;
    };
}

export function convertPostmanToOpenAPI(
    postmanJson: PostmanCollection
): string {
    const openapi: OpenAPISpec = {
        openapi: "3.0.0",
        info: {
            title: postmanJson.info?.name || "Converted API",
            version: postmanJson.info?.version || "1.0.0",
            description:
                postmanJson.info?.description ||
                "API converted from Postman Collection",
        },
        paths: {},
        components: {
            schemas: {},
            securitySchemes: {},
        },
    };

    const servers = extractServers(postmanJson);
    if (servers.length > 0) {
        openapi.servers = servers;
    }

    if (postmanJson.auth) {
        processAuth(postmanJson.auth, openapi);
    }

    const processItems = (items: PostmanItem[], basePath: string = "") => {
        items.forEach((item) => {
            if (item.item && item.item.length > 0) {
                const folderPath = basePath
                    ? `${basePath}/${item.name}`
                    : item.name || "";
                processItems(item.item, folderPath);
                return;
            }

            if (!item.request) {
                console.warn(item.name);
                return;
            }

            try {
                const pathInfo = processRequest(item, basePath);
                if (pathInfo) {
                    const { path, method, operation } = pathInfo;

                    if (!openapi.paths[path]) {
                        openapi.paths[path] = {};
                    }

                    const pathItem = openapi.paths[path];
                    switch (method) {
                        case "get":
                            pathItem.get = operation;
                            break;
                        case "post":
                            pathItem.post = operation;
                            break;
                        case "put":
                            pathItem.put = operation;
                            break;
                        case "delete":
                            pathItem.delete = operation;
                            break;
                        case "patch":
                            pathItem.patch = operation;
                            break;
                        case "options":
                            pathItem.options = operation;
                            break;
                        case "head":
                            pathItem.head = operation;
                            break;
                        case "trace":
                            pathItem.trace = operation;
                            break;
                        default:
                            console.warn(`Unsupported HTTP method: ${method}`);
                    }
                }
            } catch (error) {
                console.warn(`Error processing ${item.name}:`, error);
            }
        });
    };

    try {
        processItems(postmanJson.item || []);
    } catch (e) {
        console.error(e);
    }

    return JSON.stringify(openapi, null, 2);
}

function extractServers(
    collection: PostmanCollection
): Array<{ url: string; description?: string }> {
    const servers: Array<{ url: string; description?: string }> = [];

    if (collection.variable) {
        const baseUrl = collection.variable.find(
            (v) =>
                v.key === "baseUrl" || v.key === "base_url" || v.key === "host"
        );
        if (baseUrl?.value) {
            servers.push({
                url: baseUrl.value,
                description: baseUrl.description || "Base server",
            });
        }
    }

    return servers;
}

function processAuth(auth: PostmanAuth, openapi: OpenAPISpec): void {
    if (!openapi.components) {
        openapi.components = { securitySchemes: {} };
    }

    if (!openapi.components.securitySchemes) {
        openapi.components.securitySchemes = {};
    }

    switch (auth.type) {
        case "bearer":
            openapi.components.securitySchemes.BearerAuth = {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            };
            openapi.security = [{ BearerAuth: [] }];
            break;
        case "basic":
            openapi.components.securitySchemes.BasicAuth = {
                type: "http",
                scheme: "basic",
            };
            openapi.security = [{ BasicAuth: [] }];
            break;
        case "apikey":
            const apiKeyData = auth.apikey as
                | Array<{ key: string; value: string; in?: string }>
                | undefined;
            const apiKeyAuth = apiKeyData?.[0];
            if (apiKeyAuth) {
                openapi.components.securitySchemes.ApiKeyAuth = {
                    type: "apiKey",
                    in:
                        (apiKeyAuth.in as "query" | "header" | "cookie") ||
                        "header",
                    name: apiKeyAuth.key || "X-API-Key",
                };
                openapi.security = [{ ApiKeyAuth: [] }];
            }
            break;
    }
}

interface ProcessedRequest {
    path: string;
    method:
        | "get"
        | "post"
        | "put"
        | "delete"
        | "patch"
        | "options"
        | "head"
        | "trace";
    operation: OpenAPIOperation;
}

function processRequest(
    item: PostmanItem,
    basePath: string
): ProcessedRequest | null {
    const request = item.request!;
    const rawMethod = (request.method || "GET").toLowerCase();

    const supportedMethods = [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "options",
        "head",
        "trace",
    ];
    if (!supportedMethods.includes(rawMethod)) {
        console.warn(`❌ Unsupported HTTP method: ${rawMethod}`);
        return null;
    }

    const method = rawMethod as
        | "get"
        | "post"
        | "put"
        | "delete"
        | "patch"
        | "options"
        | "head"
        | "trace";

    const urlInfo = parseUrl(request.url);
    if (!urlInfo.path) {
        console.warn(`❌ No path found for ${item.name}`);
        return null;
    }

    const operation: OpenAPIOperation = {
        summary: item.name || "No summary",
        description: item.description || request.description || "",
        tags: basePath ? [basePath] : undefined,
        parameters: [],
        responses: {
            "200": {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                        },
                    },
                },
            },
        },
    };

    if (urlInfo.queryParams && urlInfo.queryParams.length > 0) {
        urlInfo.queryParams.forEach((param) => {
            if (!param.disabled) {
                operation.parameters!.push({
                    name: param.key,
                    in: "query",
                    description: param.description || "",
                    required: false,
                    schema: {
                        type: "string",
                        example: param.value,
                    },
                });
            }
        });
    }

    if (urlInfo.variables && urlInfo.variables.length > 0) {
        urlInfo.variables.forEach((variable) => {
            operation.parameters!.push({
                name: variable.key,
                in: "path",
                description: variable.description || "",
                required: true,
                schema: {
                    type: "string",
                    example: variable.value,
                },
            });
        });
    }

    if (request.header && request.header.length > 0) {
        request.header.forEach((header) => {
            if (!header.disabled && !isCommonHeader(header.key)) {
                operation.parameters!.push({
                    name: header.key,
                    in: "header",
                    description: header.description || "",
                    required: false,
                    schema: {
                        type: "string",
                        example: header.value,
                    },
                });
            }
        });
    }

    if (request.body && ["post", "put", "patch"].includes(method)) {
        operation.requestBody = processRequestBody(request.body);
    }

    if (item.response && item.response.length > 0) {
        operation.responses = {};
        item.response.forEach((response) => {
            const statusCode = response.code?.toString() || "200";
            const contentType = getResponseContentType(response.header);

            operation.responses[statusCode] = {
                description: response.name || `Response ${statusCode}`,
                content: {
                    [contentType]: {
                        schema: response.body
                            ? parseResponseBody(response.body, contentType)
                            : { type: "object" },
                    },
                },
            };
        });
    }

    if (operation.parameters && operation.parameters.length === 0) {
        delete operation.parameters;
    }

    return {
        path: urlInfo.path,
        method,
        operation,
    };
}

interface ParsedUrl {
    path: string;
    queryParams?: PostmanQueryParam[];
    variables?: PostmanVariable[];
}

function parseUrl(url: PostmanUrl | string | undefined): ParsedUrl {
    if (!url) return { path: "/" };

    if (typeof url === "string") {
        try {
            const parsed = new URL(url);
            return {
                path: parsed.pathname,
                queryParams: Array.from(parsed.searchParams.entries()).map(
                    ([key, value]) => ({
                        key,
                        value,
                        disabled: false,
                    })
                ),
            };
        } catch {
            return { path: url.startsWith("/") ? url : `/${url}` };
        }
    }

    let path = "/";

    if (url.path && url.path.length > 0) {
        path = "/" + url.path.join("/");
    } else if (url.raw) {
        try {
            const parsed = new URL(url.raw);
            path = parsed.pathname;
        } catch {
            path = url.raw.startsWith("/") ? url.raw : `/${url.raw}`;
        }
    }

    path = path.replace(/:(\w+)/g, "{$1}");
    path = path.replace(/{{(\w+)}}/g, "{$1}");

    return {
        path,
        queryParams: url.query,
        variables: url.variable,
    };
}

function processRequestBody(body: PostmanBody): OpenAPIRequestBody {
    const requestBody: OpenAPIRequestBody = {
        required: true,
        content: {},
    };

    switch (body.mode) {
        case "raw":
            const language = body.options?.raw?.language || "json";
            const contentType = getContentTypeFromLanguage(language);

            requestBody.content[contentType] = {
                schema:
                    language === "json" && body.raw
                        ? parseJsonSchema(body.raw)
                        : { type: "string", example: body.raw },
            };
            break;

        case "formdata":
            requestBody.content["multipart/form-data"] = {
                schema: {
                    type: "object",
                    properties: {},
                },
            };

            if (body.formdata) {
                const properties: Record<string, OpenAPISchema> = {};
                body.formdata.forEach((field) => {
                    if (!field.disabled) {
                        properties[field.key] = {
                            type: field.type === "file" ? "string" : "string",
                            format:
                                field.type === "file" ? "binary" : undefined,
                            example: field.value,
                            description: field.description,
                        };
                    }
                });
                requestBody.content["multipart/form-data"].schema.properties =
                    properties;
            }
            break;

        case "urlencoded":
            requestBody.content["application/x-www-form-urlencoded"] = {
                schema: {
                    type: "object",
                    properties: {},
                },
            };

            if (body.urlencoded) {
                const properties: Record<string, OpenAPISchema> = {};
                body.urlencoded.forEach((field) => {
                    if (!field.disabled) {
                        properties[field.key] = {
                            type: "string",
                            example: field.value,
                            description: field.description,
                        };
                    }
                });
                requestBody.content[
                    "application/x-www-form-urlencoded"
                ].schema.properties = properties;
            }
            break;

        case "binary":
            requestBody.content["application/octet-stream"] = {
                schema: {
                    type: "string",
                    format: "binary",
                },
            };
            break;

        case "graphql":
            requestBody.content["application/json"] = {
                schema: {
                    type: "object",
                    properties: {
                        query: { type: "string", example: body.graphql?.query },
                        variables: {
                            type: "object",
                            example: body.graphql?.variables,
                        },
                    },
                },
            };
            break;
    }

    return requestBody;
}

function getContentTypeFromLanguage(language: string): string {
    const mapping: Record<string, string> = {
        json: "application/json",
        xml: "application/xml",
        html: "text/html",
        text: "text/plain",
        javascript: "application/javascript",
    };
    return mapping[language] || "text/plain";
}

function parseJsonSchema(jsonString: string): OpenAPISchema {
    try {
        const parsed = JSON.parse(jsonString);
        return generateSchemaFromObject(parsed);
    } catch {
        return { type: "string", example: jsonString };
    }
}

function generateSchemaFromObject(obj: unknown): OpenAPISchema {
    if (obj === null) return { type: "null" };
    if (typeof obj === "string") return { type: "string", example: obj };
    if (typeof obj === "number") return { type: "number", example: obj };
    if (typeof obj === "boolean") return { type: "boolean", example: obj };

    if (Array.isArray(obj)) {
        return {
            type: "array",
            items:
                obj.length > 0
                    ? generateSchemaFromObject(obj[0])
                    : { type: "string" },
        };
    }

    if (typeof obj === "object" && obj !== null) {
        const properties: Record<string, OpenAPISchema> = {};
        for (const [key, value] of Object.entries(obj)) {
            properties[key] = generateSchemaFromObject(value);
        }
        return {
            type: "object",
            properties,
        };
    }

    return { type: "string" };
}

function getResponseContentType(
    headers: PostmanHeader[] | null | undefined
): string {
    if (!headers) return "application/json";

    const contentTypeHeader = headers.find(
        (h) => h.key.toLowerCase() === "content-type"
    );

    return contentTypeHeader?.value || "application/json";
}

function parseResponseBody(body: string, contentType: string): OpenAPISchema {
    if (contentType.includes("json")) {
        try {
            const parsed = JSON.parse(body);
            return generateSchemaFromObject(parsed);
        } catch {
            return { type: "string", example: body };
        }
    }

    return { type: "string", example: body };
}

function isCommonHeader(headerName: string): boolean {
    const commonHeaders = [
        "content-type",
        "authorization",
        "accept",
        "user-agent",
        "content-length",
        "host",
        "connection",
        "cache-control",
    ];
    return commonHeaders.includes(headerName.toLowerCase());
}
