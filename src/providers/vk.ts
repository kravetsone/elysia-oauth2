import fastQueryString from "fast-querystring"
import { Auth2Options, Auth2Provider, ProviderOptions } from "."

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

export interface VKOptions extends Auth2Options {
    display?: "page" | "popup" | "mobile"
    scope?: TScope[] | string[]
}

export class VKAuth2Provider extends Auth2Provider implements ProviderOptions {
    authorizationURI = "https://oauth.vk.com/authorize?"
    accessTokenURI = "https://oauth.vk.com/access_token"
    options: VKOptions

    constructor(options: VKOptions) {
        super()
        this.options = options
    }

    generateAuth2URI() {
        return (
            this.authorizationURI +
            fastQueryString.stringify({
                client_id: this.options.client.id,
                redirect_uri: this.options.redirectURI,
                response_type: "code",
                scope: this.options.scope?.join(","),
                state: this.options.state,
            })
        )
    }
}
