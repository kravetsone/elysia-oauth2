import Elysia from 'elysia'

export interface Auth2Options {
  client: {
    id: string
    secret: string
  }
  redirectURI: string
  responseType?: 'code'
  state?: string
}

export interface ProviderOptions {
  authorizationURI: string
  accessTokenURI: string
}

export class Auth2Provider {
  constructor() {}
}
