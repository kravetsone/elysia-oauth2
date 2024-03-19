import type { Handler } from "elysia";

export * from "./discord";
export * from "./google";
export * from "./vk";

// [INFO] Elysia doesn't re-export TSchema :(
// export type TSchema = ReturnType<typeof t.Index>;

export interface AccessTokenFailure {
	error: string;
	error_description: string;
}

export interface Auth2Options<T> {
	client: {
		id: string;
		secret: string;
	};
	responseType?: "code";
	startRedirectPath?: string;
	callback?: {
		path: string;
		//get Elysia handler
		onSuccess: Handler<
			{},
			{
				decorator: {};
				store: {};
				derive: {
					accessTokenData: T;
					state: string | undefined;
				};
				resolve: {};
			},
			""
		>;
	};
	callbackURI: string;
}

export interface Provider {
	constructor: Function;
	authorizationURI: string;
	accessTokenURI: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	options: Auth2Options<any>;
	generateURI: (state?: string) => string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	getAccessToken: (code: string) => Promise<any>;
	// getProfile: (accessToken: string) => Promise<any>
}
