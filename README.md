# elysia-oauth2

Currently, if the provider has a **codeVerifier**, you have to work with it yourself.

Powered by [Arctic](https://arctic.js.org/) with more than 42 oauth2 providers!

## Installation

```bash
bun install elysia-oauth2
```

## Example

```ts
import { Elysia } from "elysia";
import { oauth2 } from "elysia-oauth2";

new Elysia()
    .use(
        oauth2({
            VK: ["clientID", "clientSecret", "RedirectURI"],
        })
    )
    .get("/auth/vk", ({ oauth2 }) => oauth2.redirect("VK"))
    .get("/auth/vk/callback", async ({ oauth2 }) => {
        const token = await oauth2.authorize("VK");

        // send request to API with token
    })
    .onError(console.error)
    .listen(3001);
```

## Supported providers

-   Amazon Cognito
-   AniList
-   Apple
-   Atlassian
-   Auth0
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
-   Slack
-   Spotify
-   Strava
-   Tumblr
-   Twitch
-   Twitter
-   VK
-   WorkOS
-   Yahoo
-   Yandex
-   Zoom
