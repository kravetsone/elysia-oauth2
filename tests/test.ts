import { Elysia } from "elysia";
import { oauth2 } from "../src";
import { staticPlugin } from "@elysiajs/static";
import { TestPage } from "./TestPage";
import { createElement } from "react";
import { rmSync } from "node:fs";
import { renderToReadableStream } from "react-dom/server.browser";

if (
	!process.env.GOOGLE_CLIENT_ID ||
	!process.env.GOOGLE_CLIENT_SECRET ||
	!process.env.GOOGLE_REDIRECT_URI
) {
	throw new Error("Google OAuth2 credentials are not set in .env file");
}

const buildDir = "./build";

rmSync(buildDir, { recursive: true, force: true });

const buildTimestamp = Date.now();
const { logs, success } = await Bun.build({
	entrypoints: ["./tests/PageIndex.tsx"],
	outdir: "./build",
	naming: `TestBuildPage-${buildTimestamp}.[ext]`,
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

const fetchUserInfo = async (accessToken: string) => {
	const response = await fetch(`https://www.googleapis.com/userinfo/v2/me`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
	if (!response.ok) {
		const errorDetails = await response.text();
		throw new Error(errorDetails);
	}

	return await response.json();
};

new Elysia().use(
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
		.get("/", () =>
			handlePageRequest(TestPage, `TestBuildPage-${buildTimestamp}.js`)
		)
		.get("/test-page-1", () =>
			handlePageRequest(TestPage, `TestBuildPage-${buildTimestamp}.js`)
		)
		.get("/test-page-2", () =>
			handlePageRequest(TestPage, `TestBuildPage-${buildTimestamp}.js`)
		)
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
		.get(
			"/auth-status",
			async ({ oauth2, error, cookie: { userRefreshToken } }) => {
				try {
					let isLoggedIn = false;
					let user = {};

					if (userRefreshToken.value !== undefined) {
						isLoggedIn = true;
						const tokens = await oauth2.refresh(
							"Google",
							userRefreshToken.value
						);

						user = await fetchUserInfo(tokens.accessToken());
					}

					return new Response(JSON.stringify({ isLoggedIn, user }), {
						headers: { "Content-Type": "application/json" }
					});
				} catch (err) {
					if (err instanceof Error) {
						console.error("Failed to refresh token:", err.message);
					}

					return error(500);
				}
			}
		)
		.put("/set-redirect-url", ({ headers, cookie, error }) => {
			try {
				const url = headers["referer"] || "/";

				cookie.redirectUrl.value = url;

				return new Response(null, {
					status: 204
				});
			} catch (err) {
				if (err instanceof Error) {
					console.error("Failed to refresh token:", err.message);
				}

				return error(500);
			}
		})
		.post("/logout", async ({ cookie: { userRefreshToken } }) => {
			if (userRefreshToken.value !== undefined) {
				userRefreshToken.remove();
			}

			return new Response("Succesfuly Logged Out", {
				status: 204
			});
		})
		.put("/refresh-access-token", async ({ oauth2, cookie, error }) => {
			try {
				if (cookie.userRefreshToken.value !== undefined) {
					await oauth2.refresh(
						"Google",
						cookie.userRefreshToken.value
					);

					return new Response("Token refreshed", {
						status: 204
					});
				} else {
					console.error("No refresh token found");
					return error(400);
				}
			} catch (err) {
				if (err instanceof Error) {
					console.error("Failed to refresh token:", err.message);
				}

				return error(500);
			}
		})
		.put(
			"/revoke-refresh-token",
			async ({ oauth2, error, cookie: { userRefreshToken } }) => {
				try {
					if (userRefreshToken.value !== undefined) {
						await oauth2.revoke("Google", userRefreshToken.value);

						userRefreshToken.remove();

						return new Response("Refresh token revoked", {
							status: 204
						});
					} else {
						console.error("No refresh token found");
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
		.put(
			"/revoke-access-token",
			async ({ oauth2, error, cookie: { userRefreshToken } }) => {
				try {
					if (userRefreshToken.value === undefined) {
						console.error("No refresh token found");
						return error(400);
					}

					const tokens = await oauth2.refresh(
						"Google",
						userRefreshToken.value
					);

					const accessToken = tokens.accessToken();

					if (!accessToken) {
						console.error("No access token found");
						return error(400);
					}

					await oauth2.revoke("Google", accessToken);

					return new Response("Access token revoked", {
						status: 204
					});
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
