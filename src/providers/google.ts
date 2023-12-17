import fastQueryString from "fast-querystring"
import { Oauth2Error } from "../oauth2Error"
import { AccessTokenFailure, Auth2Options, Provider } from "."

export interface GoogleOptions
    extends Omit<Auth2Options<GoogleAccessTokenResponse>, "responseType"> {
    access_type?: "online" | "offline" | string

    include_granted_scopes?: boolean

    login_hint?: string

    prompt?: "none" | "consent" | "select_account" | string

    /**
     * [About scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
     */
    scope: string[]
}

export interface GoogleAccessTokenResponse {
    access_token: string
    expires_in: number
    token_type: string
    id_token: string
    scope: string
}

export class GoogleProvider<T extends GoogleOptions> implements Provider {
    authorizationURI = "https://accounts.google.com/o/oauth2/v2/auth"
    accessTokenURI = "https://accounts.google.com/o/oauth2/token"
    options: T

    constructor(options: T) {
        this.options = options
    }

    generateURI(state?: string) {
        return (
            this.authorizationURI +
            "?" +
            fastQueryString.stringify({
                client_id: this.options.client.id,
                redirect_uri: this.options.callbackURI,
                response_type: "code",
                scope: this.options.scope.join(","),
                state: state ? encodeURIComponent(state) : undefined,
            })
        )
    }

    async getAccessToken(code: string) {
        const data = new FormData()
        data.append("grant_type", "authorization_code")
        data.append("code", code)
        data.append("redirect_uri", this.options.callbackURI)

        const res = await fetch(this.accessTokenURI, {
            method: "POST",
            body: data,
            headers: {
                authorization: `Basic ${btoa(
                    this.options.client.id + ":" + this.options.client.secret,
                )}`,
            },
        })

        if (!res.ok) throw new Oauth2Error(await res.json<AccessTokenFailure>())

        return res.json<GoogleAccessTokenResponse>()
    }
}
