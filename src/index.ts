import Elysia from 'elysia'
import { VKAuth2Provider } from './providers/vk'

export interface Auth2Options {
  host: string
  providers: {
    vk?: VKAuth2Provider
  }
}
export function auth2(options: Auth2Options) {
  const app = new Elysia()

  return app
}
