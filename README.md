# elysia-oauth2

<div align="center">

[![npm](https://img.shields.io/npm/v/elysia-oauth2?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/elysia-oauth2)
[![npm downloads](https://img.shields.io/npm/dw/elysia-oauth2?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/elysia-oauth2)

<!-- [![JSR](https://jsr.io/badges/elysia-oauth2)](https://jsr.io/elysia-oauth2)
[![JSR Score](https://jsr.io/badges/elysia-oauth2/score)](https://jsr.io/elysia-oauth2) -->

</div>

[Elysia](https://elysiajs.com/) plugin for [OAuth 2.0](https://en.wikipedia.org/wiki/OAuth) Authorization Flow.

Powered by [Arctic@2](https://arcticjs.dev/) with more than **53** oauth2 providers!

## Installation

```bash
bun install elysia-oauth2 arctic
```

### Update

if [Arctic](https://arcticjs.dev/) will release some new providers, you can update it with

```bash
bun install arctic@latest
```

## Example

```ts
import { Elysia } from "elysia";
import { oauth2 } from "elysia-oauth2";

new Elysia()
    .use(
        oauth2({
            VK: [
                "clientID",
                "clientSecret",
                "https://example.com/auth/vk/callback",
            ],
        })
    )
    .get("/auth/vk", ({ oauth2 }) => oauth2.redirect("VK"))
    .get("/auth/vk/callback", async ({ oauth2 }) => {
        const tokens = await oauth2.authorize("VK");

        const accessToken = tokens.accessToken();

        // send request to API with token
    })
    .listen(3000);
```

> [!IMPORTANT]
> You should return `oauth2.redirect` from the handler, because it relies on elysia's [redirect()](https://elysiajs.com/essential/handler.html#redirect) which need to return `Response`

### CreateURL example

```ts
import { Elysia } from "elysia";
import { oauth2 } from "elysia-oauth2";

new Elysia()
    .use(
        oauth2({
            Google: [
                "clientID",
                "clientSecret",
                "https://example.com/auth/google/callback",
            ],
        })
    )
    .get("/auth/google", async ({ oauth2, redirect }) => {
        const url = oauth2.createURL("Google", ["email"]);
        url.searchParams.set("access_type", "offline");

        return redirect(url.href);
    })
    .get("/auth/google/callback", async ({ oauth2 }) => {
        const tokens = await oauth2.authorize("Google");

        const accessToken = tokens.accessToken();

        // send request to API with token
    })
    .listen(3000);
```

## Options

You can configure plugin by providing options object in second argument.

```ts
import { Elysia } from "elysia";
import { oauth2 } from "elysia-oauth2";

new Elysia().use(
    oauth2(
        {},
        {
            cookie: {
                // defaults
                secure: true,
                sameSite: "lax",
                path: "/",
                httpOnly: true,
                maxAge: 60 * 30, // 30 min
            },
        }
    )
);
```

## Supported providers

-   [42 School](https://arcticjs.dev/providers/42)
-   [Amazon Cognito](https://arcticjs.dev/providers/amazon-cognito)
-   [AniList](https://arcticjs.dev/providers/anilist)
-   [Apple](https://arcticjs.dev/providers/apple)
-   [Atlassian](https://arcticjs.dev/providers/atlassian)
-   [Auth0](https://arcticjs.dev/providers/auth0)
-   [Authentik](https://arcticjs.dev/providers/authentik)
-   [Bitbucket](https://arcticjs.dev/providers/bitbucket)
-   [Box](https://arcticjs.dev/providers/box)
-   [Bungie](https://arcticjs.dev/providers/bungie)
-   [Coinbase](https://arcticjs.dev/providers/coinbase)
-   [Discord](https://arcticjs.dev/providers/discord)
-   [Dribbble](https://arcticjs.dev/providers/dribbble)
-   [Dropbox](https://arcticjs.dev/providers/dropbox)
-   [Epic Games](https://arcticjs.dev/providers/epicgames)
-   [Etsy](https://arcticjs.dev/providers/etsy)
-   [Facebook](https://arcticjs.dev/providers/facebook)
-   [Figma](https://arcticjs.dev/providers/figma)
-   [GitHub](https://arcticjs.dev/providers/github)
-   [GitLab](https://arcticjs.dev/providers/gitlab)
-   [Google](https://arcticjs.dev/providers/google)
-   [Intuit](https://arcticjs.dev/providers/intuit)
-   [Kakao](https://arcticjs.dev/providers/kakao)
-   [KeyCloak](https://arcticjs.dev/providers/keycloak)
-   [Lichess](https://arcticjs.dev/providers/lichess)
-   [Line](https://arcticjs.dev/providers/line)
-   [Linear](https://arcticjs.dev/providers/linear)
-   [LinkedIn](https://arcticjs.dev/providers/linkedin)
-   [Microsoft Entra ID](https://arcticjs.dev/providers/microsoft-entra-id)
-   [MyAnimeList](https://arcticjs.dev/providers/myanimelist)
-   [Naver](https://arcticjs.dev/providers/naver)
-   [Notion](https://arcticjs.dev/providers/notion)
-   [Okta](https://arcticjs.dev/providers/okta)
-   [osu!](https://arcticjs.dev/providers/osu)
-   [Patreon](https://arcticjs.dev/providers/patreon)
-   [Polar](https://arcticjs.dev/providers/polar)
-   [Reddit](https://arcticjs.dev/providers/reddit)
-   [Roblox](https://arcticjs.dev/providers/roblox)
-   [Salesforce](https://arcticjs.dev/providers/salesforce)
-   [Shikimori](https://arcticjs.dev/providers/shikimori)
-   [Slack](https://arcticjs.dev/providers/slack)
-   [Spotify](https://arcticjs.dev/providers/spotify)
-   [Start.gg](https://arcticjs.dev/providers/startgg)
-   [Strava](https://arcticjs.dev/providers/strava)
-   [Tiltify](https://arcticjs.dev/providers/tiltify)
-   [Tumblr](https://arcticjs.dev/providers/tumblr)
-   [Twitch](https://arcticjs.dev/providers/twitch)
-   [Twitter](https://arcticjs.dev/providers/twitter)
-   [VK](https://arcticjs.dev/providers/vk)
-   [WorkOS](https://arcticjs.dev/providers/workos)
-   [Yahoo](https://arcticjs.dev/providers/yahoo)
-   [Yandex](https://arcticjs.dev/providers/yandex)
-   [Zoom](https://arcticjs.dev/providers/zoom)
