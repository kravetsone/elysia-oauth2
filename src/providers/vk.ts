import fastQueryString from "fast-querystring";
import type { AccessTokenFailure, Auth2Options, Provider } from ".";
import { Oauth2Error } from "../oauth2Error";

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
	| "phone_number";

export interface VKOptions
	extends Omit<Auth2Options<VKAccessTokenResponse>, "responseType"> {
	display?: "page" | "popup" | "mobile";
	scope?: TScope[] | string[];
}

export interface VKAccessTokenResponse {
	access_token: string;
	expires_in: string;
	user_id: string;
	email?: string;
}

export class VKAuth2Provider<T extends VKOptions> implements Provider {
	authorizationURI = "https://oauth.vk.com/authorize";
	accessTokenURI = "https://oauth.vk.com/access_token";
	options: T;

	constructor(options: T) {
		this.options = options;
	}

	generateURI(state?: string) {
		return `${this.authorizationURI}?${fastQueryString.stringify({
			client_id: this.options.client.id,
			redirect_uri: this.options.callbackURI,
			response_type: "code",
			scope: this.options.scope?.join(","),
			state: state ? encodeURIComponent(state) : undefined,
		})}`;
	}

	async getAccessToken(code: string) {
		const res = await fetch(
			`${this.accessTokenURI}?${fastQueryString.stringify({
				client_id: this.options.client.id,
				client_secret: this.options.client.secret,
				redirect_uri: this.options.callbackURI,
				code,
			})}`,
		);

		if (!res.ok)
			throw new Oauth2Error((await res.json()) as AccessTokenFailure);

		return res.json() as Promise<VKAccessTokenResponse>;
	}
}
