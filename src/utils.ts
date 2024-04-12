import type * as arctic from "arctic";

const notProviders = [
	"generateCodeVerifier",
	"generateState",
	"OAuth2RequestError",
] as const;

export type Providers = Exclude<
	keyof typeof arctic,
	(typeof notProviders)[number]
>;
export type RefreshableProvidersMap<P extends Providers> = {
	// @ts-expect-error
	[K in P]: GetProvider<K>["refreshAccessToken"] extends Function ? K : never;
};

export type RefreshableProviders<P extends Providers> = Extract<
	keyof RefreshableProvidersMap<P>,
	{
		[K in keyof RefreshableProvidersMap<P>]: RefreshableProvidersMap<P>[K] extends never
			? never
			: K;
	}[keyof RefreshableProvidersMap<P>]
>;

export type GetProvider<Provider extends Providers> = InstanceType<
	(typeof arctic)[Provider]
>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Shift<T extends any[]> = ((...t: T) => void) extends (
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	h: any,
	...r: infer R
) => void
	? R
	: never;
