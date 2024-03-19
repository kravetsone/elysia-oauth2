import fastQueryString from "fast-querystring";
import type { AccessTokenFailure, Auth2Options, Provider } from ".";
import { Oauth2Error } from "../oauth2Error";

type TScope =
	| "activities.read"
	| "activities.write"
	| "applications.builds.read"
	| "applications.builds.upload"
	| "applications.commands"
	| "applications.commands.update"
	| "applications.commands.permissions.update"
	| "applications.entitlements"
	| "applications.store.update"
	| "bot"
	| "connections"
	| "dm_channels.read"
	| "email"
	| "gdm.join"
	| "guilds"
	| "guilds.join"
	| "guilds.members.read"
	| "identify"
	| "messages.read"
	| "relationships.read"
	| "role_connections.write"
	| "rpc"
	| "rpc.activities.write"
	| "rpc.notifications.read"
	| "rpc.voice.read"
	| "rpc.voice.write"
	| "voice"
	| "webhook.incoming";

export interface DiscordOptions
	extends Omit<Auth2Options<DiscordAccessTokenResponse>, "responseType"> {
	/**
	 * prompt controls how the authorization flow handles existing authorizations. If a user has previously authorized your application with the requested scopes and prompt is set to consent, it will request them to reapprove their authorization. If set to none, it will skip the authorization screen and redirect them back to your redirect URI without requesting their authorization. For passthrough scopes, like bot and webhook.incoming, authorization is always required.
	 */
	prompt?: "consent" | "none" | string;

	/**
	 * [About scopes](https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes)
	 */
	scope: TScope[] | string[];
}

export interface DiscordAccessTokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
	refresh_token: string;
	scope: string;
}

export class DiscordProvider<T extends DiscordOptions> implements Provider {
	authorizationURI = "https://discord.com/oauth2/authorize";
	accessTokenURI = "https://discord.com/api/oauth2/token";
	options: T;

	constructor(options: T) {
		this.options = options;
	}

	generateURI(state?: string) {
		return `${this.authorizationURI}?${fastQueryString.stringify({
			client_id: this.options.client.id,
			redirect_uri: this.options.callbackURI,
			response_type: "code",
			scope: this.options.scope.join(","),
			state: state ? encodeURIComponent(state) : undefined,
		})}`;
	}

	async getAccessToken(code: string) {
		const data = new FormData();
		data.append("grant_type", "authorization_code");
		data.append("code", code);
		data.append("redirect_uri", this.options.callbackURI);

		const res = await fetch(this.accessTokenURI, {
			method: "POST",
			body: data,
			headers: {
				authorization: `Basic ${btoa(
					`${this.options.client.id}:${this.options.client.secret}`,
				)}`,
			},
		});

		if (!res.ok)
			throw new Oauth2Error((await res.json()) as AccessTokenFailure);

		return res.json() as Promise<DiscordAccessTokenResponse>;
	}
}
