# elysia-oauth2

<div align="center">

[![npm](https://img.shields.io/npm/v/elysia-oauth2?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/elysia-oauth2)
[![npm downloads](https://img.shields.io/npm/dw/elysia-oauth2?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/elysia-oauth2)

<!-- [![JSR](https://jsr.io/badges/elysia-oauth2)](https://jsr.io/elysia-oauth2)
[![JSR Score](https://jsr.io/badges/elysia-oauth2/score)](https://jsr.io/elysia-oauth2) -->

</div>

[Elysia](https://elysiajs.com/) plugin for [OAuth 2.0](https://en.wikipedia.org/wiki/OAuth) Authorization Flow.

Powered by [Arctic](https://arctic.js.org/) with more than **48** oauth2 providers!

## Installation

```bash
bun install elysia-oauth2 arctic
```

### Update

if [Arctic](https://arctic.js.org/) will release some new providers, you can update it with

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
        const token = await oauth2.authorize("VK");

        // send request to API with token
    })
    .listen(3001);
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
                "https://example.com/auth/Google/callback",
            ],
        })
    )
    .get("/auth/google", async ({ oauth2, redirect }) => {
        const url = await oauth2.createURL("Google");
        url.searchParams.set("access_type", "offline");

        return redirect(url.href);
    })
    .get("/auth/google/callback", async ({ oauth2 }) => {
        const token = await oauth2.authorize("Google");

        // send request to API with token
    })
    .listen(3001);
```

## Supported providers

-   42 School
-   Amazon Cognito
-   AniList
-   Apple
-   Atlassian
-   Auth0
-   Authentik
-   Bitbucket
-   Box
-   Coinbase
-   Discord
-   Dribbble
-   Dropbox
-   Facebook
-   Figma
-   Github
-   GitLab
-   Google
-   Intuit
-   Kakao
-   Keycloak
-   Lichess
-   Line
-   Linear
-   LinkedIn
-   Microsoft Entra ID
-   MyAnimeList
-   Notion
-   Okta
-   osu!
-   Patreon
-   Reddit
-   Roblox
-   Salesforce
-   Shikimori
-   Slack
-   Spotify
-   Strava
-   Tiltify
-   Tumblr
-   Twitch
-   Twitter
-   VK
-   WorkOS
-   Yahoo
-   Yandex
-   Zoom
