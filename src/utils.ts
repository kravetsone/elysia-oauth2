import type * as arctic from "arctic";

const notProviders = [
	"OAuth2Tokens",
	"generateCodeVerifier",
	"generateState",
	"OAuth2RequestError",
	"ArcticFetchError",
	"decodeIdToken"
] as const;

export type Providers = Exclude<
	keyof typeof arctic,
	(typeof notProviders)[number]
>;
export type RefreshableProvidersMap<P extends Providers> = {
	[K in P]: GetProvider<K> extends { refreshAccessToken: Function }
		? K
		: never;
};

export type RefreshableProviders<P extends Providers = Providers> = Extract<
	keyof RefreshableProvidersMap<P>,
	{
		[K in keyof RefreshableProvidersMap<P>]: RefreshableProvidersMap<P>[K] extends never
			? never
			: K;
	}[keyof RefreshableProvidersMap<P>]
>;

export type RevokableProvidersMap<P extends Providers> = {
	[K in P]: GetProvider<K> extends { revokeToken: Function } ? K : never;
};

export type RevokableProviders<P extends Providers = Providers> = Extract<
	keyof RevokableProvidersMap<P>,
	{
		[K in keyof RevokableProvidersMap<P>]: RevokableProvidersMap<P>[K] extends never
			? never
			: K;
	}[keyof RevokableProvidersMap<P>]
>;

export type GetProvider<Provider extends Providers> = InstanceType<
	(typeof arctic)[Provider]
>;

export type GetProviderRedirectOptions<Provider extends Providers> = Parameters<
	GetProvider<Provider>["validateAuthorizationCode"]
>["length"] extends 2
	? Shift<Shift<Parameters<GetProvider<Provider>["createAuthorizationURL"]>>>
	: Shift<Parameters<GetProvider<Provider>["createAuthorizationURL"]>>;

export type GetProviderAuthorizeOptions<Provider extends Providers> =
	Parameters<
		GetProvider<Provider>["validateAuthorizationCode"]
	>["length"] extends 2
		? Shift<
				Shift<
					Parameters<
						GetProvider<Provider>["validateAuthorizationCode"]
					>
				>
		  >
		: Shift<Parameters<GetProvider<Provider>["validateAuthorizationCode"]>>;

export type GetProviderAuthorizeReturn<Provider extends Providers> = Awaited<
	ReturnType<GetProvider<Provider>["validateAuthorizationCode"]>
>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Shift<T extends any[]> = ((...t: T) => void) extends (
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	h: any,
	...r: infer R
) => void
	? R
	: never;
