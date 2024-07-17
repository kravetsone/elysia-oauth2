import * as arctic from "arctic";
import Elysia from "elysia";
import type {
	GetProvider,
	GetProviderAuthorizeOptions,
	GetProviderAuthorizeReturn,
	GetProviderRedirectOptions,
	Providers,
	RefreshableProviders,
} from "./utils";

export * from "arctic";
export type { GetProvider, Providers, RefreshableProviders } from "./utils";

export type ElysiaOauth2Options = {
	[K in Providers]?: ConstructorParameters<(typeof arctic)[K]>;
};

export function oauth2<Options extends ElysiaOauth2Options>(options: Options) {
	// @ts-expect-error
	const providers: {
		// @ts-expect-error
		[K in keyof Options]: GetProvider<K>;
	} = {};

	for (const provider of Object.keys(options) as (keyof Options)[]) {
		// @ts-expect-error
		providers[provider] = new arctic[provider](...options[provider]);
	}

	return new Elysia({ name: "elysia-oauth2" })
		.error("OAUTH2_REQUEST_ERROR", arctic.OAuth2RequestError)
		.derive({ as: "global" }, ({ set, cookie, query }) => {
			return {
				oauth2: {
					createURL: async <Provider extends keyof Options>(
						provider: Provider,
						//@ts-expect-error
						...options: GetProviderRedirectOptions<Provider>
					): Promise<URL> => {
						const state = arctic.generateState();

						cookie.state.value = state;
						cookie.state.maxAge = 60 * 10; // 10 min

						// @ts-expect-error
						if (providers[provider].validateAuthorizationCode.length === 2) {
							const codeVerifier = arctic.generateCodeVerifier();
							cookie.codeVerifier.value = codeVerifier;
							cookie.codeVerifier.maxAge = 60 * 10; // 10 min
							options.unshift(codeVerifier);
						}

						// @ts-expect-error
						return providers[provider].createAuthorizationURL(
							state,
							...options,
						);
					},
					// TODO: reuse createURL method
					redirect: async <Provider extends keyof Options>(
						provider: Provider,
						//@ts-expect-error
						...options: GetProviderRedirectOptions<Provider>
					) => {
						const state = arctic.generateState();

						cookie.state.value = state;
						cookie.state.maxAge = 60 * 10; // 10 min

						// @ts-expect-error
						if (providers[provider].validateAuthorizationCode.length === 2) {
							const codeVerifier = arctic.generateCodeVerifier();
							cookie.codeVerifier.value = codeVerifier;
							cookie.codeVerifier.maxAge = 60 * 10; // 10 min
							options.unshift(codeVerifier);
						}

						// @ts-expect-error
						const url = await providers[provider].createAuthorizationURL(
							state,
							...options,
						);
						set.redirect = url.href;
					},
					authorize: async <Provider extends keyof Options>(
						provider: Provider,
						// @ts-expect-error
						...options: GetProviderAuthorizeOptions<Provider>
						// @ts-expect-error
					): Promise<GetProviderAuthorizeReturn<Provider>> => {
						if (cookie.state.value !== query.state)
							throw Error("state mismatch");

						cookie.state.remove();

						// @ts-expect-error
						if (providers[provider].validateAuthorizationCode.length === 2) {
							if (!cookie.codeVerifier.value)
								throw new Error(
									`Bug with ${String(
										provider,
									)} and codeVerifier. Please open issue`,
								);
							options.unshift(cookie.codeVerifier.value);
							cookie.codeVerifier.remove();
						}

						// @ts-expect-error
						const tokens = await providers[provider].validateAuthorizationCode(
							query.code,
							...options,
						);

						return tokens;
					},
					refresh: async <
						// @ts-expect-error
						Provider extends RefreshableProviders<keyof Options>,
					>(
						provider: Provider,
						...options: // @ts-expect-error
						Parameters<GetProvider<Provider>["refreshAccessToken"]>
					): Promise<
						// @ts-expect-error
						Awaited<ReturnType<GetProvider<Provider>["refreshAccessToken"]>>
					> => {
						// @ts-expect-error
						const tokens = await providers[provider].refreshAccessToken(
							...options,
						);

						return tokens;
					},
				},
			};
		});
}
