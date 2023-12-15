import Elysia, { t } from "elysia"
import { VKAuth2Provider } from "./providers"

const providersMapper = {
    vk: VKAuth2Provider,
}

type TProviderNames = keyof typeof providersMapper
export interface Auth2Options {
    host: string
    providers: {
        [K in TProviderNames]: ConstructorParameters<
            (typeof providersMapper)[K]
        >[0]
    }
}

export function oauth2(options: Auth2Options) {
    const app = new Elysia({
        name: "elysia-oauth2",
    }).derive(({ set }) => ({
        auth2: {
            authorize: (
                providerName: keyof typeof options.providers,
                state?: any,
            ) => {
                const provider = new providersMapper[providerName](
                    options.providers[providerName],
                )
                set.redirect = provider.generateURI(
                    state
                        ? decodeURIComponent(JSON.stringify(state))
                        : undefined,
                )
            },
        },
    }))
    for (const [key, value] of Object.entries(options.providers)) {
        //[INFO] [key: string] in method Object.entries break union types
        const providerName = key as TProviderNames
        const provider = new providersMapper[providerName](value)

        // [INFO] startRedirectPath is entrypoint
        if (provider.options.startRedirectPath)
            app.get(provider.options.startRedirectPath, ({ auth2, query }) =>
                auth2.authorize(providerName, query),
            )
        if (provider.options.callbackPath)
            app.get(
                provider.options.callbackPath,
                async ({ query }) => {
                    console.log(query)
                    const data = await provider.getAccessToken(query.code)
                    console.log(data)
                    return 1
                },
                {
                    query: t.Object({
                        code: t.String(),
                    }),
                },
            )
    }
    return app
}
