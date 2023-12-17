import Elysia, { t } from "elysia"
import { Oauth2Error } from "./oauth2Error"
import {
    DiscordProvider,
    GoogleProvider,
    Provider,
    VKAuth2Provider,
} from "./providers"

const providersMapper = {
    vk: VKAuth2Provider,
    discord: DiscordProvider,
    google: GoogleProvider,
}

type TProviderNames = keyof typeof providersMapper

export interface ElysiaAuth2Options {
    providers: {
        [K in TProviderNames]?: ConstructorParameters<
            (typeof providersMapper)[K]
        >[0]
    }
}

// [TODO:] Implement unique state for def CSRF
export function oauth2<T extends ElysiaAuth2Options>(options: T) {
    const app = new Elysia({
        name: "elysia-oauth2",
    })
        .error({
            Oauth2Error,
        })
        .derive(({ set }) => ({
            oauth2: {
                authorize: <P extends keyof T["providers"]>(
                    providerName: P,
                    state?: string,
                ) => {
                    // [INFO] keyof T["providers"] is not union type...
                    const name = providerName as TProviderNames
                    if (!options.providers[name])
                        throw new Error(
                            `Please add ${name} provider options to oauth()`,
                        )

                    //@ts-expect-error [TODO] value is union type
                    const provider = new providersMapper[name](
                        options.providers[name]!,
                    )
                    set.redirect = provider.generateURI(state)
                },
                callback: (
                    providerName: keyof typeof options.providers,
                    code: string,
                ) => {
                    // [INFO] keyof T["providers"] is not union type...
                    const name = providerName as TProviderNames
                    if (!options.providers[name])
                        throw new Error(
                            `Please add ${name} provider options to oauth()`,
                        )

                    //@ts-expect-error [TODO] value is union type
                    const provider = new providersMapper[name](
                        options.providers[name]!,
                    )

                    return provider.getAccessToken(code)
                },
            },
        }))
    for (const [key, value] of Object.entries(options.providers)) {
        //[INFO] [key: string] in method Object.entries break union types
        const providerName = key as TProviderNames
        //@ts-expect-error [TODO] value is union type
        const provider = new providersMapper[providerName](value) as Provider

        // [INFO] startRedirectPath is entrypoint
        if (provider.options.startRedirectPath)
            app.get(provider.options.startRedirectPath, ({ oauth2 }) =>
                oauth2.authorize(providerName),
            )
        if (provider.options.callback.path)
            app.guard({
                query: t.Object(
                    {
                        code: t.String(),
                        state: t.Nullable(t.String()),
                    },
                    {
                        additionalProperties: true,
                    },
                ),
            })
                .derive(async ({ query }) => {
                    const accessTokenData = await provider.getAccessToken(
                        query.code,
                    )

                    return { accessTokenData, state: query.state }
                })
                .get(
                    provider.options.callback.path,
                    provider.options.callback.onSuccess,
                )
    }
    return app
}
