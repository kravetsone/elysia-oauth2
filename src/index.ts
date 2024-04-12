import * as arctic from "arctic";
import Elysia from "elysia";
import type { GetProvider, Providers, Shift } from "./utils";

export * from "arctic";
export { GetProvider, Providers } from "./utils";

export type ElysiaAuth2Options = {
	[K in Providers]?: ConstructorParameters<(typeof arctic)[K]>;
};

export function oauth2<Options extends ElysiaAuth2Options>(options: Options) {
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
					redirect: async <Provider extends keyof Options>(
						provider: Provider,
						...options: Shift<
							Parameters<
								// @ts-expect-error works fine
								GetProvider<Provider>["createAuthorizationURL"]
							>
						>
					) => {
						const state = arctic.generateState();

						cookie.state.value = state;

						// @ts-expect-error
						const url = await providers[provider].createAuthorizationURL(
							state,
							...options,
						);
						set.redirect = url.href;
					},
					authorize: async <Provider extends keyof Options>(
						provider: Provider,
						...options: Shift<
							// @ts-expect-error
							Parameters<GetProvider<Provider>["validateAuthorizationCode"]>
						>
					): Promise<
						Awaited<
							// @ts-expect-error
							ReturnType<GetProvider<Provider>["validateAuthorizationCode"]>
						>
					> => {
						if (cookie.state.value !== query.state)
							throw Error("state mismatch");

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
						...options: Shift<
							Parameters<GetProvider<Provider>["refreshAccessToken"]>
						>
					): Promise<
						Awaited<ReturnType<GetProvider<Provider>["refreshAccessToken"]>>
					> => {
						const tokens = await providers[provider].refreshAccessToken(
							...options,
						);

						return tokens;
					},
				},
			};
		});
}
