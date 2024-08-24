import { Elysia } from "elysia";
import { oauth2 } from "../src";
import { staticPlugin } from "@elysiajs/static";
import { TestPage } from "./TestPage";
import { createElement } from "react";
import { unlinkSync } from "node:fs";

import { renderToReadableStream } from "react-dom/server.browser";

if (
	!process.env.GOOGLE_CLIENT_ID ||
	!process.env.GOOGLE_CLIENT_SECRET ||
	!process.env.GOOGLE_REDIRECT_URI
) {
	throw new Error("Google OAuth2 credentials are not set in .env file");
}

const testBuildFile = Bun.file("./tests/TestBuildPage.js");

if (await testBuildFile.exists()) {
	unlinkSync("./build/TestBuildPage.js");
}

const { logs, success } = await Bun.build({
	entrypoints: ["./tests/PageIndex.tsx"],
	outdir: "./build",
	naming: `TestBuildPage.[ext]`,
	minify: true,
	splitting: true,
	format: "esm"
});

if (!success) {
	throw new AggregateError(logs);
}

const handlePageRequest = async (
	pageComponent: React.ComponentType,
	index: string
) => {
	const page = createElement(pageComponent);
	const stream = await renderToReadableStream(page, {
		bootstrapModules: [index]
	});

	return new Response(stream, {
		headers: { "Content-Type": "text/html" }
	});
};

const app = new Elysia().use(
	oauth2({
		Google: [
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI
		]
	})
		.use(
			staticPlugin({
				assets: "./build",
				prefix: ""
			})
		)
		.get("/", () => handlePageRequest(TestPage, "/TestBuildPage.js"))
		.get("/auth/google", async ({ oauth2, redirect }) => {
			const authorizationUrl = oauth2.createURL("Google", [
				"https://www.googleapis.com/auth/userinfo.profile",
				"https://www.googleapis.com/auth/userinfo.email"
			]);

			authorizationUrl.searchParams.set("access_type", "offline");
			authorizationUrl.searchParams.set("prompt", "consent");

			return redirect(authorizationUrl.toString());
		})
		.get(
			"/auth/google/callback",
			async ({
				oauth2,
				cookie: { redirectUrl, userRefreshToken },
				error,
				redirect
			}) => {
				try {
					const token = await oauth2.authorize("Google");

					if (token.hasRefreshToken()) {
						userRefreshToken.set({
							value: token.refreshToken(),
							secure: true,
							httpOnly: true,
							sameSite: "strict"
						});
					}

					return redirect(redirectUrl.value || "/");
				} catch (err) {
					if (err instanceof Error) {
						console.error(
							"Failed to authorize Google:",
							err.message
						);
					}

					return error(500);
				}
			}
		)
		.get("/auth-status", ({ cookie: { userRefreshToken } }) => {
			const isLoggedIn = userRefreshToken.value !== undefined;

			return new Response(JSON.stringify({ isLoggedIn }), {
				headers: { "Content-Type": "application/json" }
			});
		})
		.post("/set-redirect-url", ({ request, cookie }) => {
			const url = request.headers.get("Referer") || "/";

			cookie.redirectUrl.value = url;

			return new Response(null, {
				status: 204
			});
		})

		.post("/logout", async ({ cookie: { userRefreshToken } }) => {
			if (userRefreshToken.value !== undefined) {
				userRefreshToken.remove();
			}

			return new Response(null, {
				status: 204
			});
		})
		.post(
			"/revoke-token",
			async ({ oauth2, error, cookie: { userRefreshToken } }) => {
				try {
					if (userRefreshToken.value !== undefined) {
						const response = await oauth2.revoke(
							"Google",
							userRefreshToken.value
						);

						userRefreshToken.remove();

						return response;
					} else {
						return error(400);
					}
				} catch (err) {
					if (err instanceof Error) {
						console.error("Failed to revoke token:", err.message);
					}

					return error(500);
				}
			}
		)
		.listen(3000, () => {
			console.log("Server is running on http://localhost:3000");
		})
);
