import Elysia, { t } from "elysia"

export * from "./vk"

// [INFO] Elysia doesn't re-export TSchema :(
export type TSchema = ReturnType<typeof t.Index>;

export interface Auth2Options<T> {
    client: {
        id: string
        secret: string
    }
    callbackURI: string
    responseType?: "code"
    startRedirectPath?: string
    callbackPath?: string
    // [INFO] implement typed state later...
    // state?: TSchema
    onSuccess: Parameters<
        InstanceType<
            typeof Elysia<
                "",
                {
                    request: {
                        accessTokenData: T
                        state: string | null
                    }
                    store: {}
                },
                {
                    type: {}
                    error: {}
                },
                {},
                {},
                false
            >
        >["get"]
    >[1]
}

export interface Provider {
    constructor: Function
    authorizationURI: string
    accessTokenURI: string
    generateURI: (state?: string) => string
    getAccessToken: (code: string) => Promise<any>
}
