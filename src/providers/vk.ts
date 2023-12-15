import fastQueryString from "fast-querystring"
import { Auth2Options, Provider } from "."

type TScope =
    | "notify"
    | "friends"
    | "photos"
    | "audio"
    | "video"
    | "stories"
    | "pages"
    | "menu"
    | "status"
    | "notes"
    | "messages"
    | "offline"
    | "docs"
    | "groups"
    | "notifications"
    | "stats"
    | "email"
    | "market"
    | "phone_number"

export interface VKOptions extends Omit<Auth2Options, "responseType"> {
    display?: "page" | "popup" | "mobile"
    scope?: TScope[] | string[]
}

export interface AccessTokenResponse {
    access_token: string
    expires_in: string
    user_id: string
    email?: string
}

export class VKAuth2Provider implements Provider {
    authorizationURI = "https://oauth.vk.com/authorize"
    accessTokenURI = "https://oauth.vk.com/access_token"
    options: VKOptions

    constructor(options: VKOptions) {
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
                scope: this.options.scope?.join(","),
                state,
            })
        )
    }

    async getAccessToken(code: string) {
        const res = await fetch(
            this.accessTokenURI +
                "?" +
                fastQueryString.stringify({
                    client_id: this.options.client.id,
                    client_secret: this.options.client.secret,
                    redirect_uri: this.options.callbackURI,
                    code,
                }),
        )

        return res.json<AccessTokenResponse>()
    }
}
