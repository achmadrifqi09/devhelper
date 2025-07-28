export interface PostmanHeader {
    key: string;
    value: string;
    disabled?: boolean;
    description?: string;
}

export interface PostmanQueryParam {
    key: string;
    value: string;
    disabled?: boolean;
    description?: string;
}

export interface PostmanVariable {
    key: string;
    value: string;
    type?: string;
    description?: string;
}

export interface PostmanUrl {
    raw?: string;
    protocol?: string;
    host?: string[];
    port?: string;
    path?: string[];
    query?: PostmanQueryParam[];
    variable?: PostmanVariable[];
    hash?: string;
}

export interface PostmanAuth {
    type:
        | "bearer"
        | "basic"
        | "apikey"
        | "oauth1"
        | "oauth2"
        | "hawk"
        | "digest"
        | "ntlm";
    bearer?: Array<{ key: string; value: string; type?: string }>;
    basic?: Array<{ key: string; value: string; type?: string }>;
    apikey?: Array<{ key: string; value: string; in?: string; type?: string }>;
    oauth1?: Array<{ key: string; value: string; type?: string }>;
    oauth2?: Array<{ key: string; value: string; type?: string }>;
    hawk?: Array<{ key: string; value: string; type?: string }>;
    digest?: Array<{ key: string; value: string; type?: string }>;
    ntlm?: Array<{ key: string; value: string; type?: string }>;
}

export interface PostmanBody {
    mode?: "raw" | "formdata" | "urlencoded" | "binary" | "graphql" | "file";
    raw?: string;
    options?: {
        raw?: {
            language?: string;
        };
    };
    formdata?: Array<{
        key: string;
        value?: string;
        type?: "text" | "file";
        src?: string;
        disabled?: boolean;
        description?: string;
    }>;
    urlencoded?: Array<{
        key: string;
        value: string;
        disabled?: boolean;
        description?: string;
    }>;
    file?: {
        src: string;
    };
    graphql?: {
        query?: string;
        variables?: string;
    };
}

export interface PostmanRequest {
    method?: string;
    url?: PostmanUrl | string;
    header?: PostmanHeader[];
    body?: PostmanBody;
    auth?: PostmanAuth;
    description?: string;
}

export interface PostmanResponse {
    name?: string;
    originalRequest?: PostmanRequest;
    status?: string;
    code?: number;
    _postman_previewlanguage?: string;
    header?: PostmanHeader[] | null;
    cookie?: any[];
    body?: string;
}

export interface PostmanEvent {
    listen: string;
    script: {
        type?: string;
        exec?: string[];
        src?: string;
    };
}

export interface PostmanItem {
    name?: string;
    description?: string;
    request?: PostmanRequest;
    response?: PostmanResponse[];
    item?: PostmanItem[];
    event?: PostmanEvent[];
    variable?: PostmanVariable[];
    auth?: PostmanAuth;
}

export interface PostmanInfo {
    _postman_id?: string;
    name?: string;
    description?: string;
    version?: string;
    schema?: string;
}

export interface PostmanCollection {
    info?: PostmanInfo;
    item?: PostmanItem[];
    event?: PostmanEvent[];
    variable?: PostmanVariable[];
    auth?: PostmanAuth;
}
