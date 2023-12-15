export * from "./vk"

export interface Auth2Options {
    client: {
        id: string
        secret: string
    }
    callbackURI: string
    responseType?: "code"
    startRedirectPath?: string
    callbackPath?: string
}

export interface Provider {
    authorizationURI: string
    accessTokenURI: string
    generateURI: (state?: string) => string
}
