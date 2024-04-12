import * as arctic from "arctic";
import Elysia from "elysia";

export * from "arctic";

const notProviders = [
	"generateCodeVerifier",
	"generateState",
	"OAuth2RequestError",
] as const;

type Providers = Exclude<keyof typeof arctic, (typeof notProviders)[number]>;

type A = ConstructorParameters<(typeof arctic)["AniList"]>;

export interface ElysiaAuth2Options {
	providers: {
		[K in Providers]?: ConstructorParameters<(typeof arctic)[K]>;
	};
}

// @ts-expect-error
console.log(Object.keys(arctic).filter((x) => !notProviders.includes(x)));

export function oauth2(options: ElysiaAuth2Options) {
	return new Elysia({ name: "elysia-oauth2" });
}
