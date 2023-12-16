export class Oauth2Error extends Error {
    error_description: string;

    constructor({error, error_description}: {error: string; error_description: string}) {
        super()
        this.message = error;
        this.error_description = error_description;
        
    }
}
