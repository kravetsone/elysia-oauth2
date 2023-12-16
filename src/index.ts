import Elysia, { t } from "elysia"
import { VKAuth2Provider } from "./providers"
import { Oauth2Error } from "./oauth2Error"

const providersMapper = {
    vk: VKAuth2Provider,
    kk: VKAuth2Provider
}

type TProviderNames = keyof typeof providersMapper
export interface ElysiaAuth2Options {
    providers: {
        [K in TProviderNames]?: ConstructorParameters<
            (typeof providersMapper)[K]
        >[0]
    }
}

export function oauth2(options: ElysiaAuth2Options) {
    const app = new Elysia({
        name: "elysia-oauth2",
    }).error({
      Oauth2Error
    }).derive(({ set }) => ({
        oauth2: {
            authorize: (
                providerName: keyof typeof options.providers,
                state?: string,
            ) => {
                const provider = new providersMapper[providerName](
                    options.providers[providerName],
                )
                set.redirect = provider.generateURI(state)
            },
            callback: (
              providerName: keyof typeof options.providers,
              code: string
          ) => {
              const provider = new providersMapper[providerName](
                  options.providers[providerName],
              )
              
              return provider.getAccessToken(code)
          },
        },
    }))
    for (const [key, value] of Object.entries(options.providers)) {
        //[INFO] [key: string] in method Object.entries break union types
        const providerName = key as TProviderNames
        const provider = new providersMapper[providerName](value)

        // [INFO] startRedirectPath is entrypoint
        if (provider.options.startRedirectPath)
            app.get(provider.options.startRedirectPath, ({ oauth2 }) =>
                oauth2.authorize(providerName),
            )
        if (provider.options.callbackPath)
            app.guard({
                query: t.Object({
                    code: t.String(),
                    state: t.Nullable(t.String())
                }, {
                  additionalProperties: true
                }),
            })
                .derive(async ({ query }) => {
                  console.log(query)
                    const accessTokenData = await provider.getAccessToken(query.code)
                    return { accessTokenData, state: query.state }
                })
                .get(
                    provider.options.callbackPath,
                    provider.options.onSuccess,
                )
    }
    return app
}
