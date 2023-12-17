export class Oauth2Error extends Error {
    description: string

    constructor({
        error,
        error_description: description,
    }: {
        error: string
        error_description: string
    }) {
        console.log(error, description)
        super()
        this.message = error
        this.description = description
    }
}
