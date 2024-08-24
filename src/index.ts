import * as arctic from "arctic";
import { Elysia } from "elysia";
import type {
	GetProvider,
	GetProviderAuthorizeOptions,
	GetProviderAuthorizeReturn,
	GetProviderRedirectOptions,
	Providers,
	RefreshableProviders,
	RevokableProviders
} from "./utils";

export * from "arctic";
export type { GetProvider, Providers, RefreshableProviders } from "./utils";

export type ElysiaOauth2Options = {
	[K in Providers]?: ConstructorParameters<(typeof arctic)[K]>;
};

export function oauth2<Options extends ElysiaOauth2Options>(options: Options) {
	const providers = {} as {
		[K in keyof Options]: GetProvider<K & Providers>;
	};

	for (const provider of Object.keys(options) as (keyof Options)[]) {
		// @ts-expect-error
		providers[provider] = new arctic[provider](...options[provider]);
	}

	return new Elysia({ name: "elysia-oauth2" })
		.error("OAUTH2_REQUEST_ERROR", arctic.OAuth2RequestError)
		.derive(function deriveOauth2Methods({ cookie, query, redirect }) {
			return {
				oauth2: {
					createURL: <Provider extends keyof Options>(
						provider: Provider,
						//@ts-expect-error
						...options: GetProviderRedirectOptions<Provider>
					): URL => {
						const state = arctic.generateState();

						cookie.state.set({
							value: state,
							secure: true,
							sameSite: "lax",
							path: "/",
							httpOnly: true,
							maxAge: 60 * 10 // 10 min
						})

						if (
							providers[provider].validateAuthorizationCode
								.length === 2
						) {
							const codeVerifier = arctic.generateCodeVerifier();
							cookie.codeVerifier.set({
								value: codeVerifier,
								secure: true,
								sameSite: "lax",
								path: "/",
								httpOnly: true,
								maxAge: 60 * 10 // 10 min
							})
							options.unshift(codeVerifier);
						}

						return providers[provider].createAuthorizationURL(
							state,
							// @ts-expect-error
							...options
						);
					},
					// TODO: reuse createURL method
					redirect: async <Provider extends keyof Options>(
						provider: Provider,
						//@ts-expect-error
						...options: GetProviderRedirectOptions<Provider>
					) => {
						const state = arctic.generateState();

						cookie.state.set({
							value: state,
							secure: true,
							sameSite: "lax",
							path: "/",
							httpOnly: true,
							maxAge: 60 * 10 // 10 min
						})

						if (
							providers[provider].validateAuthorizationCode
								.length === 2
						) {
							const codeVerifier = arctic.generateCodeVerifier();
							cookie.codeVerifier.set({
								value: codeVerifier,
								secure: true,
								sameSite: "lax",
								path: "/",
								httpOnly: true,
								maxAge: 60 * 10 // 10 min
							})
							options.unshift(codeVerifier);
						}

						const url = providers[
							provider
							// @ts-expect-error
						].createAuthorizationURL(state, ...options);

						// @ts-expect-error
						return redirect(url.href) as Response;
					},
					authorize: async <Provider extends keyof Options>(
						provider: Provider,
						// @ts-expect-error
						...options: GetProviderAuthorizeOptions<Provider>
					): // @ts-expect-error
					Promise<GetProviderAuthorizeReturn<Provider>> => {
						if (cookie.state.value !== query.state)
							throw Error("state mismatch");

						cookie.state.remove();

						if (
							providers[provider].validateAuthorizationCode
								.length === 2
						) {
							if (!cookie.codeVerifier.value)
								throw new Error(
									`Bug with ${String(
										provider
									)} and codeVerifier. Please open issue`
								);
							options.unshift(cookie.codeVerifier.value);
							cookie.codeVerifier.remove();
						}

						const tokens = await providers[
							provider
							// @ts-expect-error
						].validateAuthorizationCode(query.code, ...options);

						// @ts-expect-error
						return tokens;
					},
					refresh: async <
						// @ts-expect-error
						Provider extends RefreshableProviders<keyof Options>
					>(
						provider: Provider,
						...options: // @ts-expect-error
						Parameters<GetProvider<Provider>["refreshAccessToken"]>
					): Promise<
						Awaited<
							ReturnType<
								// @ts-expect-error
								GetProvider<Provider>["refreshAccessToken"]
							>
						>
					> => {
						const tokens = await providers[
							provider
							// @ts-expect-error
						].refreshAccessToken(...options);

						return tokens;
					},
					revoke: async <
						// @ts-expect-error
						Provider extends RevokableProviders<keyof Options>
					>(
						provider: Provider,
						...options: // @ts-expect-error
						Parameters<GetProvider<Provider>["revokeToken"]>
					): Promise<
						Awaited<
							ReturnType<
								// @ts-expect-error
								GetProvider<Provider>["revokeToken"]
							>
						>
					> => {
						const response = await providers[
							provider
							// @ts-expect-error
						].revokeToken(...options);

						return response;
					}
				}
			};
		})
		.as("plugin");
}
