import * as arctic from "arctic";
import { Elysia } from "elysia";
import type { ElysiaCookie } from "elysia/cookies";
import type {
	GetProvider,
	GetProviderAuthorizeOptions,
	GetProviderRedirectOptions,
	Providers,
	RefreshableProviders,
	RevokableProviders,
} from "./utils";

export * from "arctic";
export type { GetProvider, Providers, RefreshableProviders } from "./utils";

export type ElysiaOauth2ProvidersOptions = {
	[K in Providers]?: ConstructorParameters<(typeof arctic)[K]>;
};

export interface ElysiaOauth2Options {
	cookie?: Omit<Partial<ElysiaCookie>, "value">;
}

export function oauth2<ProvidersOptions extends ElysiaOauth2ProvidersOptions>(
	providersCredentials: ProvidersOptions,
	options: ElysiaOauth2Options = {},
) {
	const providers = {} as {
		[K in keyof ProvidersOptions]: GetProvider<K & Providers>;
	};

	const cookieDefaults = {
		secure: true,
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		maxAge: 60 * 30, // 30 min
		...options.cookie,
	} as const satisfies Partial<ElysiaCookie>;

	for (const provider of Object.keys(
		providersCredentials,
	) as (keyof ProvidersOptions)[]) {
		// @ts-expect-error
		providers[provider] = new arctic[provider](
			// @ts-expect-error
			...providersCredentials[provider],
		);
	}

	return new Elysia({ name: "elysia-oauth2" })
		.error("OAUTH2_REQUEST_ERROR", arctic.OAuth2RequestError)
		.derive(function deriveOauth2Methods({ cookie, query, redirect }) {
			return {
				oauth2: {
					createURL: <Provider extends keyof ProvidersOptions>(
						provider: Provider,
						//@ts-expect-error
						...options: GetProviderRedirectOptions<Provider>
					): URL => {
						const state = arctic.generateState();

						cookie.state.set({
							value: state,
							...cookieDefaults,
						});

						if (
							[3, 2].includes(
								providers[provider].validateAuthorizationCode.length,
							)
						) {
							const codeVerifier = arctic.generateCodeVerifier();
							cookie.codeVerifier.set({
								value: codeVerifier,
								...cookieDefaults,
							});
							options.unshift(codeVerifier);
						}

						return providers[provider].createAuthorizationURL(
							state,
							// @ts-expect-error
							...options,
						);
					},
					// TODO: reuse createURL method
					redirect: async <Provider extends keyof ProvidersOptions>(
						provider: Provider,
						//@ts-expect-error
						...options: GetProviderRedirectOptions<Provider>
					) => {
						const state = arctic.generateState();

						cookie.state.set({
							value: state,
							...cookieDefaults,
						});

						if (
							[3, 2].includes(
								providers[provider].validateAuthorizationCode.length,
							)
						) {
							const codeVerifier = arctic.generateCodeVerifier();
							cookie.codeVerifier.set({
								value: codeVerifier,
								...cookieDefaults,
							});
							options.unshift(codeVerifier);
						}

						const url = providers[provider].createAuthorizationURL(
							state,
							// @ts-expect-error
							...options,
						);

						// @ts-expect-error
						return redirect(url.href) as Response;
					},
					authorize: async <Provider extends keyof ProvidersOptions>(
						provider: Provider,
						// @ts-expect-error
						...options: GetProviderAuthorizeOptions<Provider>
					): Promise<arctic.OAuth2Tokens> => {
						if (cookie.state.value !== query.state)
							throw Error("state mismatch");

						cookie.state.remove();

						if (
							[3, 2].includes(
								providers[provider].validateAuthorizationCode.length,
							)
						) {
							if (!cookie.codeVerifier.value)
								throw new Error(
									`Bug with ${String(
										provider,
									)} and codeVerifier. Please open issue`,
								);
							options.unshift(cookie.codeVerifier.value);
							cookie.codeVerifier.remove();
						}

						const tokens = await providers[provider].validateAuthorizationCode(
							query.code,
							// @ts-expect-error
							...options,
						);

						return tokens;
					},
					refresh: async <
						// @ts-expect-error
						Provider extends RefreshableProviders<keyof ProvidersOptions>,
					>(
						provider: Provider,
						// @ts-expect-error
						...options: Parameters<GetProvider<Provider>["refreshAccessToken"]>
					): Promise<arctic.OAuth2Tokens> => {
						// @ts-expect-error
						const tokens = await providers[provider].refreshAccessToken(
							...options,
						);

						return tokens;
					},
					revoke: async <
						// @ts-expect-error
						Provider extends RevokableProviders<keyof ProvidersOptions>,
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
						// @ts-expect-error
						const response = await providers[provider].revokeToken(...options);

						return response;
					},
				},
			};
		})
		.as("plugin");
}
